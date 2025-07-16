"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GloalHeader from "./components/layout/Global/global-header";
import { 
  Scan, 
  QrCode, 
  Shield, 
  Heart, 
  Activity, 
  Users, 
  Calendar,
  Stethoscope,
  FileText,
  Brain,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: QrCode,
      title: "Universal Medical ID",
      description: "Secure QR-based medical information access for emergencies",
      href: "/umid",
      badge: "New",
      color: "bg-emerald-500"
    },
    {
      icon: Stethoscope,
      title: "Doctor Dashboard",
      description: "Comprehensive medical practice management with real-time patient data",
      href: "/doctor",
      badge: "Professional",
      color: "bg-red-500"
    },
    {
      icon: Calendar,
      title: "Appointment System",
      description: "Smart scheduling with conflict detection and reminders",
      href: "/appointments",
      color: "bg-purple-500"
    },
    {
      icon: FileText,
      title: "Lab Results",
      description: "Digital lab reports with instant notifications",
      href: "/lab-results",
      color: "bg-cyan-500"
    },
    {
      icon: Brain,
      title: "AI Health Assistant",
      description: "Intelligent health insights and symptom analysis",
      href: "/ai-assistant",
      badge: "AI",
      color: "bg-orange-500"
    },
    {
      icon: Activity,
      title: "Health Analytics",
      description: "Real-time monitoring and health trend analysis",
      href: "/analytics",
      color: "bg-green-500"
    }
  ];

  return (
    <>
      <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-emerald-900/20">
        <GloalHeader />
        
        {/* Animated corner gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-transparent rounded-full animate-pulse" 
               style={{
                 animation: 'float 6s ease-in-out infinite',
                 animationDelay: '0s'
               }} />
          
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-bl from-emerald-400/20 via-cyan-400/15 to-transparent rounded-full animate-pulse"
               style={{
                 animation: 'float 8s ease-in-out infinite reverse',
                 animationDelay: '2s'
               }} />
          
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-pink-400/20 via-rose-400/15 to-transparent rounded-full animate-pulse"
               style={{
                 animation: 'float 7s ease-in-out infinite',
                 animationDelay: '4s'
               }} />
          
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-yellow-400/20 via-orange-400/15 to-transparent rounded-full animate-pulse"
               style={{
                 animation: 'float 5s ease-in-out infinite reverse',
                 animationDelay: '1s'
               }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Introducing Universal Medical ID</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-900 dark:from-slate-100 dark:via-blue-100 dark:to-emerald-100 bg-clip-text text-transparent">
              HealthSphere
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Transforming healthcare through digital innovation. Secure, intelligent, and comprehensive 
              medical management for the modern world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-3 text-lg"
                onClick={() => router.push('/umid')}
              >
                <QrCode className="w-5 h-5 mr-2" />
                Try UMID System
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-slate-300 dark:border-slate-600 px-8 py-3 text-lg"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Enter Dashboard
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
                Comprehensive Healthcare Solutions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                From emergency medical access to AI-powered health insights, 
                HealthSphere provides everything healthcare providers and patients need.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card 
                    key={index} 
                    className="group cursor-pointer border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    onClick={() => router.push(feature.href)}
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl ${feature.color} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {feature.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {feature.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600">99.9%</div>
                <div className="text-slate-600 dark:text-slate-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">24/7</div>
                <div className="text-slate-600 dark:text-slate-400">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">HIPAA</div>
                <div className="text-slate-600 dark:text-slate-400">Compliant</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-600">256-bit</div>
                <div className="text-slate-600 dark:text-slate-400">Encryption</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-6 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Healthcare?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of healthcare providers who trust HealthSphere for secure, 
              efficient, and intelligent medical management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3"
                onClick={() => router.push('/register')}
              >
                Get Started Today
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-3"
                onClick={() => router.push('/demo')}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(10px, -15px) scale(1.05);
            }
            50% {
              transform: translate(-5px, -10px) scale(0.95);
            }
            75% {
              transform: translate(-10px, 5px) scale(1.02);
            }
          }
        `}</style>
      </div>
    </>
  );
}
