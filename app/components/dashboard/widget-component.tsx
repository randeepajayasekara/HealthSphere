"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  Shield, 
  Heart, 
  Bell, 
  Video, 
  Brain, 
  TestTube, 
  Clock,
  MoreVertical,
  RefreshCw,
  Eye,
  Settings,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Receipt,
  CreditCard,
  Building2,
  DollarSign
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WidgetConfig } from '@/app/utils/widgets';
import type { UniversalMedicalID } from '@/app/types';

interface WidgetComponentProps {
  widget: WidgetConfig;
  umid: UniversalMedicalID | null;
  onEdit: () => void;
  onRemove: () => void;
  onClick: () => void;
  isDragging?: boolean;
  screenWidth?: number;
  isCompactMode?: boolean;
}

const iconMap = {
  Calendar,
  FileText,
  Pill,
  Activity,
  Shield,
  Heart,
  Bell,
  Video,
  Brain,
  TestTube,
  Clock,
  Receipt,
  CreditCard,
  Building2,
  DollarSign,
};

export function WidgetComponent({ 
  widget, 
  umid, 
  onEdit, 
  onRemove, 
  onClick, 
  isDragging = false,
  screenWidth = 1200,
  isCompactMode = false
}: WidgetComponentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(widget.lastUpdated);
  
  const IconComponent = iconMap[widget.icon as keyof typeof iconMap] || Calendar;

  // Determine if we should show compact view
  const isCompact = isCompactMode || screenWidth < 768;
  const isMobile = screenWidth < 640;
  
  // Adapt widget height based on compact mode
  const adaptiveHeight = isCompact ? 'h-32' : isMobile ? 'h-36' : 'h-40';

  // Mock data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    setLastUpdate(new Date());
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getWidgetContent = (isCompact = false, isMobile = false) => {
    const textSize = isMobile ? 'text-xs' : isCompact ? 'text-sm' : 'text-base';
    const titleSize = isMobile ? 'text-sm' : isCompact ? 'text-base' : 'text-lg';
    const spacing = isMobile ? 'space-y-1' : isCompact ? 'space-y-2' : 'space-y-3';
    
    switch (widget.type) {
      case 'appointments':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>3</span>
              <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
            </div>
            <div className={`${isMobile ? 'space-y-1' : 'space-y-2'} min-w-0`}>
              <div className={`flex items-center justify-between ${textSize} min-w-0`}>
                <span className="text-muted-foreground truncate flex-1 min-w-0">
                  {isCompact ? 'Next' : 'Next: Dr. Smith'}
                </span>
                <Badge variant="secondary" className={`ml-2 flex-shrink-0 ${isMobile ? 'text-xs' : ''}`}>
                  Tomorrow
                </Badge>
              </div>
              {!isCompact && (
                <div className={`flex items-center justify-between ${textSize} min-w-0`}>
                  <span className="text-muted-foreground truncate flex-1 min-w-0">Upcoming this week</span>
                  <span className="font-medium ml-2 flex-shrink-0">2 more</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'medical_records':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-600">12</span>
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            </div>
            <div className={`${isMobile ? 'space-y-1' : 'space-y-2'} min-w-0`}>
              <div className={`${textSize} text-muted-foreground truncate`}>
                Latest: Blood Test Results
              </div>
              <div className={`${textSize} text-muted-foreground truncate`}>
                Last updated: 2 days ago
              </div>
            </div>
          </div>
        );

      case 'prescriptions':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">5</span>
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            </div>
            <div className={`${isMobile ? 'space-y-1' : 'space-y-2'} min-w-0`}>
              <div className={`${textSize} text-muted-foreground truncate`}>
                2 refills needed
              </div>
              <div className={`${textSize} text-muted-foreground truncate`}>
                Next dose: Metformin in 4h
              </div>
            </div>
          </div>
        );

      case 'vital_signs':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center min-w-0">
                <div className={`${titleSize} font-bold text-red-600 truncate`}>120/80</div>
                <div className="text-xs text-muted-foreground">BP</div>
              </div>
              <div className="text-center min-w-0">
                <div className={`${titleSize} font-bold text-green-600 truncate`}>72</div>
                <div className="text-xs text-muted-foreground">HR</div>
              </div>
            </div>
            <div className={`${textSize} text-muted-foreground truncate`}>
              All vitals normal
            </div>
          </div>
        );

      case 'umid_status':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <Badge 
                variant={umid?.isActive ? "default" : "destructive"}
                className={`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 ${isMobile ? 'text-xs' : ''} flex-shrink-0`}
              >
                {umid?.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Shield className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-600 flex-shrink-0`} />
            </div>
            <div className={`${textSize} text-muted-foreground truncate`}>
              {umid ? `ID: ${umid.umidNumber.slice(-8)}...` : 'No UMID'}
            </div>
          </div>
        );
      case 'health_summary':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className={`${titleSize} font-bold text-emerald-600`}>Good</span>
              <Heart className="w-5 h-5 text-red-500 flex-shrink-0" />
            </div>
            <div className={`space-y-1 ${textSize} min-w-0`}>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Sleep</span>
                <span className="text-green-600 ml-2 truncate">7.5h</span>
              </div>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Steps</span>
                <span className="text-blue-600 ml-2 truncate">8,547</span>
              </div>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Water</span>
                <span className="text-cyan-600 ml-2 truncate">1.8L</span>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">3</span>
              <Bell className="w-4 h-4 text-orange-500 flex-shrink-0" />
            </div>
            <div className={`${isMobile ? 'space-y-1' : 'space-y-2'} min-w-0`}>
              <div className={`${textSize} min-w-0`}>
                <div className="font-medium truncate">Appointment Reminder</div>
                <div className="text-muted-foreground truncate">Tomorrow at 2:00 PM</div>
              </div>
            </div>
          </div>
        );

      case 'billing_overview':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className={`${titleSize} font-bold text-green-600`}>$2,450</span>
              <Receipt className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-600 flex-shrink-0`} />
            </div>
            <div className={`space-y-1 ${textSize} min-w-0`}>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Paid</span>
                <span className="text-green-600 ml-2 truncate">$1,850</span>
              </div>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Pending</span>
                <span className="text-orange-600 ml-2 truncate">$600</span>
              </div>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Overdue</span>
                <span className="text-red-600 ml-2 truncate">$0</span>
              </div>
            </div>
          </div>
        );

      case 'payment_tracker':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className={`${titleSize} font-bold text-blue-600`}>85%</span>
              <CreditCard className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600 flex-shrink-0`} />
            </div>
            <div className={`space-y-1 ${textSize} min-w-0`}>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">This Month</span>
                <span className="text-blue-600 ml-2 truncate">$3,200</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        );

      case 'insurance_claims':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className={`${titleSize} font-bold text-purple-600`}>12</span>
              <Building2 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-purple-600 flex-shrink-0`} />
            </div>
            <div className={`space-y-1 ${textSize} min-w-0`}>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Approved</span>
                <span className="text-green-600 ml-2 truncate">8</span>
              </div>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Pending</span>
                <span className="text-orange-600 ml-2 truncate">3</span>
              </div>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Denied</span>
                <span className="text-red-600 ml-2 truncate">1</span>
              </div>
            </div>
          </div>
        );

      case 'financial_summary':
        return (
          <div className={`${spacing} min-w-0`}>
            <div className="flex items-center justify-between">
              <span className={`${titleSize} font-bold text-emerald-600`}>+12%</span>
              <DollarSign className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-600 flex-shrink-0`} />
            </div>
            <div className={`space-y-1 ${textSize} min-w-0`}>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">Revenue</span>
                <span className="text-emerald-600 ml-2 truncate">$45,230</span>
              </div>
              <div className="flex justify-between items-center min-w-0">
                <span className="text-muted-foreground flex-shrink-0">vs Last Month</span>
                <span className="text-emerald-600 ml-2 truncate">↑ $4,820</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${spacing} min-w-0`}>
            <div className={`${textSize} text-muted-foreground truncate`}>
              {widget.description}
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging ? 1.05 : 1,
        rotateZ: isDragging ? 2 : 0
      }}
      whileHover={{ scale: isDragging ? 1.05 : 1.02 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      className={`
        h-full cursor-pointer group
        ${isDragging ? 'shadow-2xl' : 'shadow-sm hover:shadow-md'}
        transition-all duration-200
      `}
      onClick={onClick}
    >
      <Card className={`${adaptiveHeight} bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-700 transition-colors overflow-hidden`}>
        <CardHeader className="pb-3 px-3 sm:px-4">
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                <IconComponent className="w-4 h-4 text-red-600" />
              </div>
              <CardTitle className="text-sm font-medium truncate min-w-0">
                {widget.title}
              </CardTitle>
            </div>
            
            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRefresh(); }}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="text-red-600 dark:text-red-400"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-3 sm:px-4 pb-3 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            {getWidgetContent(isCompact, isMobile)}
          </div>
          
          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">Updated {getTimeAgo(lastUpdate)}</span>
              {isRefreshing && (
                <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
