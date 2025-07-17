/**
 * Health Assistant Components
 * Modular UI components for the health assistant feature
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Heart,
  Brain,
  Shield,
  Users,
  Calendar,
  Download,
  Share2
} from 'lucide-react';
import { 
  EmergencyFlag, 
  HealthRecommendation, 
  TestResult, 
  ExtractedReportData,
  HealthInquiry 
} from '@/app/types';

interface EmergencyAlertProps {
  flags: EmergencyFlag[];
  onDismiss?: () => void;
}

export function EmergencyAlert({ flags, onDismiss }: EmergencyAlertProps) {
  if (!flags.length) return null;

  const criticalFlags = flags.filter(flag => flag.severity === 'critical');
  const highFlags = flags.filter(flag => flag.severity === 'high');

  return (
    <Alert className="border-red-500 bg-red-50 dark:bg-red-950 mb-4">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="font-semibold text-red-800 dark:text-red-200">
            ⚠️ Emergency Situation Detected
          </div>
          
          {criticalFlags.map((flag, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>{flag.type}:</strong> {flag.description}
              </p>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                <strong>Immediate Action:</strong> {flag.immediateAction}
              </p>
              {flag.contactInfo && (
                <p className="text-sm text-red-600 dark:text-red-300">
                  <strong>Contact:</strong> {flag.contactInfo}
                </p>
              )}
            </div>
          ))}
          
          <div className="flex space-x-2 mt-3">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              Call Emergency Services
            </Button>
            {onDismiss && (
              <Button variant="outline" size="sm" onClick={onDismiss}>
                I Understand
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface RecommendationCardProps {
  recommendations: HealthRecommendation[];
}

export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  if (!recommendations.length) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Activity className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-blue-600" />
          <span>Health Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <Badge className={getPriorityColor(rec.priority)}>
                  {getPriorityIcon(rec.priority)}
                  <span className="ml-1 capitalize">{rec.priority}</span>
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {rec.type.replace('_', ' ')}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                {rec.description}
              </p>
              
              {rec.timeframe && (
                <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{rec.timeframe}</span>
                </div>
              )}
              
              {rec.additionalInfo && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {rec.additionalInfo}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ReportSummaryProps {
  reportData: ExtractedReportData;
}

export function ReportSummary({ reportData }: ReportSummaryProps) {
  const abnormalResults = reportData.testResults.filter(result => result.isAbnormal);
  const normalResults = reportData.testResults.filter(result => !result.isAbnormal);
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-green-600" />
          <span>Report Analysis Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Report Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-600 dark:text-slate-400">Report Type:</span>
              <p className="capitalize">{reportData.reportType.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="font-medium text-slate-600 dark:text-slate-400">Test Date:</span>
              <p>{reportData.testDate?.toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-slate-600 dark:text-slate-400">Laboratory:</span>
              <p>{reportData.laboratoryName}</p>
            </div>
            <div>
              <span className="font-medium text-slate-600 dark:text-slate-400">Physician:</span>
              <p>{reportData.physicianName}</p>
            </div>
          </div>

          <Separator />

          {/* Test Results Overview */}
          <div>
            <h4 className="font-medium mb-3">Test Results Overview</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{normalResults.length}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Normal Results</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{abnormalResults.length}</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Abnormal Results</div>
              </div>
            </div>
            
            {abnormalResults.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-orange-700 dark:text-orange-300">
                  Abnormal Results Requiring Attention:
                </h5>
                {abnormalResults.map((result, index) => (
                  <div key={index} className="bg-orange-50 dark:bg-orange-950 p-2 rounded border-l-4 border-orange-500">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{result.testName}</span>
                      <Badge variant="secondary" className={result.severity === 'severe' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                        {result.severity || 'Abnormal'}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Value: {result.value} {result.unit} (Normal: {result.normalRange})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Critical Values */}
          {reportData.criticalValues && reportData.criticalValues.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-red-600">Critical Values</h4>
              <div className="space-y-2">
                {reportData.criticalValues.map((critical, index) => (
                  <Alert key={index} className="border-red-500 bg-red-50 dark:bg-red-950">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">{critical.testName}</div>
                      <div>Value: {critical.value} (Critical threshold: {critical.criticalThreshold})</div>
                      <div className="font-medium mt-1">Action: {critical.immediateAction}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Observations and Recommendations */}
          {reportData.observations && reportData.observations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Clinical Observations</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-400">
                {reportData.observations.map((obs, index) => (
                  <li key={index}>{obs}</li>
                ))}
              </ul>
            </div>
          )}

          {reportData.recommendations && reportData.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-400">
                {reportData.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Download Report
            </Button>
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4 mr-1" />
              Share with Doctor
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule Follow-up
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AnalyticsDashboardProps {
  userId: string;
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  // Mock analytics data
  const analytics = {
    totalInquiries: 47,
    emergencyDetections: 2,
    averageResponseTime: 1.8,
    satisfactionRating: 4.7,
    recentTrends: [
      { category: 'Symptom Checks', count: 23, trend: 'up' },
      { category: 'Report Analysis', count: 15, trend: 'up' },
      { category: 'Medication Info', count: 9, trend: 'stable' }
    ]
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.totalInquiries}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.emergencyDetections}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Emergency Detections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.averageResponseTime}s</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.satisfactionRating}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Satisfaction Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    trend.trend === 'up' ? 'bg-green-100 text-green-600' :
                    trend.trend === 'down' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {trend.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                     trend.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                     <Activity className="h-4 w-4" />}
                  </div>
                  <span className="font-medium">{trend.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{trend.count}</div>
                  <div className="text-xs text-slate-500">This month</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const Separator = () => <div className="border-t border-slate-200 dark:border-slate-700" />;
