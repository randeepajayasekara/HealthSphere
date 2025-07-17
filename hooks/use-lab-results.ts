'use client';

import { useState, useEffect, useCallback } from 'react';
import { labResultsService, imagingResultsService, type LabResultFilter, type LabResultSummary, type LabResultsTrend } from '@/lib/firestore/lab-results-services';
import type { LabResult, ImagingResult, UserRole } from '@/app/types';

interface UseLabResultsOptions {
  patientId: string;
  initialFilter?: LabResultFilter;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseLabResultsReturn {
  // Data
  labResults: LabResult[];
  imagingResults: ImagingResult[];
  summary: LabResultSummary | null;
  trends: LabResultsTrend[];
  
  // State
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Filter state
  filter: LabResultFilter;
  searchTerm: string;
  
  // Actions
  setFilter: (filter: LabResultFilter) => void;
  setSearchTerm: (term: string) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
  
  // Computed
  filteredResults: LabResult[];
  availableTests: string[];
  availableLaboratories: string[];
}

export const useLabResults = ({
  patientId,
  initialFilter = {},
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: UseLabResultsOptions): UseLabResultsReturn => {
  // Core data state
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [imagingResults, setImagingResults] = useState<ImagingResult[]>([]);
  const [summary, setSummary] = useState<LabResultSummary | null>(null);
  const [trends, setTrends] = useState<LabResultsTrend[]>([]);
  
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState<LabResultFilter>(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [lastDoc, setLastDoc] = useState<any>(null);

  // Load initial data
  const loadData = useCallback(async (refresh = false) => {
    if (!patientId) return;

    setLoading(true);
    if (refresh) {
      setError(null);
    }

    try {
      // Load lab results, summary, and imaging in parallel
      const [labResultsData, summaryData, imagingData] = await Promise.all([
        labResultsService.getPatientLabResults(patientId, filter),
        labResultsService.getLabResultsSummary(patientId),
        imagingResultsService.getPatientImagingResults(patientId)
      ]);

      setLabResults(labResultsData.results);
      setHasMore(labResultsData.hasMore);
      setLastDoc(labResultsData.lastDoc);
      setSummary(summaryData);
      setImagingResults(imagingData);

      // Load trends for common tests
      if (summaryData.commonTests.length > 0) {
        const trendPromises = summaryData.commonTests.slice(0, 5).map(testName =>
          labResultsService.getLabResultsTrend(patientId, testName, 6)
        );
        const trendsData = await Promise.all(trendPromises);
        const validTrends = trendsData.filter(trend => trend !== null) as LabResultsTrend[];
        setTrends(validTrends);
      }
    } catch (err) {
      console.error('Error loading lab results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lab results');
    } finally {
      setLoading(false);
    }
  }, [patientId, filter]);

  // Load more results for pagination
  const loadMore = useCallback(async () => {
    if (!patientId || !hasMore || loading) return;

    setLoading(true);
    try {
      const labResultsData = await labResultsService.getPatientLabResults(
        patientId, 
        filter, 
        lastDoc
      );

      setLabResults(prev => [...prev, ...labResultsData.results]);
      setHasMore(labResultsData.hasMore);
      setLastDoc(labResultsData.lastDoc);
    } catch (err) {
      console.error('Error loading more results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more results');
    } finally {
      setLoading(false);
    }
  }, [patientId, filter, lastDoc, hasMore, loading]);

  // Refresh data
  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Filter results based on search term
  const filteredResults = useCallback(() => {
    let filtered = labResults;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(result =>
        result.testName.toLowerCase().includes(searchLower) ||
        result.interpretation?.toLowerCase().includes(searchLower) ||
        result.laboratoryName.toLowerCase().includes(searchLower) ||
        result.resultValues.some(value => 
          value.parameter.toLowerCase().includes(searchLower)
        )
      );
    }

    return filtered;
  }, [labResults, searchTerm]);

  // Get available filter options
  const availableTests = useCallback(() => {
    return Array.from(new Set(labResults.map(result => result.testName))).sort();
  }, [labResults]);

  const availableLaboratories = useCallback(() => {
    return Array.from(new Set(labResults.map(result => result.laboratoryName))).sort();
  }, [labResults]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilter: LabResultFilter) => {
    setFilter(newFilter);
    setLastDoc(null); // Reset pagination
  }, []);

  // Handle search term changes
  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Initial data load
  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId, loadData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  // Real-time updates subscription
  useEffect(() => {
    if (!patientId) return;

    const unsubscribe = labResultsService.subscribeToPatientLabResults(
      patientId,
      (updatedResults) => {
        setLabResults(updatedResults);
        // Optionally refresh summary and trends when new results arrive
        if (updatedResults.length > labResults.length) {
          // New results detected, refresh summary
          labResultsService.getLabResultsSummary(patientId).then(setSummary);
        }
      },
      filter
    );

    return unsubscribe;
  }, [patientId, filter, labResults.length]);

  return {
    // Data
    labResults,
    imagingResults,
    summary,
    trends,
    
    // State
    loading,
    error,
    hasMore,
    
    // Filter state
    filter,
    searchTerm,
    
    // Actions
    setFilter: handleFilterChange,
    setSearchTerm: handleSearchTermChange,
    refresh,
    loadMore,
    clearError,
    
    // Computed
    filteredResults: filteredResults(),
    availableTests: availableTests(),
    availableLaboratories: availableLaboratories()
  };
};

export default useLabResults;
