/**
 * Dashboard widget utilities for HealthSphere
 * Handles widget management, drag-and-drop, and widget data
 */

import { generateSecureId } from './security';

export type WidgetType = 
  | 'appointments' 
  | 'medical_records' 
  | 'prescriptions' 
  | 'vital_signs' 
  | 'umid_status' 
  | 'health_summary' 
  | 'notifications' 
  | 'telemedicine' 
  | 'ai_assistant'
  | 'lab_results'
  | 'medication_reminders';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
  minSize?: {
    w: number;
    h: number;
  };
  maxSize?: {
    w: number;
    h: number;
  };
  refreshInterval?: number; // in milliseconds
  lastUpdated: Date;
  data?: any;
  settings?: Record<string, any>;
  // Adaptive properties
  responsive?: {
    breakpoints: {
      sm?: Partial<WidgetConfig>;
      md?: Partial<WidgetConfig>;
      lg?: Partial<WidgetConfig>;
      xl?: Partial<WidgetConfig>;
    };
  };
  priority?: 'high' | 'medium' | 'low'; // For adaptive layout ordering
  adaptiveFeatures?: {
    autoResize?: boolean;
    contextualData?: boolean;
    smartPositioning?: boolean;
  };
}

export interface DashboardLayout {
  id: string;
  patientId: string;
  name: string;
  widgets: WidgetConfig[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetData {
  [key: string]: any;
}

/**
 * Default widget configurations
 */
export const DEFAULT_WIDGET_CONFIGS: Record<WidgetType, Omit<WidgetConfig, 'id' | 'lastUpdated'>> = {
  appointments: {
    type: 'appointments',
    title: 'Upcoming Appointments',
    description: 'View and manage your appointments',
    icon: 'Calendar',
    size: 'medium',
    position: { x: 0, y: 0, w: 2, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 2, h: 2 },
    refreshInterval: 300000, // 5 minutes
    settings: {
      showUpcoming: true,
      maxItems: 5,
      showReminders: true
    }
  },
  medical_records: {
    type: 'medical_records',
    title: 'Medical Records',
    description: 'Access your medical history',
    icon: 'FileText',
    size: 'medium',
    position: { x: 2, y: 0, w: 2, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 2, h: 2 },
    refreshInterval: 600000, // 10 minutes
    settings: {
      showRecent: true,
      maxItems: 10,
      categories: ['lab_results', 'imaging', 'consultations']
    }
  },
  prescriptions: {
    type: 'prescriptions',
    title: 'Active Prescriptions',
    description: 'View current and past prescriptions',
    icon: 'Pill',
    size: 'medium',
    position: { x: 0, y: 2, w: 2, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 2, h: 2 },
    refreshInterval: 300000, // 5 minutes
    settings: {
      showActive: true,
      showRefillReminders: true,
      maxItems: 8
    }
  },
  vital_signs: {
    type: 'vital_signs',
    title: 'Vital Signs',
    description: 'Track your vital signs over time',
    icon: 'Activity',
    size: 'large',
    position: { x: 2, y: 2, w: 3, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 2, h: 2 },
    refreshInterval: 1800000, // 30 minutes
    settings: {
      showCharts: true,
      timeRange: '7d',
      vitals: ['blood_pressure', 'heart_rate', 'temperature', 'weight']
    }
  },
  umid_status: {
    type: 'umid_status',
    title: 'UMID Status',
    description: 'Your Universal Medical ID status',
    icon: 'Shield',
    size: 'small',
    position: { x: 5, y: 0, w: 1, h: 1 },
    isVisible: true,
    isResizable: false,
    isDraggable: true,
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 2 },
    refreshInterval: 60000, // 1 minute
    settings: {
      showQR: false,
      showTOTP: false,
      autoRefresh: true
    }
  },
  health_summary: {
    type: 'health_summary',
    title: 'Health Summary',
    description: 'Overview of your health status',
    icon: 'Heart',
    size: 'large',
    position: { x: 0, y: 4, w: 4, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 3, h: 2 },
    refreshInterval: 600000, // 10 minutes
    settings: {
      showConditions: true,
      showAllergies: true,
      showMedications: true,
      showAlerts: true
    }
  },
  notifications: {
    type: 'notifications',
    title: 'Notifications',
    description: 'Recent notifications and alerts',
    icon: 'Bell',
    size: 'medium',
    position: { x: 4, y: 4, w: 2, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 2, h: 1 },
    refreshInterval: 60000, // 1 minute
    settings: {
      showUnread: true,
      maxItems: 10,
      categories: ['appointments', 'medications', 'lab_results', 'system']
    }
  },
  telemedicine: {
    type: 'telemedicine',
    title: 'Telemedicine',
    description: 'Virtual consultation status',
    icon: 'Video',
    size: 'medium',
    position: { x: 4, y: 0, w: 2, h: 1 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 2, h: 1 },
    refreshInterval: 300000, // 5 minutes
    settings: {
      showScheduled: true,
      showHistory: false,
      maxItems: 3
    }
  },
  ai_assistant: {
    type: 'ai_assistant',
    title: 'AI Health Assistant',
    description: 'Get health insights and answers',
    icon: 'Brain',
    size: 'medium',
    position: { x: 0, y: 6, w: 3, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 2, h: 2 },
    refreshInterval: 0, // On-demand only
    settings: {
      enableChat: true,
      showSuggestions: true,
      autoAnalyze: false
    }
  },
  lab_results: {
    type: 'lab_results',
    title: 'Recent Lab Results',
    description: 'View your latest test results',
    icon: 'TestTube',
    size: 'medium',
    position: { x: 3, y: 6, w: 3, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 2, h: 2 },
    refreshInterval: 600000, // 10 minutes
    settings: {
      showCritical: true,
      showTrends: true,
      maxItems: 5
    }
  },
  medication_reminders: {
    type: 'medication_reminders',
    title: 'Medication Reminders',
    description: 'Track your medication schedule',
    icon: 'Clock',
    size: 'small',
    position: { x: 5, y: 1, w: 1, h: 2 },
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    minSize: { w: 1, h: 2 },
    refreshInterval: 60000, // 1 minute
    settings: {
      showUpcoming: true,
      showMissed: true,
      reminderWindow: 30 // minutes
    }
  }
};

/**
 * Create a new widget instance
 */
export const createWidget = (type: WidgetType, overrides?: Partial<WidgetConfig>): WidgetConfig => {
  const defaultConfig = DEFAULT_WIDGET_CONFIGS[type];
  
  return {
    id: generateSecureId(),
    ...defaultConfig,
    lastUpdated: new Date(),
    ...overrides
  };
};

/**
 * Create default dashboard layout for new patients
 */
export const createDefaultDashboardLayout = (patientId: string): DashboardLayout => {
  const defaultWidgets: WidgetType[] = [
    'umid_status',
    'appointments',
    'prescriptions', 
    'health_summary',
    'notifications',
    'medication_reminders'
  ];

  const widgets = defaultWidgets.map(type => createWidget(type));

  return {
    id: generateSecureId(),
    patientId,
    name: 'Default Layout',
    widgets,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Update widget position and size
 */
export const updateWidgetLayout = (
  widgets: WidgetConfig[],
  widgetId: string,
  updates: Partial<WidgetConfig>
): WidgetConfig[] => {
  return widgets.map(widget => 
    widget.id === widgetId 
      ? { ...widget, ...updates, lastUpdated: new Date() }
      : widget
  );
};

/**
 * Add new widget to dashboard
 */
export const addWidgetToDashboard = (
  layout: DashboardLayout,
  widgetType: WidgetType,
  position?: { x: number; y: number }
): DashboardLayout => {
  const newWidget = createWidget(widgetType);
  
  if (position) {
    newWidget.position.x = position.x;
    newWidget.position.y = position.y;
  }
  
  return {
    ...layout,
    widgets: [...layout.widgets, newWidget],
    updatedAt: new Date()
  };
};

/**
 * Remove widget from dashboard
 */
export const removeWidgetFromDashboard = (
  layout: DashboardLayout,
  widgetId: string
): DashboardLayout => {
  return {
    ...layout,
    widgets: layout.widgets.filter(widget => widget.id !== widgetId),
    updatedAt: new Date()
  };
};

/**
 * Toggle widget visibility
 */
export const toggleWidgetVisibility = (
  layout: DashboardLayout,
  widgetId: string
): DashboardLayout => {
  return {
    ...layout,
    widgets: layout.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, isVisible: !widget.isVisible, lastUpdated: new Date() }
        : widget
    ),
    updatedAt: new Date()
  };
};

/**
 * Update widget data
 */
export const updateWidgetData = (
  layout: DashboardLayout,
  widgetId: string,
  data: any
): DashboardLayout => {
  return {
    ...layout,
    widgets: layout.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, data, lastUpdated: new Date() }
        : widget
    ),
    updatedAt: new Date()
  };
};

