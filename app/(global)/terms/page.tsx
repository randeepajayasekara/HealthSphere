import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Scale, Shield, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-red-100/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-lg flex items-center justify-center">
              <Scale className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            By using HealthSphere, you agree to these terms. Please read them carefully.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="outline" className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400">
              <Shield className="w-3 h-3 mr-1" />
              Legal Protection
            </Badge>
            <Badge variant="outline" className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Fair Use Policy
            </Badge>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 dark:text-zinc-500 text-center">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <CheckCircle className="w-5 h-5 mr-2" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                By accessing and using HealthSphere, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <FileText className="w-5 h-5 mr-2" />
                Use License
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                Permission is granted to temporarily download one copy of the materials on 
                HealthSphere for personal, non-commercial transitory viewing only. This is the 
                grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Users className="w-5 h-5 mr-2" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                As a user of HealthSphere, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>Provide accurate and complete information</li>
                <li>Keep your account credentials secure</li>
                <li>Use the service only for lawful purposes</li>
                <li>Respect other users' privacy and rights</li>
                <li>Not attempt to harm or disrupt the service</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Medical Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                HealthSphere is not a substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your physician or other qualified health provider with any questions 
                you may have regarding a medical condition.
              </p>
              <p className="text-slate-700 dark:text-zinc-300">
                Never disregard professional medical advice or delay in seeking it because of something you 
                have read on HealthSphere. If you think you may have a medical emergency, call your doctor 
                or emergency services immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Scale className="w-5 h-5 mr-2" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                In no event shall HealthSphere or its suppliers be liable for any damages (including, 
                without limitation, damages for loss of data or profit, or due to business interruption) 
                arising out of the use or inability to use the materials on HealthSphere, even if 
                HealthSphere or an authorized representative has been notified orally or in writing of 
                the possibility of such damage.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <FileText className="w-5 h-5 mr-2" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                HealthSphere may revise these terms of service at any time without notice. By using 
                this service, you are agreeing to be bound by the then current version of these terms 
                of service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <FileText className="w-5 h-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-zinc-300">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-slate-700 dark:text-zinc-300">
                  <strong>Email:</strong> support@healthsphere.com
                </p>
                <p className="text-slate-700 dark:text-zinc-300">
                  <strong>Phone:</strong> +94711234567
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
