import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, UserCheck, FileText, AlertTriangle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-red-100/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Your privacy is our priority. Learn how we protect and handle your personal health information.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="outline" className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400">
              <Lock className="w-3 h-3 mr-1" />
              HIPAA Compliant
            </Badge>
            <Badge variant="outline" className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400">
              <Shield className="w-3 h-3 mr-1" />
              SOC 2 Type II
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
                <Eye className="w-5 h-5 mr-2" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>Personal information (name, email, phone number)</li>
                <li>Medical information (when you choose to share it)</li>
                <li>Device and usage information</li>
                <li>Location data (with your consent)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Lock className="w-5 h-5 mr-2" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <UserCheck className="w-5 h-5 mr-2" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>Access your personal information</li>
                <li>Update or correct your information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized or unlawful processing, accidental loss, destruction, 
                or damage. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>End-to-end encryption for all data transmissions</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication systems</li>
                <li>Employee training on data protection</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <FileText className="w-5 h-5 mr-2" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-zinc-300">
                If you have any questions about this Privacy Policy, please contact us at:
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
