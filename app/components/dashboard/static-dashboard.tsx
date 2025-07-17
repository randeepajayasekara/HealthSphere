"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/contexts/auth-context';
import { DashboardService } from '@/lib/firestore/dashboard-services';
import { appointmentService } from '@/lib/firestore/patient-services';
import { StaticWidgetComponent } from './static-widget-component';
import { AddWidgetPanel } from './add-widget-panel';
import type { WidgetConfig } from '@/app/utils/widgets';
import type { UniversalMedicalID } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, Settings, Loader2, RefreshCw } from 'lucide-react';
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

interface StaticDashboardProps {
  layout: DashboardLayout;
  umid: UniversalMedicalID | null;
  onLayoutChange: (layout: DashboardLayout) => void;
}

interface WidgetData {
  appointments: any[];
  medicalRecords: any[];
  prescriptions: any[];
  vitalSigns: any[];
  labResults: any[];
  notifications: any[];
  [key: string]: any;
}

// Auto-organize widgets to fill gaps and optimize layout
function organizeWidgets(widgets: WidgetConfig[], screenWidth: number): WidgetConfig[] {
  const organized = [...widgets].sort((a, b) => {
    // Priority order: high importance widgets first
    const priorityOrder = {
      'notifications': 1,
      'vital_signs': 2,
      'appointments': 3,
      'medication_reminders': 4,
      'umid_status': 5,
      'health_summary': 6,
      'prescriptions': 7,
      'medical_records': 8,
      'lab_results': 9,
      'telemedicine': 10,
      'ai_assistant': 11
    };
    
    const aPriority = priorityOrder[a.type as keyof typeof priorityOrder] || 99;
    const bPriority = priorityOrder[b.type as keyof typeof priorityOrder] || 99;
    
    return aPriority - bPriority;
  });

  // Auto-assign sizes based on content importance and screen size
  return organized.map((widget, index) => ({
    ...widget,
    size: getAutoSize(widget.type, screenWidth, index)
  }));
}

function getAutoSize(type: string, screenWidth: number, priority: number): 'small' | 'medium' | 'large' | 'extra-large' {
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth < 1024;
  
  // High priority widgets get larger sizes
  if (priority < 3) {
    if (isMobile) return 'medium';
    if (isTablet) return 'medium';
    return 'large';
  }
  
  // Medium priority widgets
  if (priority < 6) {
    if (isMobile) return 'small';
    if (isTablet) return 'medium';
    return 'medium';
  }
  
  // Lower priority widgets stay small
  return 'small';
}

function getGridClasses(screenWidth: number): string {
  if (screenWidth < 640) {
    return 'grid-cols-1 sm:grid-cols-2 gap-3'; // Mobile: 1-2 columns
  } else if (screenWidth < 768) {
    return 'grid-cols-2 sm:grid-cols-3 gap-3'; // Small tablet: 2-3 columns
  } else if (screenWidth < 1024) {
    return 'grid-cols-3 md:grid-cols-4 gap-4'; // Tablet: 3-4 columns
  } else if (screenWidth < 1280) {
    return 'grid-cols-4 lg:grid-cols-5 gap-4'; // Laptop: 4-5 columns
  } else {
    return 'grid-cols-5 xl:grid-cols-6 gap-4'; // Desktop: 5-6 columns
  }
}

function getWidgetSpanClass(size: string, screenWidth: number): string {
  const isMobile = screenWidth < 768;
  
  if (isMobile) {
    // On mobile, all widgets take similar space to prevent layout issues
    switch (size) {
      case 'extra-large':
      case 'large':
        return 'col-span-2 row-span-2';
      case 'medium':
        return 'col-span-1 row-span-1';
      case 'small':
      default:
        return 'col-span-1 row-span-1';
    }
  }
  
  // Desktop sizing
  switch (size) {
    case 'extra-large':
      return 'col-span-2 row-span-2 lg:col-span-3 lg:row-span-2';
    case 'large':
      return 'col-span-2 row-span-2';
    case 'medium':
      return 'col-span-1 row-span-1 md:col-span-2';
    case 'small':
    default:
      return 'col-span-1 row-span-1';
  }
}

