"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FlaskConical,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { DoctorService } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';
import { LabResult, LabResultValue } from '@/app/types';

export default function DoctorLabResultsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<LabResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [criticalFilter, setCriticalFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      loadLabResults();
    }
  }, [user]);

  useEffect(() => {
    filterResults();
  }, [labResults, searchTerm, selectedPatient, criticalFilter]);

  const loadLabResults = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Mock lab results data - in real implementation, this would fetch from multiple patients
      const mockLabResults: LabResult[] = [
        {
          id: 'lab1',
          patientId: 'patient1',
          providerId: user.id,
          date: new Date(),
          type: 'lab_result',
          description: 'Complete Blood Count (CBC)',
          testName: 'Complete Blood Count',
          testDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          resultDate: new Date(),
          resultValues: [
            {
              parameter: 'White Blood Cells',
              value: 8.5,
              unit: 'K/uL',
              isAbnormal: false
            },
            {
              parameter: 'Red Blood Cells',
              value: 4.2,
              unit: 'M/uL',
              isAbnormal: false
            },
            {
              parameter: 'Hemoglobin',
              value: 12.5,
              unit: 'g/dL',
              isAbnormal: false
            },
            {
              parameter: 'Hematocrit',
              value: 38.2,
              unit: '%',
              isAbnormal: false
            }
          ],
          laboratoryName: 'Central Lab',
          interpretation: 'Normal values within expected ranges',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'lab2',
          patientId: 'patient2',
          providerId: user.id,
          date: new Date(),
          type: 'lab_result',
          description: 'Lipid Panel',
          testName: 'Lipid Panel',
          testDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          resultDate: new Date(),
          resultValues: [
            {
              parameter: 'Total Cholesterol',
              value: 245,
              unit: 'mg/dL',
              isAbnormal: true
            },
            {
              parameter: 'LDL Cholesterol',
              value: 165,
              unit: 'mg/dL',
              isAbnormal: true
            },
            {
              parameter: 'HDL Cholesterol',
              value: 35,
              unit: 'mg/dL',
              isAbnormal: true
            },
            {
              parameter: 'Triglycerides',
              value: 220,
              unit: 'mg/dL',
              isAbnormal: true
            }
          ],
          laboratoryName: 'CardioLab',
          interpretation: 'Elevated cholesterol levels. Consider lifestyle modifications and medication.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'lab3',
          patientId: 'patient3',
          providerId: user.id,
          date: new Date(),
          type: 'lab_result',
          description: 'HbA1c Test',
          testName: 'Hemoglobin A1c',
          testDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          resultDate: new Date(),
          resultValues: [
            {
              parameter: 'HbA1c',
              value: 8.2,
              unit: '%',
              isAbnormal: true
            }
          ],
          laboratoryName: 'Diabetes Center Lab',
          interpretation: 'Significantly elevated HbA1c indicating poor glucose control. Immediate intervention required.',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setLabResults(mockLabResults);
    } catch (error) {
      console.error('Error loading lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...labResults];

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.laboratoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPatient !== 'all') {
      filtered = filtered.filter(result => result.patientId === selectedPatient);
    }

    if (criticalFilter === 'critical') {
      filtered = filtered.filter(result => 
        result.resultValues.some(value => value.isAbnormal)
      );
    } else if (criticalFilter === 'normal') {
      filtered = filtered.filter(result => 
        result.resultValues.every(value => !value.isAbnormal)
      );
    }

    // Sort by result date (newest first)
    filtered.sort((a, b) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime());

    setFilteredResults(filtered);
  };

  const getResultStatusIcon = (result: LabResult) => {
    const hasAbnormal = result.resultValues.some(value => value.isAbnormal);
    
    if (hasAbnormal) {
      // Check for critical values (this would be more sophisticated in real implementation)
      const hasCritical = result.resultValues.some(value => 
        value.isAbnormal && (
          (value.parameter.includes('Cholesterol') && typeof value.value === 'number' && value.value > 240) ||
          (value.parameter.includes('HbA1c') && typeof value.value === 'number' && value.value > 7.0)
        )
      );
      
      return hasCritical ? 
        <AlertTriangle className="h-5 w-5 text-red-500" /> :
        <XCircle className="h-5 w-5 text-yellow-500" />;
    }
    
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getResultStatusColor = (result: LabResult) => {
    const hasAbnormal = result.resultValues.some(value => value.isAbnormal);
    
    if (hasAbnormal) {
      const hasCritical = result.resultValues.some(value => 
        value.isAbnormal && (
          (value.parameter.includes('Cholesterol') && typeof value.value === 'number' && value.value > 240) ||
          (value.parameter.includes('HbA1c') && typeof value.value === 'number' && value.value > 7.0)
        )
      );
      
      return hasCritical ? 
        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
    
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getValueTrend = (value: LabResultValue) => {
    // Mock trend calculation - in real implementation, this would compare with previous results
    if (value.isAbnormal) {
      return Math.random() > 0.5 ? 
        <TrendingUp className="h-4 w-4 text-red-500" /> :
        <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getLabResultsStats = () => {
    const total = labResults.length;
    const critical = labResults.filter(result => 
      result.resultValues.some(value => 
        value.isAbnormal && (
          (value.parameter.includes('Cholesterol') && typeof value.value === 'number' && value.value > 240) ||
          (value.parameter.includes('HbA1c') && typeof value.value === 'number' && value.value > 7.0)
        )
      )
    ).length;
    const abnormal = labResults.filter(result => 
      result.resultValues.some(value => value.isAbnormal)
    ).length;
    const normal = total - abnormal;

    return { total, critical, abnormal, normal };
  };

  const stats = getLabResultsStats();
  const uniquePatients = [...new Set(labResults.map(result => result.patientId))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-zinc-400 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading lab results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Lab Results
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Review and analyze patient laboratory results
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <FlaskConical className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.abnormal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.normal}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  placeholder="Search by test name, patient ID, or lab..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {uniquePatients.map(patientId => (
                  <SelectItem key={patientId} value={patientId}>
                    {patientId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={criticalFilter} onValueChange={setCriticalFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="normal">Normal Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          filteredResults.map((result) => (
            <Card key={result.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getResultStatusIcon(result)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{result.testName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          Patient: {result.patientId}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {result.resultDate.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <FlaskConical className="h-3 w-3 mr-1" />
                          {result.laboratoryName}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getResultStatusColor(result)}>
                      {result.resultValues.some(v => v.isAbnormal) ? 'Abnormal' : 'Normal'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Result Values */}
                <div className="space-y-3">
                  <h4 className="font-medium">Test Results:</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parameter</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Trend</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.resultValues.map((value, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {value.parameter}
                            </TableCell>
                            <TableCell className={value.isAbnormal ? 'font-bold text-red-600' : ''}>
                              {value.value}
                            </TableCell>
                            <TableCell>{value.unit}</TableCell>
                            <TableCell>
                              <Badge variant={value.isAbnormal ? 'destructive' : 'default'}>
                                {value.isAbnormal ? 'Abnormal' : 'Normal'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getValueTrend(value)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Interpretation */}
                {result.interpretation && (
                  <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <h4 className="font-medium mb-2">Clinical Interpretation:</h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {result.interpretation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <FlaskConical className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              No lab results found
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {searchTerm || selectedPatient !== 'all' || criticalFilter !== 'all'
                ? "Try adjusting your search criteria"
                : "No lab results available for review"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
