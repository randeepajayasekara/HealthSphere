"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Receipt,
  Calendar,
  ArrowRight,
  Building2
} from 'lucide-react';
import { BillingService } from '@/lib/firestore/billing-services';
import type { Bill } from '@/app/types';
import { cn } from '@/lib/utils';

interface BillingWidgetProps {
  patientId: string;
  className?: string;
  onViewAll?: () => void;
}

interface BillingSummary {
  totalOutstanding: number;
  totalPaid: number;
  overdueCount: number;
  pendingCount: number;
  recentBills: Bill[];
}

export function BillingWidget({ patientId, className, onViewAll }: BillingWidgetProps) {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingSummary();
  }, [patientId]);

  const loadBillingSummary = async () => {
    try {
      setLoading(true);
      const data = await BillingService.getBillingSummary(patientId, patientId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading billing summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'partially_paid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    }
  };

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Billing Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("h-full border-red-200/50 dark:border-red-800/50", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Billing Overview</span>
            </CardTitle>
            {onViewAll && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            Your payment status and recent bills
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {summary && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      PAID
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200/50 dark:border-red-800/50">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-300">
                      OUTSTANDING
                    </span>
                  </div>
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(summary.totalOutstanding)}
                  </p>
                </div>
              </div>

              {/* Alert Counters */}
              {(summary.overdueCount > 0 || summary.pendingCount > 0) && (
                <div className="flex items-center space-x-3">
                  {summary.overdueCount > 0 && (
                    <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">{summary.overdueCount} overdue</span>
                    </div>
                  )}
                  {summary.pendingCount > 0 && (
                    <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{summary.pendingCount} pending</span>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Bills */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Recent Bills
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {summary.recentBills.length > 0 ? (
                    summary.recentBills.slice(0, 3).map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              #{bill.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {formatDate(bill.date)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getStatusColor(bill.status))}
                          >
                            {bill.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium">
                            {formatCurrency(bill.total)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-zinc-500">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent bills</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Ratio */}
              {summary.totalPaid > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Payment Status</span>
                    <span className="font-medium">
                      {Math.round((summary.totalPaid / (summary.totalPaid + summary.totalOutstanding)) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(summary.totalPaid / (summary.totalPaid + summary.totalOutstanding)) * 100} 
                    className="h-2"
                  />
                </div>
              )}

              {/* Action Button */}
              {onViewAll && (
                <Button 
                  onClick={onViewAll}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  View All Bills
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface InsuranceWidgetProps {
  patientId: string;
  className?: string;
  onViewAll?: () => void;
}

export function InsuranceWidget({ patientId, className, onViewAll }: InsuranceWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className={cn("h-full border-blue-200/50 dark:border-blue-800/50", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Insurance</span>
            </CardTitle>
            {onViewAll && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            Insurance coverage and claims
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Primary Insurance
              </span>
            </div>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              Aetna Health Plan
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Policy: AET-123456789
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Coverage Status
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Deductible:</span>
                <span className="font-medium">$1,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Met:</span>
                <span className="font-medium text-emerald-600">$800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Out-of-pocket:</span>
                <span className="font-medium">$5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Met:</span>
                <span className="font-medium text-emerald-600">$2,100</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Deductible Progress</span>
              <span className="font-medium">53%</span>
            </div>
            <Progress value={53} className="h-2" />
          </div>

          {onViewAll && (
            <Button 
              onClick={onViewAll}
              variant="outline"
              className="w-full mt-4"
              size="sm"
            >
              <Building2 className="w-4 h-4 mr-2" />
              View Claims
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