/**
 * Check if widget needs data refresh
 */
export const shouldRefreshWidget = (widget: WidgetConfig): boolean => {
  if (!widget.refreshInterval || widget.refreshInterval === 0) {
    return false;
  }
  
  const timeSinceUpdate = Date.now() - widget.lastUpdated.getTime();
  return timeSinceUpdate >= widget.refreshInterval;
};

/**
 * Get widgets that need refresh
 */
export const getWidgetsNeedingRefresh = (widgets: WidgetConfig[]): WidgetConfig[] => {
  return widgets.filter(shouldRefreshWidget);
};

/**
 * Adaptive Widget Utilities
 */

/**
 * Get responsive widget configuration based on screen size
 */
export const getResponsiveWidgetConfig = (
  widget: WidgetConfig,
  breakpoint: 'sm' | 'md' | 'lg' | 'xl'
): WidgetConfig => {
  if (!widget.responsive?.breakpoints[breakpoint]) {
    return widget;
  }

  const responsiveConfig = widget.responsive.breakpoints[breakpoint];
  return {
    ...widget,
    ...responsiveConfig,
    position: {
      ...widget.position,
      ...responsiveConfig?.position
    }
  };
};

/**
 * Auto-adjust widget layout based on screen size
 */
export const getAdaptiveLayout = (
  widgets: WidgetConfig[],
  screenWidth: number
): WidgetConfig[] => {
  let breakpoint: 'sm' | 'md' | 'lg' | 'xl';
  
  if (screenWidth < 640) breakpoint = 'sm';
  else if (screenWidth < 1024) breakpoint = 'md';
  else if (screenWidth < 1280) breakpoint = 'lg';
  else breakpoint = 'xl';

  // Sort by priority for mobile stacking
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return widgets
    .map(widget => getResponsiveWidgetConfig(widget, breakpoint))
    .sort((a, b) => {
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      return aPriority - bPriority;
    });
};

