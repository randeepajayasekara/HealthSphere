import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cookie,
  Settings,
  Eye,
  AlertTriangle,
  FileText,
  CheckCircle,
} from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-red-100/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-lg flex items-center justify-center">
              <Cookie className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Learn about how we use cookies and similar technologies to enhance
            your experience on HealthSphere.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge
              variant="outline"
              className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400"
            >
              <Settings className="w-3 h-3 mr-1" />
              Customizable
            </Badge>
            <Badge
              variant="outline"
              className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400"
            >
              <Eye className="w-3 h-3 mr-1" />
              Transparent
            </Badge>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 dark:text-zinc-500 text-center">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Cookie className="w-5 h-5 mr-2" />
                What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                Cookies are small text files that are placed on your device when
                you visit our website. They help us provide you with a better
                experience by remembering your preferences and understanding how
                you use our services.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Settings className="w-5 h-5 mr-2" />
                Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Essential Cookies
                  </h4>
                  <p className="text-slate-700 dark:text-zinc-300">
                    These cookies are necessary for the website to function and
                    cannot be switched off in our systems.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Performance Cookies
                  </h4>
                  <p className="text-slate-700 dark:text-zinc-300">
                    These cookies allow us to count visits and traffic sources
                    so we can measure and improve performance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Functional Cookies
                  </h4>
                  <p className="text-slate-700 dark:text-zinc-300">
                    These cookies enable the website to provide enhanced
                    functionality and personalization.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <CheckCircle className="w-5 h-5 mr-2" />
                Your Cookie Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                You have several options to control cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>
                  Use our cookie consent banner to customize your preferences
                </li>
                <li>Adjust your browser settings to block or delete cookies</li>
                <li>Use private/incognito browsing mode</li>
                <li>Contact us to opt out of non-essential cookies</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Third-Party Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                We may use third-party services that set their own cookies.
                These include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>Google Analytics for website analytics</li>
                <li>Social media platforms for content sharing</li>
                <li>CDN services for improved performance</li>
                <li>Authentication services for secure login</li>
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
                If you have any questions about our use of cookies, please
                contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-slate-700 dark:text-zinc-300">
                  <strong>Email:</strong> cookies@healthsphere.com
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
