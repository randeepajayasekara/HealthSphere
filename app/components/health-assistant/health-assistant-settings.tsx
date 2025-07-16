/**
 * Health Assistant Settings Component
 * Configuration options for the AI Health Assistant
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Shield, 
  Brain, 
  Mic, 
  FileText, 
  Heart, 
  Eye,
  Volume2,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';

interface HealthAssistantSettingsProps {
  userId: string;
  userRole: string;
}

export function HealthAssistantSettings({ userId, userRole }: HealthAssistantSettingsProps) {
  const [settings, setSettings] = useState({
    // AI Preferences
    aiConfidenceThreshold: [75],
    autoEmergencyDetection: true,
    personalizedRecommendations: true,
    medicalHistoryIntegration: true,
    
    // Notification Settings
    emergencyAlerts: true,
    reportAnalysisComplete: true,
    followUpReminders: true,
    
    // Privacy Settings
    dataSharing: false,
    anonymousAnalytics: true,
    retainChatHistory: true,
    
    // Accessibility
    voiceInput: false,
    screenReaderOptimized: false,
    largeText: false,
    highContrast: false,
    
    // Communication Preferences
    preferredContactMethod: 'push',
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '07:00'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      // TODO: Save to API
      console.log('Saving health assistant settings:', settings);
      // await fetch(`/api/health-assistant/settings`, { ... });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = () => {
    setSettings({
      aiConfidenceThreshold: [75],
      autoEmergencyDetection: true,
      personalizedRecommendations: true,
      medicalHistoryIntegration: true,
      emergencyAlerts: true,
      reportAnalysisComplete: true,
      followUpReminders: true,
      dataSharing: false,
      anonymousAnalytics: true,
      retainChatHistory: true,
      voiceInput: false,
      screenReaderOptimized: false,
      largeText: false,
      highContrast: false,
      preferredContactMethod: 'push',
      quietHours: false,
      quietStart: '22:00',
      quietEnd: '07:00'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* AI Assistant Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>AI Assistant Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                AI Confidence Threshold: {settings.aiConfidenceThreshold[0]}%
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Minimum confidence level for AI recommendations
              </p>
              <Slider
                value={settings.aiConfidenceThreshold}
                onValueChange={(value) => updateSetting('aiConfidenceThreshold', value)}
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Automatic Emergency Detection</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scan messages for emergency keywords
                </p>
              </div>
              <Switch
                checked={settings.autoEmergencyDetection}
                onCheckedChange={(checked) => updateSetting('autoEmergencyDetection', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Personalized Recommendations</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use your medical history for tailored advice
                </p>
              </div>
              <Switch
                checked={settings.personalizedRecommendations}
                onCheckedChange={(checked) => updateSetting('personalizedRecommendations', checked)}
              />
            </div>

            {userRole !== 'patient' && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Medical History Integration</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Access patient medical history for context
                  </p>
                </div>
                <Switch
                  checked={settings.medicalHistoryIntegration}
                  onCheckedChange={(checked) => updateSetting('medicalHistoryIntegration', checked)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-red-500" />
                <span>Emergency Alerts</span>
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Critical health situation notifications
              </p>
            </div>
            <Switch
              checked={settings.emergencyAlerts}
              onCheckedChange={(checked) => updateSetting('emergencyAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span>Report Analysis Complete</span>
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                When medical report analysis is finished
              </p>
            </div>
            <Switch
              checked={settings.reportAnalysisComplete}
              onCheckedChange={(checked) => updateSetting('reportAnalysisComplete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span>Follow-up Reminders</span>
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reminders for recommended follow-up actions
              </p>
            </div>
            <Switch
              checked={settings.followUpReminders}
              onCheckedChange={(checked) => updateSetting('followUpReminders', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-sm font-medium">Preferred Contact Method</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'push', label: 'Push Notifications', icon: Smartphone },
                { value: 'email', label: 'Email', icon: Mail },
                { value: 'sms', label: 'SMS', icon: MessageSquare },
                { value: 'none', label: 'None', icon: Volume2 }
              ].map((method) => (
                <Button
                  key={method.value}
                  variant={settings.preferredContactMethod === method.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('preferredContactMethod', method.value)}
                  className="flex items-center space-x-2 justify-start"
                >
                  <method.icon className="h-4 w-4" />
                  <span>{method.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Data Sharing for Research</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share anonymized data to improve healthcare research
              </p>
            </div>
            <Switch
              checked={settings.dataSharing}
              onCheckedChange={(checked) => updateSetting('dataSharing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Anonymous Analytics</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help improve the AI assistant with usage analytics
              </p>
            </div>
            <Switch
              checked={settings.anonymousAnalytics}
              onCheckedChange={(checked) => updateSetting('anonymousAnalytics', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Retain Chat History</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep conversation history for better assistance
              </p>
            </div>
            <Switch
              checked={settings.retainChatHistory}
              onCheckedChange={(checked) => updateSetting('retainChatHistory', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-purple-600" />
            <span>Accessibility Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span>Voice Input</span>
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enable voice recording for queries
              </p>
            </div>
            <Switch
              checked={settings.voiceInput}
              onCheckedChange={(checked) => updateSetting('voiceInput', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Screen Reader Optimized</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enhanced compatibility with screen readers
              </p>
            </div>
            <Switch
              checked={settings.screenReaderOptimized}
              onCheckedChange={(checked) => updateSetting('screenReaderOptimized', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Large Text</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Increase text size for better readability
              </p>
            </div>
            <Switch
              checked={settings.largeText}
              onCheckedChange={(checked) => updateSetting('largeText', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>High Contrast Mode</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enhanced contrast for visual accessibility
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button onClick={saveSettings} className="flex-1">
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
        <Button variant="outline" onClick={resetSettings}>
          Reset to Default
        </Button>
      </div>

      {/* Role Badge */}
      <div className="flex justify-center pt-4">
        <Badge variant="secondary" className={`${userRole}-theme`}>
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Settings
        </Badge>
      </div>
    </div>
  );
}
