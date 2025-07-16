'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TestTube, 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  Activity,
  BarChart3,
  Plus,
  RefreshCw,
  Clock,
  User,
  Building2
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Services and Types
import { labResultsService, imagingResultsService, type LabResultFilter, type LabResultSummary, type LabResultsTrend } from '@/lib/firestore/lab-results-services';
import type { LabResult, ImagingResult, LabResultValue, UserRole } from '@/app/types';

// Components
import LabResultsFilter from '@/app/components/dashboard/lab-results-filter';
import LabResultsChart from '@/app/components/dashboard/lab-results-chart';

// Context
import { useAuth } from '@/app/contexts/auth-context';

// Date utilities
import { format, subMonths, isAfter, isBefore } from 'date-fns';

// Types for component state
interface LabResultsPageState {
  labResults: LabResult[];
  imagingResults: ImagingResult[];
  summary: LabResultSummary | null;
  trends: LabResultsTrend[];
  loading: boolean;
  error: string | null;
  selectedResult: LabResult | null;
  filter: LabResultFilter;
  searchTerm: string;
  activeTab: 'overview' | 'lab-results' | 'imaging' | 'trends';
}

const LabResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<LabResultsPageState>({
    labResults: [],
    imagingResults: [],
    summary: null,
    trends: [],
    loading: true,
    error: null,
    selectedResult: null,
    filter: {},
    searchTerm: '',
    activeTab: 'overview'
  });

  // Load data on component mount
  useEffect(() => {
    if (user?.id) {
      loadLabResultsData();
    }
  }, [user?.id]);

  const loadLabResultsData = async () => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load lab results, summary, and imaging in parallel
      const [labResultsData, summary, imagingResults] = await Promise.all([
        labResultsService.getPatientLabResults(user.id, state.filter),
        labResultsService.getLabResultsSummary(user.id),
        imagingResultsService.getPatientImagingResults(user.id)
      ]);

      // Load trends for common tests
      const trendPromises = summary.commonTests.map(testName =>
        labResultsService.getLabResultsTrend(user.id, testName, 6)
      );
      const trendsData = await Promise.all(trendPromises);
      const validTrends = trendsData.filter(trend => trend !== null) as LabResultsTrend[];

      setState(prev => ({
        ...prev,
        labResults: labResultsData.results,
        summary,
        imagingResults,
        trends: validTrends,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading lab results:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load lab results. Please try again.',
        loading: false
      }));
    }
  };

  // Filtered lab results based on search and filters
  const filteredLabResults = useMemo(() => {
    let filtered = state.labResults;

    // Search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(result =>
        result.testName.toLowerCase().includes(searchLower) ||
        result.interpretation?.toLowerCase().includes(searchLower) ||
        result.laboratoryName.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (state.filter.dateRange) {
      filtered = filtered.filter(result =>
        isAfter(result.testDate, state.filter.dateRange!.start) &&
        isBefore(result.testDate, state.filter.dateRange!.end)
      );
    }

    // Abnormal only filter
    if (state.filter.abnormalOnly) {
      filtered = filtered.filter(result =>
        result.resultValues.some(value => value.isAbnormal)
      );
    }

    return filtered;
  }, [state.labResults, state.searchTerm, state.filter]);

  // Handle filter changes
  const updateFilter = (newFilter: Partial<LabResultFilter>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...newFilter }
    }));
  };

  // Handle search
  const handleSearch = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  };

  // Get status color and icon
  const getStatusDisplay = (result: LabResult) => {
    const hasAbnormal = result.resultValues.some(value => value.isAbnormal);
    const hasCritical = result.resultValues.some(value => 
      value.isAbnormal && typeof value.value === 'number' && Math.abs(value.value) > 100
    );

    if (hasCritical) {
      return {
        color: 'destructive',
        icon: XCircle,
        text: 'Critical'
      };
    } else if (hasAbnormal) {
      return {
        color: 'warning' as const,
        icon: AlertTriangle,
        text: 'Abnormal'
      };
    } else {
      return {
        color: 'success' as const,
        icon: CheckCircle,
        text: 'Normal'
      };
    }
  };

  // Get trend display
  const getTrendDisplay = (trend: LabResultsTrend) => {
    const trendConfig = {
      improving: { color: 'bg-green-500', icon: TrendingUp, text: 'Improving' },
      stable: { color: 'bg-blue-500', icon: Activity, text: 'Stable' },
      concerning: { color: 'bg-yellow-500', icon: AlertTriangle, text: 'Concerning' },
      critical: { color: 'bg-red-500', icon: XCircle, text: 'Critical' }
    };

    return trendConfig[trend.trend];
  };

  if (state.loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
          <h1 className="text-3xl font-bold text-foreground">Loading Lab Results...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
        <Button 
          onClick={loadLabResultsData} 
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
            <TestTube className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lab Results</h1>
            <p className="text-muted-foreground">View and track your laboratory test results</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadLabResultsData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {state.summary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
              <FileText className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{state.summary.totalTests}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Normal Results</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {state.summary.totalTests - state.summary.abnormalResults}
              </div>
              <div className="flex items-center space-x-1">
                <Progress 
                  value={((state.summary.totalTests - state.summary.abnormalResults) / state.summary.totalTests) * 100} 
                  className="flex-1 h-2"
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round(((state.summary.totalTests - state.summary.abnormalResults) / state.summary.totalTests) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Abnormal Results</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{state.summary.abnormalResults}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Values</CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{state.summary.criticalValues}</div>
              <p className="text-xs text-muted-foreground">Immediate review needed</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value as any }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
            <TabsTrigger value="imaging">Imaging</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <span>Recent Lab Results</span>
                  </CardTitle>
                  <CardDescription>Your latest test results</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {state.labResults.slice(0, 5).map((result) => {
                        const status = getStatusDisplay(result);
                        const StatusIcon = status.icon;
                        
                        return (
                          <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <StatusIcon className={`w-4 h-4 ${
                                status.color === 'destructive' ? 'text-red-500' :
                                status.color === 'warning' ? 'text-yellow-500' :
                                'text-green-500'
                              }`} />
                              <div>
                                <p className="font-medium text-foreground">{result.testName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(result.testDate, 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <Badge variant={status.color === 'destructive' ? 'destructive' : status.color === 'warning' ? 'secondary' : 'default'}>
                              {status.text}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Common Tests */}
              {state.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-red-600" />
                      <span>Common Tests</span>
                    </CardTitle>
                    <CardDescription>Your frequently ordered tests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {state.summary.commonTests.map((testName, index) => (
                        <div key={testName} className="flex items-center justify-between p-2 rounded">
                          <span className="text-foreground">{testName}</span>
                          <Badge variant="outline">{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="lab-results" className="space-y-6">
            {/* Enhanced Filter Component */}
            <LabResultsFilter
              onFilterChange={(newFilter) => setState(prev => ({ ...prev, filter: newFilter }))}
              onSearchChange={handleSearch}
              initialFilter={state.filter}
              initialSearch={state.searchTerm}
              availableTests={Array.from(new Set(state.labResults.map(r => r.testName)))}
              availableLaboratories={Array.from(new Set(state.labResults.map(r => r.laboratoryName)))}
            />

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lab Results ({filteredLabResults.length})</CardTitle>
                <CardDescription>Click on any result to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Laboratory</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabResults.map((result) => {
                      const status = getStatusDisplay(result);
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow key={result.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{result.testName}</p>
                              <p className="text-sm text-muted-foreground">{result.resultValues.length} parameters</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-foreground">{format(result.testDate, 'MMM dd, yyyy')}</p>
                              <p className="text-sm text-muted-foreground">{format(result.testDate, 'h:mm a')}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">{result.laboratoryName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              status.color === 'destructive' ? 'destructive' :
                              status.color === 'warning' ? 'secondary' :
                              'default'
                            }>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setState(prev => ({ ...prev, selectedResult: result }))}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    <TestTube className="w-5 h-5 text-red-600" />
                                    <span>{result.testName} - Details</span>
                                  </DialogTitle>
                                </DialogHeader>
                                <LabResultDetail result={result} />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {filteredLabResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No lab results found matching your criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Imaging Tab */}
          <TabsContent value="imaging" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Imaging Results</CardTitle>
                <CardDescription>Your radiology and imaging study results</CardDescription>
              </CardHeader>
              <CardContent>
                {state.imagingResults.length > 0 ? (
                  <div className="space-y-4">
                    {state.imagingResults.map((result) => (
                      <div key={result.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-foreground">{result.procedureName}</h3>
                            <p className="text-muted-foreground">Body Part: {result.bodyPart}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(result.date, 'MMM dd, yyyy')} • {result.facilityName}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium text-foreground mb-1">Findings</h4>
                            <p className="text-sm text-muted-foreground">{result.findings}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground mb-1">Impression</h4>
                            <p className="text-sm text-muted-foreground">{result.impression}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No imaging results available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {/* Enhanced Chart Component */}
            {user?.id && (
              <LabResultsChart
                patientId={user.id}
                className="mb-6"
                height={400}
                showControls={true}
              />
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Test Result Trends</CardTitle>
                <CardDescription>Track how your test values change over time</CardDescription>
              </CardHeader>
              <CardContent>
                {state.trends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {state.trends.map((trend) => {
                      const trendDisplay = getTrendDisplay(trend);
                      const TrendIcon = trendDisplay.icon;
                      
                      return (
                        <Card key={trend.testName} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{trend.testName}</CardTitle>
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${trendDisplay.color}`}></div>
                                <TrendIcon className="w-3 h-3" />
                                <span>{trendDisplay.text}</span>
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-sm text-muted-foreground">
                                {trend.values.length} data points over 6 months
                              </div>
                              
                              {/* Simple trend visualization */}
                              <div className="space-y-2">
                                {trend.values.slice(-5).map((value, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {format(value.date, 'MMM dd')}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <span className={`font-medium ${value.isAbnormal ? 'text-red-500' : 'text-foreground'}`}>
                                        {value.value} {trend.unit}
                                      </span>
                                      {value.isAbnormal && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <Button variant="outline" size="sm" className="w-full">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Detailed Chart
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No trend data available. More test results needed to show trends.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

// Lab Result Detail Component
const LabResultDetail: React.FC<{ result: LabResult }> = ({ result }) => {
  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <h3 className="font-semibold text-foreground mb-2">Test Information</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Test Name:</span> {result.testName}</p>
            <p><span className="font-medium">Test Date:</span> {format(result.testDate, 'PPP')}</p>
            <p><span className="font-medium">Result Date:</span> {format(result.resultDate, 'PPP')}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2">Laboratory</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Laboratory:</span> {result.laboratoryName}</p>
            {result.technicianName && (
              <p><span className="font-medium">Technician:</span> {result.technicianName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Test Results</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.resultValues.map((value, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{value.parameter}</TableCell>
                <TableCell className={value.isAbnormal ? 'text-red-500 font-semibold' : 'text-foreground'}>
                  {value.value}
                </TableCell>
                <TableCell className="text-muted-foreground">{value.unit}</TableCell>
                <TableCell>
                  {value.isAbnormal ? (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Abnormal
                    </Badge>
                  ) : (
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Normal
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Normal Ranges */}
      {result.normalRanges && result.normalRanges.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-4">Reference Ranges</h3>
          <div className="space-y-2">
            {result.normalRanges.map((range, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <span className="font-medium">{range.parameter}</span>
                <span className="text-muted-foreground">
                  {range.minValue !== undefined && range.maxValue !== undefined
                    ? `${range.minValue} - ${range.maxValue} ${range.unit}`
                    : range.description || 'See attached reference'
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretation */}
      {result.interpretation && (
        <div>
          <h3 className="font-semibold text-foreground mb-2">Interpretation</h3>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-foreground">{result.interpretation}</p>
          </div>
        </div>
      )}

      {/* Attachments */}
      {result.attachments && result.attachments.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-4">Attachments</h3>
          <div className="space-y-2">
            {result.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{attachment.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB • 
                      {format(attachment.uploadedAt, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabResultsPage;
