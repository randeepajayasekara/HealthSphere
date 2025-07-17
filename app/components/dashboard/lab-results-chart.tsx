'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Services and Types
import { labResultsService, type LabResultsTrend } from '@/lib/firestore/lab-results-services';
import type { UserRole } from '@/app/types';

// Date utilities
import { format, subMonths } from 'date-fns';

interface LabResultsChartProps {
  patientId: string;
  testName?: string;
  className?: string;
  height?: number;
  showControls?: boolean;
  timeRange?: 3 | 6 | 12 | 24;
}

interface ChartDataPoint {
  date: string;
  value: number;
  isAbnormal: boolean;
  normalMin?: number;
  normalMax?: number;
  formattedDate: string;
}

const LabResultsChart: React.FC<LabResultsChartProps> = ({
  patientId,
  testName,
  className = '',
  height = 300,
  showControls = true,
  timeRange: defaultTimeRange = 6
}) => {
  const [trendData, setTrendData] = useState<LabResultsTrend | null>(null);
  const [availableTests, setAvailableTests] = useState<string[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>(testName || '');
  const [timeRange, setTimeRange] = useState<number>(defaultTimeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      loadAvailableTests();
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId && selectedTest) {
      loadTrendData();
    }
  }, [patientId, selectedTest, timeRange]);

  const loadAvailableTests = async () => {
    try {
      // Get recent lab results to find available tests
      const { results } = await labResultsService.getPatientLabResults(patientId, {}, undefined, 50);
      const tests = [...new Set(results.map(result => result.testName))];
      setAvailableTests(tests);
      
      if (!selectedTest && tests.length > 0) {
        setSelectedTest(tests[0]);
      }
    } catch (err) {
      console.error('Error loading available tests:', err);
    }
  };

  const loadTrendData = async () => {
    if (!patientId || !selectedTest) return;

    setLoading(true);
    setError(null);

    try {
      const trend = await labResultsService.getLabResultsTrend(patientId, selectedTest, timeRange);
      setTrendData(trend);
    } catch (err) {
      console.error('Error loading trend data:', err);
      setError('Failed to load trend data');
    } finally {
      setLoading(false);
    }
  };

  // Process data for chart
  const chartData = useMemo(() => {
    if (!trendData) return [];

    return trendData.values.map(point => ({
      date: format(point.date, 'yyyy-MM-dd'),
      value: point.value,
      isAbnormal: point.isAbnormal,
      formattedDate: format(point.date, 'MMM dd, yyyy'),
      // Add reference lines for normal ranges if available
      normalMin: 0, // This would come from the lab normal ranges
      normalMax: 100 // This would come from the lab normal ranges
    }));
  }, [trendData]);

  // Get trend analysis
  const getTrendAnalysis = () => {
    if (!trendData || trendData.values.length < 2) return null;

    const recent = trendData.values.slice(-3);
    const earlier = trendData.values.slice(0, -3);
    
    if (recent.length < 2) return null;

    const recentAvg = recent.reduce((sum, v) => sum + v.value, 0) / recent.length;
    const earlierAvg = earlier.length > 0 
      ? earlier.reduce((sum, v) => sum + v.value, 0) / earlier.length 
      : recentAvg;

    const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    const abnormalCount = recent.filter(v => v.isAbnormal).length;

    return {
      changePercent,
      trend: changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable',
      abnormalCount,
      recentAvg,
      earlierAvg
    };
  };

  const analysis = getTrendAnalysis();

  const getTrendIcon = () => {
    if (!analysis) return Activity;
    
    switch (analysis.trend) {
      case 'increasing':
        return TrendingUp;
      case 'decreasing':
        return TrendingDown;
      default:
        return Activity;
    }
  };

  const getTrendColor = () => {
    if (!analysis) return 'text-blue-500';
    
    if (analysis.abnormalCount >= 2) return 'text-red-500';
    if (analysis.abnormalCount >= 1) return 'text-yellow-500';
    if (analysis.trend === 'stable') return 'text-blue-500';
    
    return 'text-green-500';
  };

  const getTrendStatus = () => {
    if (!analysis) return { text: 'Insufficient Data', color: 'secondary' as const };
    
    if (analysis.abnormalCount >= 2) {
      return { text: 'Concerning Trend', color: 'destructive' as const };
    } else if (analysis.abnormalCount >= 1) {
      return { text: 'Monitor Closely', color: 'secondary' as const };
    } else if (analysis.trend === 'stable') {
      return { text: 'Stable', color: 'default' as const };
    } else {
      return { text: 'Normal Variation', color: 'default' as const };
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.formattedDate}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`font-semibold ${data.isAbnormal ? 'text-red-500' : 'text-foreground'}`}>
              {data.value} {trendData?.unit}
            </span>
            {data.isAbnormal && <AlertTriangle className="w-3 h-3 text-red-500" />}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="w-32 h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded animate-pulse" style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  if (error || !trendData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <span>Lab Results Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            {error || 'No trend data available for this test'}
          </p>
          {availableTests.length > 0 && (
            <Button variant="outline" onClick={loadTrendData} className="mt-4">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = getTrendIcon();
  const trendStatus = getTrendStatus();

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <span>Lab Results Trend</span>
          </CardTitle>
          <Badge variant={trendStatus.color}>
            <TrendIcon className="w-3 h-3 mr-1" />
            {trendStatus.text}
          </Badge>
        </div>

        {showControls && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test" />
                </SelectTrigger>
                <SelectContent>
                  {availableTests.map(test => (
                    <SelectItem key={test} value={test}>
                      {test}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Last 3 months</SelectItem>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
                  <SelectItem value="24">Last 24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <CardDescription>
          Tracking {trendData.values.length} data points over {timeRange} months
          {trendData.unit && ` (${trendData.unit})`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                className="text-xs"
              />
              <YAxis 
                className="text-xs"
                tickFormatter={(value) => value.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference lines for normal ranges could be added here */}
              
              <Line
                type="monotone"
                dataKey="value"
                stroke="#DC2626"
                strokeWidth={2}
                dot={(props) => {
                  const { payload } = props;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={payload?.isAbnormal ? '#EF4444' : '#10B981'}
                      stroke={payload?.isAbnormal ? '#DC2626' : '#059669'}
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6, stroke: '#DC2626', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Analysis Summary */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-muted rounded-lg"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-foreground">Trend</div>
                <div className={`flex items-center justify-center space-x-1 ${getTrendColor()}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="capitalize">{analysis.trend}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">Change</div>
                <div className={`font-medium ${Math.abs(analysis.changePercent) > 10 ? 'text-red-500' : 'text-foreground'}`}>
                  {analysis.changePercent > 0 ? '+' : ''}{analysis.changePercent.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">Status</div>
                <div className="flex items-center justify-center space-x-1">
                  {analysis.abnormalCount > 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600">{analysis.abnormalCount} abnormal</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">All normal</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default LabResultsChart;
