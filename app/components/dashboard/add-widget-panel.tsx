"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Plus, 
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
  CreditCard,
  Receipt,
  Building2,
  DollarSign
} from 'lucide-react';
import { createWidget, type WidgetConfig, type WidgetType } from '@/app/utils/widgets';

interface AddWidgetPanelProps {
  onAddWidget: (widget: WidgetConfig) => void;
  onClose: () => void;
  existingWidgets: WidgetConfig[];
}

const availableWidgetTypes: Array<{
  type: WidgetType;
  title: string;
  description: string;
  icon: any;
  category: string;
  color: string;
  premium?: boolean;
}> = [
  {
    type: 'appointments',
    title: 'Appointments',
    description: 'View and manage your upcoming appointments',
    icon: Calendar,
    category: 'Health Management',
    color: 'text-blue-600'
  },
  {
    type: 'medical_records',
    title: 'Medical Records',
    description: 'Access your medical history and reports',
    icon: FileText,
    category: 'Health Management',
    color: 'text-emerald-600'
  },
  {
    type: 'prescriptions',
    title: 'Prescriptions',
    description: 'Track current and past prescriptions',
    icon: Pill,
    category: 'Health Management',
    color: 'text-purple-600'
  },
  {
    type: 'vital_signs',
    title: 'Vital Signs',
    description: 'Monitor your health metrics over time',
    icon: Activity,
    category: 'Health Monitoring',
    color: 'text-red-600'
  },
  {
    type: 'umid_status',
    title: 'UMID Status',
    description: 'Your Universal Medical ID status and controls',
    icon: Shield,
    category: 'Security',
    color: 'text-red-600'
  },
  {
    type: 'health_summary',
    title: 'Health Summary',
    description: 'Overview of your overall health status',
    icon: Heart,
    category: 'Health Monitoring',
    color: 'text-pink-600'
  },
  {
    type: 'notifications',
    title: 'Notifications',
    description: 'Recent alerts and system notifications',
    icon: Bell,
    category: 'Communication',
    color: 'text-orange-600'
  },
  {
    type: 'telemedicine',
    title: 'Telemedicine',
    description: 'Virtual consultation management',
    icon: Video,
    category: 'Communication',
    color: 'text-green-600'
  },
  {
    type: 'ai_assistant',
    title: 'AI Health Assistant',
    description: 'Get AI-powered health insights and recommendations',
    icon: Brain,
    category: 'AI & Analytics',
    color: 'text-indigo-600',
    premium: true
  },
  {
    type: 'lab_results',
    title: 'Lab Results',
    description: 'View and track your laboratory test results',
    icon: TestTube,
    category: 'Health Monitoring',
    color: 'text-cyan-600'
  },
  {
    type: 'medication_reminders',
    title: 'Medication Reminders',
    description: 'Never miss a dose with smart reminders',
    icon: Clock,
    category: 'Health Management',
    color: 'text-amber-600'
  },
  {
    type: 'billing_overview',
    title: 'Billing Overview',
    description: 'View your bills, payments, and outstanding amounts',
    icon: Receipt,
    category: 'Financial',
    color: 'text-red-600'
  },
  {
    type: 'payment_tracker',
    title: 'Payment Tracker',
    description: 'Track payment history and upcoming due dates',
    icon: CreditCard,
    category: 'Financial',
    color: 'text-emerald-600'
  },
  {
    type: 'insurance_claims',
    title: 'Insurance Claims',
    description: 'Monitor your insurance claims and coverage',
    icon: Building2,
    category: 'Financial',
    color: 'text-blue-600'
  },
  {
    type: 'financial_summary',
    title: 'Financial Summary',
    description: 'Complete overview of your healthcare expenses',
    icon: DollarSign,
    category: 'Financial',
    color: 'text-zinc-600'
  }
];

export function AddWidgetPanel({ onAddWidget, onClose, existingWidgets }: AddWidgetPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', ...Array.from(new Set(availableWidgetTypes.map(w => w.category)))];
  
  const existingWidgetTypes = new Set(existingWidgets.map(w => w.type));
  
  const filteredWidgets = availableWidgetTypes.filter(widget => {
    if (selectedCategory !== 'All' && widget.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleAddWidget = (widgetType: WidgetType) => {
    const newWidget = createWidget(widgetType);
    onAddWidget(newWidget);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[80vh] overflow-hidden"
      >
        <Card className="h-full border-red-200 dark:border-red-800">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Add Widget</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Choose a widget to add to your dashboard
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWidgets.map((widget, index) => {
                const isAdded = existingWidgetTypes.has(widget.type);
                const IconComponent = widget.icon;
                
                return (
                  <motion.div
                    key={widget.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`
                        relative cursor-pointer transition-all duration-200
                        hover:shadow-lg hover:border-red-300 dark:hover:border-red-700
                        ${isAdded ? 'opacity-60' : ''}
                      `}
                      onClick={() => !isAdded && handleAddWidget(widget.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${widget.color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-sm truncate">
                                {widget.title}
                              </h3>
                              {widget.premium && (
                                <Badge variant="secondary" className="text-xs">
                                  Premium
                                </Badge>
                              )}
                              {isAdded && (
                                <Badge variant="outline" className="text-xs">
                                  Added
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {widget.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {widget.category}
                              </Badge>
                              
                              {!isAdded && (
                                <Button 
                                  size="sm" 
                                  className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddWidget(widget.type);
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filteredWidgets.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No widgets found
                </h3>
                <p className="text-muted-foreground">
                  Try selecting a different category or check back later for new widgets.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
