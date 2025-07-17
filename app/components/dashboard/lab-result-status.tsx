'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TestTube, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types
import type { LabResult, LabResultValue } from '@/app/types';

interface LabResultStatusProps {
  result: LabResult;
  variant?: 'compact' | 'detailed' | 'inline';
  showTooltip?: boolean;
  showTrend?: boolean;
  className?: string;
}

interface StatusAnalysis {
  status: 'normal' | 'abnormal' | 'critical' | 'pending' | 'review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  textColor: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  message: string;
  details: string[];
  abnormalValues: LabResultValue[];
  criticalValues: LabResultValue[];
}

const LabResultStatus: React.FC<LabResultStatusProps> = ({
  result,
  variant = 'detailed',
  showTooltip = true,
  showTrend = false,
  className = ''
}) => {
  // Analyze the lab result status
  const analyzeStatus = (): StatusAnalysis => {
    const abnormalValues = result.resultValues?.filter(value => value.isAbnormal) || [];
    const criticalValues = abnormalValues.filter(value => {
      // Simple heuristic for critical values - could be enhanced with reference ranges
      const numValue = typeof value.value === 'number' ? value.value : parseFloat(value.value as string);
      return !isNaN(numValue) && (numValue > 1000 || numValue < 0.1);
    });

    if (criticalValues.length > 0) {
      return {
        status: 'critical',
        severity: 'critical',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-300',
        badgeVariant: 'destructive',
        message: 'Critical Values Detected',
        details: [
          `${criticalValues.length} critical value(s)`,
          'Immediate medical attention may be required',
          'Contact healthcare provider urgently'
        ],
        abnormalValues,
        criticalValues
      };
    } else if (abnormalValues.length > 0) {
      const severityLevel = abnormalValues.length > 3 ? 'high' : abnormalValues.length > 1 ? 'medium' : 'low';
      
      return {
        status: 'abnormal',
        severity: severityLevel,
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        badgeVariant: 'secondary',
        message: severityLevel === 'high' ? 'Multiple Abnormal Values' : 'Abnormal Result',
        details: [
          `${abnormalValues.length} abnormal value(s)`,
          'Review with healthcare provider',
          severityLevel === 'high' ? 'Multiple parameters outside normal range' : 'Some values outside normal range'
        ],
        abnormalValues,
        criticalValues
      };
    } else if (result.resultValues?.length === 0) {
      return {
        status: 'pending',
        severity: 'low',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-700 dark:text-blue-300',
        badgeVariant: 'outline',
        message: 'Results Pending',
        details: [
          'Test completed, awaiting results',
          'Results typically available within 24-48 hours'
        ],
        abnormalValues,
        criticalValues
      };
    } else {
      return {
        status: 'normal',
        severity: 'low',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-300',
        badgeVariant: 'default',
        message: 'Normal Results',
        details: [
          'All values within normal range',
          'No immediate concerns identified'
        ],
        abnormalValues,
        criticalValues
      };
    }
  };

  const analysis = analyzeStatus();
  const StatusIcon = analysis.icon;

  // Render compact variant
  if (variant === 'compact') {
    const content = (
      <Badge variant={analysis.badgeVariant} className="flex items-center space-x-1">
        <StatusIcon className="w-3 h-3" />
        <span className="capitalize">{analysis.status}</span>
      </Badge>
    );

    if (!showTooltip) return content;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              <p className="font-medium">{analysis.message}</p>
              {analysis.details.map((detail, index) => (
                <p key={index} className="text-muted-foreground">{detail}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Render inline variant
  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <StatusIcon className={`w-4 h-4 ${analysis.color}`} />
        <span className={`text-sm font-medium ${analysis.textColor}`}>
          {analysis.message}
        </span>
        {analysis.abnormalValues.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {analysis.abnormalValues.length} abnormal
          </Badge>
        )}
      </div>
    );
  }

  // Render detailed variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`${analysis.bgColor} rounded-lg border p-4 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${analysis.bgColor} border`}>
            <StatusIcon className={`w-5 h-5 ${analysis.color}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${analysis.textColor}`}>
              {analysis.message}
            </h3>
            <p className="text-sm text-muted-foreground">
              {result.testName} • {result.laboratoryName}
            </p>
          </div>
        </div>
        <Badge variant={analysis.badgeVariant}>
          {analysis.status.toUpperCase()}
        </Badge>
      </div>

      {/* Status Details */}
      <div className="mt-4 space-y-2">
        {analysis.details.map((detail, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${analysis.color.replace('text-', 'bg-')}`} />
            <span className="text-muted-foreground">{detail}</span>
          </div>
        ))}
      </div>

      {/* Abnormal Values Details */}
      {analysis.abnormalValues.length > 0 && (
        <div className="mt-4 p-3 bg-background rounded border">
          <h4 className="font-medium text-foreground mb-2">
            {analysis.criticalValues.length > 0 ? 'Critical Values' : 'Abnormal Values'}
          </h4>
          <div className="space-y-1">
            {analysis.abnormalValues.slice(0, 3).map((value, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{value.parameter}</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${
                    analysis.criticalValues.includes(value) ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {value.value} {value.unit}
                  </span>
                  {analysis.criticalValues.includes(value) && (
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  )}
                </div>
              </div>
            ))}
            {analysis.abnormalValues.length > 3 && (
              <p className="text-xs text-muted-foreground pt-1">
                +{analysis.abnormalValues.length - 3} more abnormal values
              </p>
            )}
          </div>
        </div>
      )}

      {/* Trend Indicator */}
      {showTrend && (
        <div className="mt-4 flex items-center justify-between p-2 bg-background rounded border">
          <span className="text-sm text-muted-foreground">Recent Trend</span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">Stable</span>
          </div>
        </div>
      )}

      {/* Action Items */}
      {analysis.severity === 'critical' && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Immediate Action Required
            </span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Contact your healthcare provider immediately or seek emergency care if symptoms are severe.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default LabResultStatus;

// Export status analysis for use in other components
export const analyzeLabResultStatus = (result: LabResult) => {
  const abnormalValues = result.resultValues?.filter(value => value.isAbnormal) || [];
  const criticalCount = abnormalValues.filter(value => {
    const numValue = typeof value.value === 'number' ? value.value : parseFloat(value.value as string);
    return !isNaN(numValue) && (numValue > 1000 || numValue < 0.1);
  }).length;

  return {
    status: criticalCount > 0 ? 'critical' : abnormalValues.length > 0 ? 'abnormal' : 'normal',
    abnormalCount: abnormalValues.length,
    criticalCount,
    severity: criticalCount > 0 ? 'critical' : abnormalValues.length > 3 ? 'high' : abnormalValues.length > 1 ? 'medium' : 'low'
  };
};
