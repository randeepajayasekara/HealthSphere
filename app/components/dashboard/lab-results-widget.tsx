'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TestTube, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  BarChart3,
  RefreshCw
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Services and Types
import { labResultsService, type LabResultSummary } from '@/lib/firestore/lab-results-services';
import type { LabResult, UserRole } from '@/app/types';

// Hooks
import { useAuth } from '@/app/contexts/auth-context';

// Date utilities
import { format, isToday, isYesterday, subDays } from 'date-fns';

interface LabResultsWidgetProps {
  className?: string;
  variant?: 'compact' | 'detailed';
  maxResults?: number;
  showTrends?: boolean;
}

const LabResultsWidget: React.FC<LabResultsWidgetProps> = ({
  className = '',
  variant = 'detailed',
  maxResults = 5,
  showTrends = true
}) => {
  const { user } = useAuth();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [summary, setSummary] = useState<LabResultSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadLabResultsData();
    }
  }, [user?.id]);

  const loadLabResultsData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [resultsData, summaryData] = await Promise.all([
        labResultsService.getPatientLabResults(user.id, {}, undefined, maxResults),
        labResultsService.getLabResultsSummary(user.id)
      ]);

      setLabResults(resultsData.results);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading lab results widget data:', err);
      setError('Failed to load lab results');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (result: LabResult) => {
    const hasAbnormal = result.resultValues?.some(value => value.isAbnormal) || false;
    const hasCritical = result.resultValues?.some(value => 
      value.isAbnormal && typeof value.value === 'number' && Math.abs(value.value) > 100
    ) || false;

    if (hasCritical) {
      return {
        color: 'destructive' as const,
        icon: AlertTriangle,
        text: 'Critical',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      };
    } else if (hasAbnormal) {
      return {
        color: 'secondary' as const,
        icon: AlertTriangle,
        text: 'Abnormal',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
      };
    } else {
      return {
        color: 'default' as const,
        icon: CheckCircle,
        text: 'Normal',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      };
    }
  };

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Error Loading Lab Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={loadLabResultsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5 text-red-600" />
            <span>Lab Results</span>
          </CardTitle>
          <CardDescription>
            {summary ? `${summary.totalTests} total tests` : 'Your latest lab results'}
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={loadLabResultsData}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats (Detailed variant only) */}
        {variant === 'detailed' && summary && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                {summary.totalTests - summary.abnormalResults}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500">Normal</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                {summary.abnormalResults}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-500">Abnormal</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-lg font-semibold text-red-700 dark:text-red-400">
                {summary.criticalValues}
              </div>
              <div className="text-xs text-red-600 dark:text-red-500">Critical</div>
            </div>
          </div>
        )}

        {/* Recent Results */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Recent Results</h4>
            {labResults.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                View All
              </Button>
            )}
          </div>

          {labResults.length > 0 ? (
            <ScrollArea className={variant === 'compact' ? 'h-32' : 'h-48'}>
              <div className="space-y-2">
                {labResults.map((result, index) => {
                  const status = getStatusDisplay(result);
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50 ${status.bgColor}`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <StatusIcon className={`w-4 h-4 flex-shrink-0 ${
                          status.color === 'destructive' ? 'text-red-500' :
                          status.color === 'secondary' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground truncate">
                            {result.testName}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{getDateDisplay(result.testDate)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={status.color}
                        className="ml-2 flex-shrink-0"
                      >
                        {status.text}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <TestTube className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent lab results</p>
            </div>
          )}
        </div>

        {/* Trends Section (Detailed variant only) */}
        {variant === 'detailed' && showTrends && summary && summary.commonTests.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground">Common Tests</h4>
              <Button variant="ghost" size="sm" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                Trends
              </Button>
            </div>
            <div className="space-y-2">
              {summary.commonTests.slice(0, 3).map((testName, index) => (
                <div key={testName} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{testName}</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <TestTube className="w-4 h-4 mr-2" />
              View All
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              Trends
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabResultsWidget;

// Export for dashboard registration
export const LabResultsWidgetConfig = {
  id: 'lab-results-widget',
  name: 'Lab Results',
  description: 'View recent laboratory test results and summaries',
  component: LabResultsWidget,
  defaultProps: {
    variant: 'detailed',
    maxResults: 5,
    showTrends: true
  },
  availableRoles: ['patient', 'doctor', 'nurse', 'admin'] as UserRole[],
  category: 'medical',
  refreshInterval: 300000, // 5 minutes
  sizes: {
    small: { width: 1, height: 1 },
    medium: { width: 2, height: 2 },
    large: { width: 2, height: 3 }
  }
};
