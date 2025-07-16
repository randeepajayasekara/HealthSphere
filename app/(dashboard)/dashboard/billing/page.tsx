"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/contexts/auth-context';
import { BillingService, InsuranceClaimService } from '@/lib/firestore/billing-services';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Printer,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Receipt,
  Building2,
  Wallet,
  CircleDollarSign,
  CalendarClock,
  X,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Shield,
  Activity,
  Loader2
} from 'lucide-react';
import type { Bill, InsuranceClaim, User } from '@/app/types';
import { ProtectedRoute } from '@/app/components/auth/protected-route';
import { cn } from '@/lib/utils';

interface BillingSummary {
  totalOutstanding: number;
  totalPaid: number;
  overdueCount: number;
  pendingCount: number;
  recentBills: Bill[];
}

interface BillingPageState {
  bills: Bill[];
  claims: InsuranceClaim[];
  summary: BillingSummary | null;
  loading: boolean;
  selectedBill: Bill | null;
  showPaymentDialog: boolean;
  showBillDetails: boolean;
  searchTerm: string;
  statusFilter: string;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function BillingPage() {
  const { user } = useAuth();
  const [state, setState] = useState<BillingPageState>({
    bills: [],
    claims: [],
    summary: null,
    loading: true,
    selectedBill: null,
    showPaymentDialog: false,
    showBillDetails: false,
    searchTerm: '',
    statusFilter: 'all',
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'credit_card' as const,
    notes: ''
  });

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadBillingData();
      loadBillingSummary();
      loadInsuranceClaims();
    }
  }, [user?.id]);

  // Load billing data with pagination and filters
  const loadBillingData = async (page = 1) => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const result = await BillingService.getPatientBills(user.id, user.id, {
        pagination: { page, limit: ITEMS_PER_PAGE },
        filter: state.statusFilter !== 'all' ? { status: state.statusFilter } : undefined,
        sort: { field: 'date', direction: 'desc' }
      });

      setState(prev => ({
        ...prev,
        bills: result.bills,
        totalPages: Math.ceil(result.totalCount / ITEMS_PER_PAGE),
        hasMore: result.hasMore,
        currentPage: page,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading billing data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadBillingSummary = async () => {
    if (!user?.id) return;

    try {
      const summary = await BillingService.getBillingSummary(user.id, user.id);
      setState(prev => ({ ...prev, summary }));
    } catch (error) {
      console.error('Error loading billing summary:', error);
    }
  };

  const loadInsuranceClaims = async () => {
    if (!user?.id) return;

    try {
      const claims = await InsuranceClaimService.getPatientClaims(user.id, user.id);
      setState(prev => ({ ...prev, claims }));
    } catch (error) {
      console.error('Error loading insurance claims:', error);
    }
  };

  const handlePayment = async () => {
    if (!state.selectedBill || !user?.id) return;

    try {
      const amount = parseFloat(paymentForm.amount);
      await BillingService.processPayment(
        state.selectedBill.id,
        amount,
        paymentForm.method,
        user.id,
        paymentForm.notes
      );

      // Reload data
      await loadBillingData(state.currentPage);
      await loadBillingSummary();

      // Reset form and close dialog
      setPaymentForm({ amount: '', method: 'credit_card', notes: '' });
      setState(prev => ({ 
        ...prev, 
        showPaymentDialog: false, 
        selectedBill: null 
      }));
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      case 'partially_paid':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'cancelled':
        return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    }
  };

  const getClaimStatusColor = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'partially_approved':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getPaymentProgress = (bill: Bill) => {
    const paidAmount = bill.paidAmount || 0;
    return (paidAmount / bill.total) * 100;
  };

  const handlePageChange = (page: number) => {
    loadBillingData(page);
  };

  const filteredBills = state.bills.filter(bill => {
    const matchesSearch = bill.id.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         bill.items.some(item => item.description.toLowerCase().includes(state.searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <ProtectedRoute allowedRoles={['patient', 'doctor', 'nurse', 'admin', 'receptionist']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Billing & Payments
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Manage your medical bills, payments, and insurance claims
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 dark:border-emerald-800/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                      Total Paid
                    </p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {state.summary ? formatCurrency(state.summary.totalPaid) : '$0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 dark:border-red-800/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                      Outstanding
                    </p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {state.summary ? formatCurrency(state.summary.totalOutstanding) : '$0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl">
                    <CircleDollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30 dark:border-amber-800/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                      Overdue Bills
                    </p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      {state.summary ? state.summary.overdueCount : 0}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-800/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Pending Bills
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {state.summary ? state.summary.pendingCount : 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                    <CalendarClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="bills" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="bills" className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4" />
                  <span>Bills</span>
                </TabsTrigger>
                <TabsTrigger value="claims" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Insurance Claims</span>
                </TabsTrigger>
              </TabsList>

              {/* Bills Tab */}
              <TabsContent value="bills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <span>Medical Bills</span>
                        </CardTitle>
                        <CardDescription>
                          View and manage your medical bills and payments
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input
                            placeholder="Search bills..."
                            value={state.searchTerm}
                            onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                            className="pl-10 w-64"
                          />
                        </div>
                        <Select
                          value={state.statusFilter}
                          onValueChange={(value) => {
                            setState(prev => ({ ...prev, statusFilter: value }));
                            loadBillingData(1);
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="issued">Issued</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="partially_paid">Partially Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {state.loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600 dark:text-red-400" />
                      </div>
                    ) : (
                      <>
                        <div className="rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Bill ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredBills.map((bill) => (
                                <TableRow key={bill.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                  <TableCell className="font-medium">
                                    #{bill.id.slice(-8).toUpperCase()}
                                  </TableCell>
                                  <TableCell>{formatDate(bill.date)}</TableCell>
                                  <TableCell className="font-semibold">
                                    {formatCurrency(bill.total)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-sm">
                                        <span>{formatCurrency(bill.paidAmount || 0)}</span>
                                        <span className="text-zinc-500">
                                          {Math.round(getPaymentProgress(bill))}%
                                        </span>
                                      </div>
                                      <Progress 
                                        value={getPaymentProgress(bill)} 
                                        className="h-2"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline" 
                                      className={cn("capitalize", getStatusColor(bill.status))}
                                    >
                                      {bill.status.replace('_', ' ')}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className={cn(
                                      "text-sm",
                                      new Date(bill.dueDate) < new Date() && bill.status !== 'paid' 
                                        ? "text-red-600 dark:text-red-400 font-medium" 
                                        : "text-zinc-600 dark:text-zinc-400"
                                    )}>
                                      {formatDate(bill.dueDate)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setState(prev => ({ 
                                          ...prev, 
                                          selectedBill: bill, 
                                          showBillDetails: true 
                                        }))}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      {bill.status !== 'paid' && bill.status !== 'cancelled' && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setState(prev => ({ 
                                            ...prev, 
                                            selectedBill: bill, 
                                            showPaymentDialog: true 
                                          }))}
                                          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                        >
                                          <CreditCard className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination */}
                        {state.totalPages > 1 && (
                          <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Page {state.currentPage} of {state.totalPages}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(state.currentPage - 1)}
                                disabled={state.currentPage === 1}
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(state.currentPage + 1)}
                                disabled={state.currentPage === state.totalPages}
                              >
                                Next
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Insurance Claims Tab */}
              <TabsContent value="claims" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Insurance Claims</span>
                    </CardTitle>
                    <CardDescription>
                      Track your insurance claims and reimbursements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Claim Number</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {state.claims.map((claim) => (
                            <TableRow key={claim.id}>
                              <TableCell className="font-medium">
                                {claim.claimNumber}
                              </TableCell>
                              <TableCell>{claim.insuranceProvider}</TableCell>
                              <TableCell>{formatDate(claim.submissionDate)}</TableCell>
                              <TableCell className="font-semibold">
                                {claim.approvedAmount ? formatCurrency(claim.approvedAmount) : 'Pending'}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={cn("capitalize", getClaimStatusColor(claim.status))}
                                >
                                  {claim.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Payment Dialog */}
        <Dialog 
          open={state.showPaymentDialog} 
          onOpenChange={(open) => setState(prev => ({ ...prev, showPaymentDialog: open }))}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
              <DialogDescription>
                Process payment for bill #{state.selectedBill?.id.slice(-8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                />
                {state.selectedBill && (
                  <p className="text-sm text-zinc-500">
                    Outstanding: {formatCurrency(state.selectedBill.total - (state.selectedBill.paidAmount || 0))}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Payment notes..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <Button 
                  onClick={handlePayment}
                  className="flex-1"
                  disabled={!paymentForm.amount}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Process Payment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setState(prev => ({ ...prev, showPaymentDialog: false }))}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bill Details Dialog */}
        <Dialog 
          open={state.showBillDetails} 
          onOpenChange={(open) => setState(prev => ({ ...prev, showBillDetails: open }))}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bill Details</DialogTitle>
              <DialogDescription>
                Invoice #{state.selectedBill?.id.slice(-8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            {state.selectedBill && (
              <div className="space-y-6">
                {/* Bill Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Bill Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-zinc-500">Date:</span> {formatDate(state.selectedBill.date)}</p>
                      <p><span className="text-zinc-500">Due Date:</span> {formatDate(state.selectedBill.dueDate)}</p>
                      <p><span className="text-zinc-500">Status:</span> 
                        <Badge 
                          variant="outline" 
                          className={cn("ml-2 capitalize", getStatusColor(state.selectedBill.status))}
                        >
                          {state.selectedBill.status.replace('_', ' ')}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Payment Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-zinc-500">Total:</span> {formatCurrency(state.selectedBill.total)}</p>
                      <p><span className="text-zinc-500">Paid:</span> {formatCurrency(state.selectedBill.paidAmount || 0)}</p>
                      <p><span className="text-zinc-500">Outstanding:</span> {formatCurrency(state.selectedBill.total - (state.selectedBill.paidAmount || 0))}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bill Items */}
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">Services & Items</h4>
                  <div className="space-y-2">
                    {state.selectedBill.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-zinc-500">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Payment Summary */}
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(state.selectedBill.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(state.selectedBill.tax)}</span>
                    </div>
                    {state.selectedBill.discount && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(state.selectedBill.discount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(state.selectedBill.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  {state.selectedBill.status !== 'paid' && state.selectedBill.status !== 'cancelled' && (
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setState(prev => ({ 
                          ...prev, 
                          showBillDetails: false, 
                          showPaymentDialog: true 
                        }));
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
