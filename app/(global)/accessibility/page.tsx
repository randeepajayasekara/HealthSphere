import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accessibility,
  Eye,
  Ear,
  Hand,
  Monitor,
  Keyboard,
  Volume2,
} from "lucide-react";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-red-100/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-lg flex items-center justify-center">
              <Accessibility className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Accessibility Statement
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            HealthSphere is committed to ensuring digital accessibility for
            people with disabilities. We are continually improving the user
            experience for everyone.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge
              variant="outline"
              className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400"
            >
              <Eye className="w-3 h-3 mr-1" />
              WCAG 2.1 AA
            </Badge>
            <Badge
              variant="outline"
              className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400"
            >
              <Accessibility className="w-3 h-3 mr-1" />
              Universal Design
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Accessibility className="w-5 h-5 mr-2" />
                Our Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                HealthSphere is committed to providing a website that is
                accessible to the widest possible audience, regardless of
                technology or ability. We aim to comply with all applicable
                standards and guidelines to ensure our platform is accessible to
                all users.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Monitor className="w-5 h-5 mr-2" />
                Accessibility Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      Visual
                    </span>
                  </div>
                  <ul className="text-sm text-slate-700 dark:text-zinc-300 space-y-1 pl-6">
                    <li>High contrast mode support</li>
                    <li>Scalable text and UI elements</li>
                    <li>Screen reader compatibility</li>
                    <li>Alternative text for images</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Keyboard className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      Motor
                    </span>
                  </div>
                  <ul className="text-sm text-slate-700 dark:text-zinc-300 space-y-1 pl-6">
                    <li>Full keyboard navigation</li>
                    <li>Focus indicators</li>
                    <li>Adequate click target sizes</li>
                    <li>Voice navigation support</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Ear className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      Auditory
                    </span>
                  </div>
                  <ul className="text-sm text-slate-700 dark:text-zinc-300 space-y-1 pl-6">
                    <li>Captions for video content</li>
                    <li>Visual indicators for alerts</li>
                    <li>No auto-playing audio</li>
                    <li>Volume controls</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Hand className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      Cognitive
                    </span>
                  </div>
                  <ul className="text-sm text-slate-700 dark:text-zinc-300 space-y-1 pl-6">
                    <li>Clear, simple language</li>
                    <li>Consistent navigation</li>
                    <li>Error prevention and recovery</li>
                    <li>Customizable interface</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Volume2 className="w-5 h-5 mr-2" />
                Assistive Technology Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                HealthSphere is designed to be compatible with assistive
                technologies, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                <li>Voice recognition software</li>
                <li>Switch navigation devices</li>
                <li>Magnification software</li>
                <li>Alternative keyboards</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Monitor className="w-5 h-5 mr-2" />
                Standards Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-zinc-300">
                We strive to conform to the following accessibility standards:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-zinc-300">
                <li>
                  Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                </li>
                <li>Section 508 of the Rehabilitation Act</li>
                <li>Americans with Disabilities Act (ADA) compliance</li>
                <li>European Accessibility Act requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                <Accessibility className="w-5 h-5 mr-2" />
                Feedback and Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-zinc-300">
                We welcome your feedback on the accessibility of HealthSphere.
                If you encounter any accessibility barriers or have suggestions
                for improvement, please contact us:
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
