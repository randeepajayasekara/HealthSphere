'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Calendar, 
  TestTube, 
  Building2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  SlidersHorizontal
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Services and Types
import type { LabResultFilter } from '@/lib/firestore/lab-results-services';

// Date utilities
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';

interface LabResultsFilterProps {
  onFilterChange: (filter: LabResultFilter) => void;
  onSearchChange: (search: string) => void;
  initialFilter?: LabResultFilter;
  initialSearch?: string;
  availableTests?: string[];
  availableLaboratories?: string[];
  className?: string;
  isCollapsible?: boolean;
}

interface ActiveFilters {
  dateRange?: string;
  testType?: string;
  laboratory?: string;
  status?: string;
  abnormalOnly?: boolean;
  search?: string;
}

const LabResultsFilter: React.FC<LabResultsFilterProps> = ({
  onFilterChange,
  onSearchChange,
  initialFilter = {},
  initialSearch = '',
  availableTests = [],
  availableLaboratories = [],
  className = '',
  isCollapsible = true
}) => {
  const [isOpen, setIsOpen] = useState(!isCollapsible);
  const [filter, setFilter] = useState<LabResultFilter>(initialFilter);
  const [search, setSearch] = useState(initialSearch);
  const [customDateRange, setCustomDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  // Track active filters for display
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  useEffect(() => {
    updateActiveFilters();
  }, [filter, search]);

  const updateActiveFilters = () => {
    const active: ActiveFilters = {};
    
    if (search) active.search = search;
    if (filter.testType) active.testType = filter.testType;
    if (filter.department) active.laboratory = filter.department;
    if (filter.abnormalOnly) active.abnormalOnly = true;
    if (filter.dateRange) {
      // Determine if it's a preset or custom range
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) active.dateRange = 'Last Week';
      else if (daysDiff <= 30) active.dateRange = 'Last Month';
      else if (daysDiff <= 90) active.dateRange = 'Last 3 Months';
      else if (daysDiff <= 180) active.dateRange = 'Last 6 Months';
      else if (daysDiff <= 365) active.dateRange = 'Last Year';
      else active.dateRange = 'Custom Range';
    }
    
    setActiveFilters(active);
  };

  const handleFilterUpdate = (newFilter: Partial<LabResultFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    onFilterChange(updatedFilter);
  };

  const handleSearchUpdate = (newSearch: string) => {
    setSearch(newSearch);
    onSearchChange(newSearch);
  };

  const handleDateRangePreset = (preset: string) => {
    const now = new Date();
    let start: Date;
    
    switch (preset) {
      case 'week':
        start = subDays(now, 7);
        break;
      case 'month':
        start = subMonths(now, 1);
        break;
      case '3months':
        start = subMonths(now, 3);
        break;
      case '6months':
        start = subMonths(now, 6);
        break;
      case 'year':
        start = subYears(now, 1);
        break;
      default:
        handleFilterUpdate({ dateRange: undefined });
        return;
    }
    
    handleFilterUpdate({
      dateRange: {
        start: startOfDay(start),
        end: endOfDay(now)
      }
    });
  };

  const handleCustomDateRange = () => {
    if (customDateRange.from && customDateRange.to) {
      handleFilterUpdate({
        dateRange: {
          start: startOfDay(customDateRange.from),
          end: endOfDay(customDateRange.to)
        }
      });
      setIsCustomDateOpen(false);
    }
  };

  const clearFilter = (filterType: keyof ActiveFilters) => {
    switch (filterType) {
      case 'search':
        handleSearchUpdate('');
        break;
      case 'dateRange':
        handleFilterUpdate({ dateRange: undefined });
        setCustomDateRange({});
        break;
      case 'testType':
        handleFilterUpdate({ testType: undefined });
        break;
      case 'laboratory':
        handleFilterUpdate({ department: undefined });
        break;
      case 'abnormalOnly':
        handleFilterUpdate({ abnormalOnly: false });
        break;
    }
  };

  const clearAllFilters = () => {
    setFilter({});
    setSearch('');
    setCustomDateRange({});
    onFilterChange({});
    onSearchChange('');
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className={className}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-red-600" />
          <h3 className="font-medium text-foreground">Filter & Search</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <Badge
                key={key}
                variant="outline"
                className="flex items-center space-x-1 pr-1"
              >
                <span className="text-xs">{typeof value === 'boolean' ? key : `${key}: ${value}`}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0.5 hover:bg-transparent"
                  onClick={() => clearFilter(key as keyof ActiveFilters)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                    Search Tests
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by test name, laboratory, or interpretation..."
                      value={search}
                      onChange={(e) => handleSearchUpdate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                {/* Quick Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Test Type */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Test Type</Label>
                    <Select
                      value={filter.testType || 'all'}
                      onValueChange={(value) => 
                        handleFilterUpdate({ testType: value === 'all' ? undefined : value })
                      }
                    >
                      <SelectTrigger>
                        <TestTube className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Tests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tests</SelectItem>
                        {availableTests.map(test => (
                          <SelectItem key={test} value={test}>{test}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Laboratory */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Laboratory</Label>
                    <Select
                      value={filter.department || 'all'}
                      onValueChange={(value) => 
                        handleFilterUpdate({ department: value === 'all' ? undefined : value })
                      }
                    >
                      <SelectTrigger>
                        <Building2 className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Labs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Laboratories</SelectItem>
                        {availableLaboratories.map(lab => (
                          <SelectItem key={lab} value={lab}>{lab}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Result Status</Label>
                    <Select
                      value={filter.abnormalOnly ? 'abnormal' : 'all'}
                      onValueChange={(value) => 
                        handleFilterUpdate({ abnormalOnly: value === 'abnormal' })
                      }
                    >
                      <SelectTrigger>
                        {filter.abnormalOnly ? (
                          <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        )}
                        <SelectValue placeholder="All Results" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Results</SelectItem>
                        <SelectItem value="normal">Normal Only</SelectItem>
                        <SelectItem value="abnormal">Abnormal Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Period Quick Select */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Time Period</Label>
                    <Select
                      value={filter.dateRange ? 'custom' : 'all'}
                      onValueChange={(value) => {
                        if (value === 'all') {
                          handleFilterUpdate({ dateRange: undefined });
                        } else if (value !== 'custom') {
                          handleDateRangePreset(value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Date Range */}
                <Collapsible open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Custom Date Range
                      {filter.dateRange && (
                        <Badge variant="secondary" className="ml-2">
                          {format(filter.dateRange.start, 'MMM dd')} - {format(filter.dateRange.end, 'MMM dd')}
                        </Badge>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">From Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <Calendar className="w-4 h-4 mr-2" />
                              {customDateRange.from ? format(customDateRange.from, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={customDateRange.from}
                              onSelect={(date) => setCustomDateRange(prev => ({ ...prev, from: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">To Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <Calendar className="w-4 h-4 mr-2" />
                              {customDateRange.to ? format(customDateRange.to, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={customDateRange.to}
                              onSelect={(date) => setCustomDateRange(prev => ({ ...prev, to: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCustomDateRange}
                      disabled={!customDateRange.from || !customDateRange.to}
                      className="w-full"
                    >
                      Apply Date Range
                    </Button>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Advanced Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Advanced Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="abnormalOnly"
                        checked={filter.abnormalOnly || false}
                        onCheckedChange={(checked) => 
                          handleFilterUpdate({ abnormalOnly: checked as boolean })
                        }
                      />
                      <Label htmlFor="abnormalOnly" className="text-sm">
                        Show only abnormal results
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LabResultsFilter;