/**
 * Smart positioning for new widgets
 */
export const getOptimalPosition = (
  existingWidgets: WidgetConfig[],
  newWidgetSize: { w: number; h: number },
  gridCols: number = 12
): { x: number; y: number } => {
  const occupiedSpaces = new Set<string>();
  
  // Mark occupied grid spaces
  existingWidgets.forEach(widget => {
    for (let x = widget.position.x; x < widget.position.x + widget.position.w; x++) {
      for (let y = widget.position.y; y < widget.position.y + widget.position.h; y++) {
        occupiedSpaces.add(`${x},${y}`);
      }
    }
  });

  // Find optimal position
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x <= gridCols - newWidgetSize.w; x++) {
      let canPlace = true;
      
      // Check if space is available
      for (let dx = 0; dx < newWidgetSize.w && canPlace; dx++) {
        for (let dy = 0; dy < newWidgetSize.h && canPlace; dy++) {
          if (occupiedSpaces.has(`${x + dx},${y + dy}`)) {
            canPlace = false;
          }
        }
      }
      
      if (canPlace) {
        return { x, y };
      }
    }
  }
  
  // Fallback to bottom
  const maxY = Math.max(...existingWidgets.map(w => w.position.y + w.position.h), 0);
  return { x: 0, y: maxY };
};

/**
 * Auto-compact layout to remove gaps
 */
export const compactLayout = (widgets: WidgetConfig[]): WidgetConfig[] => {
  const sorted = [...widgets].sort((a, b) => {
    if (a.position.y !== b.position.y) return a.position.y - b.position.y;
    return a.position.x - b.position.x;
  });

  const compacted: WidgetConfig[] = [];
  
  sorted.forEach(widget => {
    const optimalPos = getOptimalPosition(compacted, {
      w: widget.position.w,
      h: widget.position.h
    });
    
    compacted.push({
      ...widget,
      position: {
        ...widget.position,
        x: optimalPos.x,
        y: optimalPos.y
      }
    });
  });

  return compacted;
};

/**
 * Get contextual widget suggestions based on user activity
 */
export const getContextualWidgets = (
  userRole: string,
  timeOfDay: number,
  recentActivity: string[]
): WidgetType[] => {
  const suggestions: WidgetType[] = [];
  
  // Morning suggestions (6-12)
  if (timeOfDay >= 6 && timeOfDay < 12) {
    suggestions.push('medication_reminders', 'appointments');
  }
  
  // Afternoon suggestions (12-18)
  if (timeOfDay >= 12 && timeOfDay < 18) {
    suggestions.push('telemedicine', 'lab_results');
  }
  
  // Evening suggestions (18-22)
  if (timeOfDay >= 18 && timeOfDay < 22) {
    suggestions.push('health_summary', 'prescriptions');
  }
  
  // Based on recent activity
  if (recentActivity.includes('prescription')) {
    suggestions.push('medication_reminders', 'prescriptions');
  }
  
  if (recentActivity.includes('appointment')) {
    suggestions.push('appointments', 'telemedicine');
  }
  
  return [...new Set(suggestions)];
};
