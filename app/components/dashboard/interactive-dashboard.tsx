"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { useAuth } from '@/app/contexts/auth-context';
import { DashboardService } from '@/lib/firestore/dashboard-services';
import { 
  updateWidgetLayout, 
  getWidgetsNeedingRefresh,
  getAdaptiveLayout,
  compactLayout,
  getOptimalPosition
} from '@/app/utils/widgets';
import { WidgetComponent } from './widget-component';
import { AddWidgetPanel } from './add-widget-panel';
import { WidgetDetailsModal } from './widget-details-modal';
import type { WidgetConfig } from '@/app/utils/widgets';
import type { UniversalMedicalID } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, Settings, Maximize2, Minimize2, X } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface DashboardLayout {
  id: string;
  patientId: string;
  name: string;
  widgets: WidgetConfig[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface InteractiveDashboardProps {
  layout: DashboardLayout;
  umid: UniversalMedicalID | null;
  onLayoutChange: (layout: DashboardLayout) => void;
}

interface SortableWidgetProps {
  widget: WidgetConfig;
  onEdit: (widget: WidgetConfig) => void;
  onRemove: (widgetId: string) => void;
  onClick: (widget: WidgetConfig) => void;
  umid: UniversalMedicalID | null;
  screenWidth: number;
  isCompactMode: boolean;
}

function SortableWidget({ widget, onEdit, onRemove, onClick, umid, screenWidth, isCompactMode }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node);
        ref(node);
      }}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: inView ? 1 : 0.7, 
        scale: inView ? 1 : 0.95,
        y: inView ? 0 : 20
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        ${getWidgetSizeClass(widget.size, screenWidth)}
        ${isDragging ? 'z-50' : 'z-0'}
        relative group
      `}
      {...attributes}
      {...listeners}
    >
      <WidgetComponent
        widget={widget}
        umid={umid}
        onEdit={() => onEdit(widget)}
        onRemove={() => onRemove(widget.id)}
        onClick={() => onClick(widget)}
        isDragging={isDragging}
        screenWidth={screenWidth}
        isCompactMode={isCompactMode}
      />
    </motion.div>
  );
}

function getWidgetSizeClass(size: string, screenWidth: number): string {
  // More intelligent adaptive sizing based on screen width and widget importance
  if (screenWidth < 640) { // Mobile - prioritize visibility
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-2 row-span-1'; // Wider but shorter on mobile
      case 'large':
        return 'col-span-2 row-span-2'; 
      case 'extra-large':
        return 'col-span-2 row-span-2'; // Same as large on mobile
      default:
        return 'col-span-2 row-span-1';
    }
  } else if (screenWidth < 768) { // Small tablet
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-2 row-span-1';
      case 'large':
        return 'col-span-3 row-span-2';
      case 'extra-large':
        return 'col-span-4 row-span-2'; // Wider on tablet
      default:
        return 'col-span-2 row-span-1';
    }
  } else if (screenWidth < 1024) { // Tablet
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-2 row-span-2';
      case 'large':
        return 'col-span-3 row-span-2';
      case 'extra-large':
        return 'col-span-4 row-span-3';
      default:
        return 'col-span-2 row-span-2';
    }
  } else { // Desktop - full flexibility
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-2 row-span-2';
      case 'large':
        return 'col-span-3 row-span-2';
      case 'extra-large':
        return 'col-span-4 row-span-3';
      default:
        return 'col-span-2 row-span-2';
    }
  }
}

export function InteractiveDashboard({ layout, umid, onLayoutChange }: InteractiveDashboardProps) {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(layout.widgets);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 1200, height: 800 });
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle screen size changes for adaptive layout
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply adaptive layout when screen size changes
  useEffect(() => {
    const adaptiveWidgets = getAdaptiveLayout(layout.widgets, screenSize.width);
    setWidgets(adaptiveWidgets);
  }, [layout.widgets, screenSize.width]);

  // Auto-refresh widgets that need it
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const widgetsToRefresh = getWidgetsNeedingRefresh(widgets);
      if (widgetsToRefresh.length > 0) {
        // Trigger refresh for widgets that need it
        widgetsToRefresh.forEach(widget => {
          // This would trigger the widget's data refresh
          console.log(`Refreshing widget: ${widget.type}`);
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [widgets]);

  // Save layout changes to Firestore
  const saveLayoutChanges = useCallback(async (newWidgets: WidgetConfig[]) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await DashboardService.updateWidgetPositions(layout.id, newWidgets, user.id);
      
      const updatedLayout = {
        ...layout,
        widgets: newWidgets,
        updatedAt: new Date()
      };
      
      onLayoutChange(updatedLayout);
    } catch (error) {
      console.error('Failed to save layout changes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, layout, onLayoutChange]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(widget => widget.id === active.id);
      const newIndex = widgets.findIndex(widget => widget.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newWidgets = arrayMove(widgets, oldIndex, newIndex);
        setWidgets(newWidgets);
        saveLayoutChanges(newWidgets);
      }
    }
  };

  const handleWidgetEdit = (widget: WidgetConfig) => {
    setSelectedWidget(widget);
  };

  const handleWidgetRemove = async (widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(newWidgets);
    await saveLayoutChanges(newWidgets);
  };

  const handleWidgetClick = (widget: WidgetConfig) => {
    setSelectedWidget(widget);
  };

  const handleAddWidget = (newWidget: WidgetConfig) => {
    // Use smart positioning for new widgets
    const optimalPosition = getOptimalPosition(widgets, {
      w: newWidget.position.w,
      h: newWidget.position.h
    });
    
    const widgetWithOptimalPosition = {
      ...newWidget,
      position: {
        ...newWidget.position,
        x: optimalPosition.x,
        y: optimalPosition.y
      }
    };
    
    const newWidgets = [...widgets, widgetWithOptimalPosition];
    setWidgets(newWidgets);
    saveLayoutChanges(newWidgets);
    setShowAddPanel(false);
  };

  const handleAutoArrange = () => {
    const adaptiveWidgets = getAdaptiveLayout(widgets, screenSize.width);
    setWidgets(adaptiveWidgets);
    saveLayoutChanges(adaptiveWidgets);
  };

  const activeWidget = widgets.find(widget => widget.id === activeId);

  return (
    <div className="w-full">
      {/* Dashboard Controls */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-end mb-6"
      >
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPanel(true)}
            className="bg-white dark:bg-zinc-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCompactMode(!isCompactMode)}
            className="bg-white dark:bg-zinc-900"
          >
            {isCompactMode ? <Maximize2 className="w-4 h-4 mr-2" /> : <Minimize2 className="w-4 h-4 mr-2" />}
            {isCompactMode ? 'Expand' : 'Compact'}
          </Button>
          
          <Dialog open={showLayoutSettings} onOpenChange={setShowLayoutSettings}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-zinc-900"
              >
                <Settings className="w-4 h-4 mr-2" />
                Layout
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Layout Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Show widgets in a smaller, more condensed layout
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={isCompactMode}
                      onCheckedChange={setIsCompactMode}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label>Quick Actions</Label>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleAutoArrange();
                          setShowLayoutSettings(false);
                        }}
                        className="justify-start"
                      >
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Auto-arrange Widgets
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddPanel(true);
                          setShowLayoutSettings(false);
                        }}
                        className="justify-start"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Widget
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Widgets Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className={`
              grid gap-3 sm:gap-4 auto-rows-fr transition-all duration-300
              ${screenSize.width < 640 
                ? 'grid-cols-2 min-h-[120px]' // Mobile: 2 columns, minimum height
                : screenSize.width < 768
                ? 'grid-cols-3 min-h-[140px]' // Small tablet: 3 columns
                : screenSize.width < 1024
                ? 'grid-cols-4 min-h-[160px]' // Tablet: 4 columns  
                : screenSize.width < 1280
                ? 'grid-cols-6 min-h-[180px]' // Laptop: 6 columns
                : 'grid-cols-8 min-h-[200px]' // Desktop: 8 columns
              }
            `}
          >
            <AnimatePresence>
              {widgets
                .filter(widget => widget.isVisible)
                .map((widget) => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onEdit={handleWidgetEdit}
                    onRemove={handleWidgetRemove}
                    onClick={handleWidgetClick}
                    umid={umid}
                    screenWidth={screenSize.width}
                    isCompactMode={isCompactMode}
                  />
                ))}
            </AnimatePresence>
          </motion.div>
        </SortableContext>

          <DragOverlay>
            {activeWidget ? (
              <div className="transform rotate-3 shadow-2xl">
                <WidgetComponent
                  widget={activeWidget}
                  umid={umid}
                  onEdit={() => {}}
                  onRemove={() => {}}
                  onClick={() => {}}
                  isDragging={true}
                  screenWidth={screenSize.width}
                  isCompactMode={isCompactMode}
                />
              </div>
            ) : null}
          </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {widgets.filter(w => w.isVisible).length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No widgets added yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Add your first widget to get started with your personalized dashboard
          </p>
          <Button onClick={() => setShowAddPanel(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Widget
          </Button>
        </motion.div>
      )}

      {/* Add Widget Panel */}
      <AnimatePresence>
        {showAddPanel && (
          <AddWidgetPanel
            onAddWidget={handleAddWidget}
            onClose={() => setShowAddPanel(false)}
            existingWidgets={widgets}
          />
        )}
      </AnimatePresence>

      {/* Widget Details Modal */}
      <AnimatePresence>
        {selectedWidget && (
          <WidgetDetailsModal
            widget={selectedWidget}
            umid={umid}
            onClose={() => setSelectedWidget(null)}
            onUpdate={(updatedWidget) => {
              const newWidgets = updateWidgetLayout(widgets, selectedWidget.id, updatedWidget);
              setWidgets(newWidgets);
              saveLayoutChanges(newWidgets);
              setSelectedWidget(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Layout Settings Dialog */}
      <AnimatePresence>
        {showLayoutSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowLayoutSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dashboard Layout</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLayoutSettings(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Compact Mode</label>
                  <Switch
                    checked={isCompactMode}
                    onCheckedChange={setIsCompactMode}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Actions</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const compactedWidgets = compactLayout(widgets);
                        setWidgets(compactedWidgets);
                        saveLayoutChanges(compactedWidgets);
                      }}
                    >
                      Auto-arrange
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddPanel(true)}
                    >
                      Add Widget
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Screen: {screenSize.width}×{screenSize.height} | 
                    Grid: {screenSize.width < 640 ? '2' : screenSize.width < 1024 ? '4' : screenSize.width < 1280 ? '6' : '8'} columns
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
