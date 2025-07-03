"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Settings, 
  RefreshCw, 
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
  QrCode,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import type { WidgetConfig } from '@/app/utils/widgets';
import type { UniversalMedicalID } from '@/app/types';
import { generateUMIDQRData } from '@/app/utils/umid';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface WidgetDetailsModalProps {
  widget: WidgetConfig;
  umid: UniversalMedicalID | null;
  onClose: () => void;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
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
};

export function WidgetDetailsModal({ widget, umid, onClose, onUpdate }: WidgetDetailsModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const IconComponent = iconMap[widget.icon as keyof typeof iconMap] || Calendar;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const generateQRCode = async () => {
    if (!umid) return;
    
    try {
      const qrData = await generateUMIDQRData(umid);
      setQrCodeUrl(qrData);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const getDetailedContent = () => {
    switch (widget.type) {
      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Upcoming Appointments</h4>
              <div className="space-y-2">
                {[
                  { doctor: 'Dr. Sarah Smith', specialty: 'Cardiology', date: 'Tomorrow, 2:00 PM', type: 'Follow-up' },
                  { doctor: 'Dr. John Doe', specialty: 'General Practice', date: 'Friday, 10:30 AM', type: 'Check-up' },
                  { doctor: 'Dr. Emily Johnson', specialty: 'Dermatology', date: 'Next Monday, 3:15 PM', type: 'Consultation' }
                ].map((appointment, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{appointment.doctor}</div>
                        <div className="text-sm text-muted-foreground">{appointment.specialty}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{appointment.type}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">{appointment.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'medical_records':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                <div className="text-xl font-bold text-emerald-600">12</div>
                <div className="text-xs text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-xl font-bold text-blue-600">3</div>
                <div className="text-xs text-muted-foreground">Lab Results</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-xl font-bold text-purple-600">2</div>
                <div className="text-xs text-muted-foreground">Imaging</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Recent Records</h4>
              <div className="space-y-2">
                {[
                  { type: 'Lab Result', title: 'Complete Blood Count', date: '2 days ago', status: 'Normal' },
                  { type: 'Imaging', title: 'Chest X-Ray', date: '1 week ago', status: 'Clear' },
                  { type: 'Consultation', title: 'Annual Physical', date: '2 weeks ago', status: 'Complete' }
                ].map((record, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{record.title}</div>
                        <div className="text-sm text-muted-foreground">{record.type} • {record.date}</div>
                      </div>
                      <Badge variant="secondary">{record.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'vital_signs':
        const chartData = {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Blood Pressure (Systolic)',
              data: [120, 118, 122, 125, 119, 121, 120],
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Heart Rate',
              data: [72, 75, 68, 70, 74, 71, 72],
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
            }
          ],
        };

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-xl font-bold text-red-600">120/80</div>
                <div className="text-sm text-muted-foreground">Blood Pressure</div>
                <div className="text-xs text-green-600 mt-1">Normal</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-xl font-bold text-green-600">72 bpm</div>
                <div className="text-sm text-muted-foreground">Heart Rate</div>
                <div className="text-xs text-green-600 mt-1">Normal</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">7-Day Trend</h4>
              <div className="h-64">
                <Line 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }} 
                />
              </div>
            </div>
          </div>
        );

      case 'umid_status':
        return (
          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg">
              <Shield className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Universal Medical ID</h3>
              <p className="text-muted-foreground">
                {umid ? `ID: ${umid.umidNumber}` : 'No UMID configured'}
              </p>
              {umid && (
                <Badge 
                  variant={umid.isActive ? "default" : "destructive"}
                  className="mt-2"
                >
                  {umid.isActive ? 'Active & Secure' : 'Inactive'}
                </Badge>
              )}
            </div>

            {umid && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold">
                      {umid.issueDate.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Issue Date</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold">
                      {umid.accessHistory.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Access Count</div>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={generateQRCode} 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </Button>
                  
                  {qrCodeUrl && (
                    <div className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border">
                      <img 
                        src={qrCodeUrl} 
                        alt="UMID QR Code" 
                        className="mx-auto w-48 h-48"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This QR code expires in 5 minutes for security
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="text-center p-8">
              <IconComponent className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{widget.title}</h3>
              <p className="text-muted-foreground">{widget.description}</p>
            </div>
          </div>
        );
    }
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
        className="w-full max-w-3xl max-h-[85vh] overflow-hidden"
      >
        <Card className="h-full">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <IconComponent className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{widget.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{widget.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-y-auto max-h-[calc(85vh-120px)]">
            <div className="p-6">
              {isRefreshing ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600 mb-4" />
                    <p className="text-muted-foreground">Updating widget data...</p>
                  </div>
                </div>
              ) : (
                getDetailedContent()
              )}

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border"
                  >
                    <h4 className="font-medium mb-3">Widget Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto-refresh</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onUpdate({ 
                            refreshInterval: widget.refreshInterval ? 0 : 300000 
                          })}
                        >
                          {widget.refreshInterval ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Widget size</span>
                        <select 
                          value={widget.size}
                          onChange={(e) => onUpdate({ size: e.target.value as any })}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button 
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Done
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
