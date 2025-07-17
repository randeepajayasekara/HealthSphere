"use client";

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  DollarSign,
  Receipt,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Printer,
  Eye,
  Calendar,
  Building2,
  X
} from 'lucide-react';
import type { Bill, BillItem, PaymentMethod } from '@/app/types';
import { cn } from '@/lib/utils';

interface BillCardProps {
  bill: Bill;
  onViewDetails: (bill: Bill) => void;
  onMakePayment: (bill: Bill) => void;
  className?: string;
}

export function BillCard({ bill, onViewDetails, onMakePayment, className }: BillCardProps) {
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

  const getPaymentProgress = () => {
    const paidAmount = bill.paidAmount || 0;
    return (paidAmount / bill.total) * 100;
  };

  const isOverdue = new Date(bill.dueDate) < new Date() && bill.status !== 'paid';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "border-2 transition-all duration-200 hover:shadow-lg",
        isOverdue && "border-red-200 dark:border-red-800",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Invoice #{bill.id.slice(-8).toUpperCase()}
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 mt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(bill.date)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Due {formatDate(bill.dueDate)}</span>
                </span>
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={cn("capitalize", getStatusColor(bill.status))}
            >
              {bill.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Amount Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-500 mb-1">Total Amount</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(bill.total)}
              </p>
            </div>
            <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-500 mb-1">Outstanding</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(bill.total - (bill.paidAmount || 0))}
              </p>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Payment Progress</span>
              <span className="font-medium">{Math.round(getPaymentProgress())}%</span>
            </div>
            <Progress value={getPaymentProgress()} className="h-2" />
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Paid: {formatCurrency(bill.paidAmount || 0)}</span>
              <span>Total: {formatCurrency(bill.total)}</span>
            </div>
          </div>

          {/* Services Summary */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Services ({bill.items.length} items)
            </p>
            <div className="space-y-1">
              {bill.items.slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400 truncate">
                    {item.description}
                  </span>
                  <span className="font-medium ml-2">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
              {bill.items.length > 2 && (
                <p className="text-xs text-zinc-500">
                  +{bill.items.length - 2} more items
                </p>
              )}
            </div>
          </div>

          {isOverdue && (
            <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                This bill is overdue. Please make a payment as soon as possible.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(bill)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            {bill.status !== 'paid' && bill.status !== 'cancelled' && (
              <Button
                size="sm"
                onClick={() => onMakePayment(bill)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface PaymentDialogProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayment: (amount: number, method: PaymentMethod, notes?: string) => Promise<void>;
}

export function PaymentDialog({ bill, open, onOpenChange, onPayment }: PaymentDialogProps) {
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'credit_card' as PaymentMethod,
    notes: ''
  });
  const [processing, setProcessing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!bill || !paymentForm.amount) return;

    setProcessing(true);
    try {
      const amount = parseFloat(paymentForm.amount);
      await onPayment(amount, paymentForm.method, paymentForm.notes);
      setPaymentForm({ amount: '', method: 'credit_card', notes: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const remainingAmount = bill ? bill.total - (bill.paidAmount || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>Make Payment</span>
          </DialogTitle>
          <DialogDescription>
            Process payment for invoice #{bill?.id.slice(-8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        {bill && (
          <div className="space-y-6">
            {/* Bill Summary */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Total Amount:</span>
                <span className="font-medium">{formatCurrency(bill.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Paid Amount:</span>
                <span className="font-medium">{formatCurrency(bill.paidAmount || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Outstanding:</span>
                <span className="text-red-600 dark:text-red-400">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  max={remainingAmount}
                />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Maximum: {formatCurrency(remainingAmount)}</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setPaymentForm(prev => ({ 
                      ...prev, 
                      amount: remainingAmount.toString() 
                    }))}
                  >
                    Pay Full Amount
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value: PaymentMethod) => 
                    setPaymentForm(prev => ({ ...prev, method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Credit Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="debit_card">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Debit Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4" />
                        <span>Bank Transfer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Cash</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="check">
                      <div className="flex items-center space-x-2">
                        <Receipt className="w-4 h-4" />
                        <span>Check</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="insurance">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4" />
                        <span>Insurance</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add payment notes..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSubmit}
                disabled={!paymentForm.amount || processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Process Payment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface BillDetailsDialogProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayment?: () => void;
}

export function BillDetailsDialog({ bill, open, onOpenChange, onPayment }: BillDetailsDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span>Invoice Details</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn("capitalize", getStatusColor(bill.status))}
            >
              {bill.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Invoice #{bill.id.slice(-8).toUpperCase()} • {formatDate(bill.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Bill Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Invoice Date:</span>
                  <span>{formatDate(bill.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Due Date:</span>
                  <span className={cn(
                    new Date(bill.dueDate) < new Date() && bill.status !== 'paid'
                      ? "text-red-600 dark:text-red-400 font-medium"
                      : ""
                  )}>
                    {formatDate(bill.dueDate)}
                  </span>
                </div>
                {bill.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Paid Date:</span>
                    <span>{formatDate(bill.paidDate)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(bill.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount Paid:</span>
                  <span className="text-emerald-600">{formatCurrency(bill.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Outstanding:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(bill.total - (bill.paidAmount || 0))}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Payment Method</h4>
              <div className="space-y-2 text-sm">
                {bill.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Method:</span>
                    <span className="capitalize">{bill.paymentMethod.replace('_', ' ')}</span>
                  </div>
                )}
                {bill.notes && (
                  <div>
                    <span className="text-zinc-500">Notes:</span>
                    <p className="text-zinc-700 dark:text-zinc-300 mt-1">{bill.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Bill Items */}
          <div>
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">Services & Items</h4>
            <div className="space-y-3">
              {bill.items.map((item: BillItem, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {item.description}
                    </h5>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-zinc-500">
                      <span>Category: {item.category.replace('_', ' ')}</span>
                      <span>Service Date: {formatDate(item.serviceDate)}</span>
                      {item.insuranceCovered && (
                        <Badge variant="outline" className="text-xs">
                          Insurance Covered
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm">
                      <span>Quantity: {item.quantity}</span>
                      <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.amount)}
                    </p>
                    {item.insuranceAmount && (
                      <p className="text-sm text-emerald-600">
                        Insurance: {formatCurrency(item.insuranceAmount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Breakdown */}
          <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-lg">
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">Payment Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(bill.subtotal)}</span>
              </div>
              {bill.discount && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(bill.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatCurrency(bill.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(bill.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
            {bill.status !== 'paid' && bill.status !== 'cancelled' && onPayment && (
              <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={onPayment}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Make Payment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