export function StaticDashboard({ layout, umid, onLayoutChange }: StaticDashboardProps) {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [widgetData, setWidgetData] = useState<WidgetData>({
    appointments: [],
    medicalRecords: [],
    prescriptions: [],
    vitalSigns: [],
    labResults: [],
    notifications: []
  });
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 1200, height: 800 });
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-organize widgets when layout or screen size changes
  useEffect(() => {
    const organizedWidgets = organizeWidgets(layout.widgets, screenSize.width);
    setWidgets(organizedWidgets);
  }, [layout.widgets, screenSize.width]);

  // Load real data for widgets
  useEffect(() => {
    if (!user || !umid) return;

    loadWidgetData();
    
    // Set up auto-refresh interval
    const refreshInterval = setInterval(() => {
      loadWidgetData();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user, umid]);

  const loadWidgetData = async () => {
    if (!user || !umid) return;

    try {
      setIsRefreshing(true);

      // Mock data for demonstration - replace with real API calls
      const [
        appointments,
        medicalRecords,
        prescriptions,
        vitalSigns,
        labResults,
        notifications
      ] = await Promise.all([
        appointmentService.getPatientAppointments(user.id),
        // Mock calls that will return empty arrays for now
        Promise.resolve([]),
        Promise.resolve([]),
        Promise.resolve([]),
        Promise.resolve([]),
        Promise.resolve([])
      ]);

      setWidgetData({
        appointments,
        medicalRecords,
        prescriptions,
        vitalSigns,
        labResults,
        notifications
      });

    } catch (error) {
      console.error('Error loading widget data:', error);
      // Could add a simple alert or console message instead of toast
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshData = () => {
    loadWidgetData();
  };

  const saveLayoutChanges = async (newWidgets: WidgetConfig[]) => {
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
      
      console.log("Layout updated successfully");
      
    } catch (error) {
      console.error('Failed to save layout changes:', error);
      alert("Failed to save layout changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWidget = (newWidget: WidgetConfig) => {
    const newWidgets = [...widgets, newWidget];
    const organizedWidgets = organizeWidgets(newWidgets, screenSize.width);
    setWidgets(organizedWidgets);
    saveLayoutChanges(organizedWidgets);
    setShowAddPanel(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    const organizedWidgets = organizeWidgets(newWidgets, screenSize.width);
    setWidgets(organizedWidgets);
    saveLayoutChanges(organizedWidgets);
  };

  const handleAutoOrganize = () => {
    const organizedWidgets = organizeWidgets(widgets, screenSize.width);
    setWidgets(organizedWidgets);
    saveLayoutChanges(organizedWidgets);
  };

  const visibleWidgets = widgets.filter(w => w.isVisible);

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Dashboard Controls */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          {isRefreshing && (
            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="bg-white dark:bg-zinc-900"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPanel(true)}
            className="bg-white dark:bg-zinc-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
          
          <Dialog open={showLayoutSettings} onOpenChange={setShowLayoutSettings}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-zinc-900"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dashboard Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use a more condensed layout for widgets
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={compactMode}
                      onCheckedChange={setCompactMode}
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
                          handleAutoOrganize();
                          setShowLayoutSettings(false);
                        }}
                        className="justify-start"
                      >
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Auto-organize Widgets
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className={`
          grid auto-rows-fr transition-all duration-300
          ${getGridClasses(screenSize.width)}
          ${compactMode ? 'gap-2' : ''}
        `}
      >
        <AnimatePresence>
          {visibleWidgets.map((widget, index) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: "easeOut" 
              }}
              className={`
                ${getWidgetSpanClass(widget.size, screenSize.width)}
                relative
              `}
            >
              <StaticWidgetComponent
                widget={widget}
                umid={umid}
                data={widgetData[widget.type as keyof WidgetData] || []}
                onRemove={() => handleRemoveWidget(widget.id)}
                screenWidth={screenSize.width}
                isCompactMode={compactMode}
                isRefreshing={isRefreshing}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
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

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
              <p className="text-lg font-medium">Saving changes...</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
