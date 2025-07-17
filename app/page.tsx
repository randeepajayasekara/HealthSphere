"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {motion} from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GloalHeader from "./components/layout/Global/global-header";
import GlobalFooter from "./components/layout/Global/global-footer";
import { useAuth } from "@/app/contexts/auth-context";
import { initSecurityMeasures } from "@/app/utils/security-client";
import {
  QrCode,
  Shield,
  Heart,
  Activity,
  Users,
  Calendar,
  UserCheck2,
  Stethoscope,
  FileText,
  Brain,
  ArrowRight,
  Sparkles,
  Star,
  Lock,
  Zap,
  User,
  Globe,
  MessageCircle,
  Smartphone,
  Database,
  Cloud,
  UserCheck,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  HeartHandshake,
  Microscope,
  Pill,
  Ambulance,
  UserX,
  Building2,
  Laptop,
  Tablet,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Initialize security measures
    const cleanup = initSecurityMeasures();
    
    // Cleanup on unmount
    return cleanup;
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users to their dashboard
      switch (user.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'doctor':
          router.push('/doctor');
          break;
        case 'patient':
          router.push('/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const features = [
    {
      icon: QrCode,
      title: "Universal Medical ID",
      description: "Secure QR-based emergency medical access",
      href: "/umid",
      badge: "Emergency",
      color: "bg-red-600",
      highlight: true,
    },
    {
      icon: Stethoscope,
      title: "Doctor Portal",
      description: "Professional medical practice management",
      href: "/doctor",
      badge: "Professional",
      color: "bg-red-700",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered appointment management",
      href: "/appointments",
      color: "bg-red-800",
    },
    {
      icon: FileText,
      title: "Digital Records",
      description: "Secure medical documentation",
      href: "/lab-results",
      color: "bg-red-900",
    },
    {
      icon: Brain,
      title: "AI Health Assistant",
      description: "Intelligent symptom analysis",
      href: "/ai-assistant",
      badge: "AI",
      color: "bg-red-600",
    },
    {
      icon: Activity,
      title: "Health Monitoring",
      description: "Real-time health analytics",
      href: "/analytics",
      color: "bg-red-700",
    },
  ];

  const stats = [
    { icon: Shield, value: "100%", label: "Privacy Secured", color: "text-red-400" },
    { icon: Clock, value: "24/7", label: "Support", color: "text-red-500" },
    { icon: UserCheck, value: "HIPAA", label: "Compliant", color: "text-red-600" },
    { icon: Lock, value: "TLS", label: "Encryption", color: "text-red-700" },
  ];

  const benefits = [
    {
      icon: HeartHandshake,
      title: "Patient-Centered Care",
      description: "Comprehensive care coordination",
    },
    {
      icon: Microscope,
      title: "Advanced Diagnostics",
      description: "AI-powered medical insights",
    },
    {
      icon: Pill,
      title: "Medication Management",
      description: "Smart prescription tracking",
    },
    {
      icon: Ambulance,
      title: "Emergency Response",
      description: "Instant medical data access",
    },
    {
      icon: Building2,
      title: "Multi-Facility Support",
      description: "Seamless healthcare networks",
    },
    {
      icon: TrendingUp,
      title: "Health Analytics",
      description: "Data-driven medical decisions",
    },
  ];

  const devices = [
    { icon: Laptop, name: "Desktop" },
    { icon: Tablet, name: "Tablet" },
    { icon: Smartphone, name: "Mobile" },
    { icon: Globe, name: "Web" },
  ];

  return (
    <>
      <GloalHeader />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        >
      <div className="min-h-screen bg-white dark:bg-black overflow-hidden relative no-select no-context no-drag protected">
        {/* Animated Background Gradients */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          {/* Moving gradient waves */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 animate-gradient-xy"></div>
          
          {/* Floating gradient shapes */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-200/30 to-red-300/20 dark:from-red-900/20 dark:to-red-800/10 rounded-full blur-3xl animate-float-slow gpu-accelerated"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-l from-red-300/20 to-red-400/15 dark:from-red-800/15 dark:to-red-700/10 rounded-full blur-3xl animate-float-slower gpu-accelerated"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-t from-red-100/40 to-red-200/25 dark:from-red-950/25 dark:to-red-900/15 rounded-full blur-3xl animate-float-fast gpu-accelerated"></div>
          
          {/* Additional subtle gradients */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-red-100/5 via-transparent to-red-200/5 dark:from-red-900/5 dark:to-red-800/5"></div>
        </motion.div>

        <div className="relative z-10 container mx-auto mb-8 px-4 py-8 space-y-20">
          {/* Hero Section */}
          <motion.div 
        className="text-center space-y-8 pt-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
          >
        <motion.div 
          className="inline-flex items-center space-x-2 px-6 py-3 bg-red-100 dark:bg-zinc-800 text-red-800 dark:text-red-200 rounded-full text-sm font-medium border border-red-200 dark:border-zinc-700 secure-content"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Introducing Next-Gen Healthcare</span>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-700 dark:from-red-400 dark:via-red-300 dark:to-red-500 bg-clip-text text-transparent leading-tight secure-content will-change-transform"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span>HealthSphere</span>
        </motion.h1>

        <motion.p 
          className="text-lg md:text-md lg:text-xl text-slate-700 dark:text-zinc-300 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Revolutionary healthcare management platform designed for modern medical practices. 
          Secure, intelligent, and accessible healthcare solutions for providers and patients.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-red-300 dark:border-zinc-600 text-red-600 dark:text-red-400 dark:hover:bg-zinc-800 px-8 py-4 text-md transition-all duration-300 security-focus"
            onClick={() => router.push("/login")}
          >
            <User className="w-5 h-5 mr-2" />
            Sign In
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-red-300 dark:border-zinc-600 text-red-600 dark:text-red-400  dark:hover:bg-zinc-800 px-8 py-4 text-md transition-all duration-300 security-focus"
            onClick={() => router.push("/login")}
          >
            <UserCheck className="w-5 h-5 mr-2" />
            Sign Up
          </Button>
        </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
        className="space-y-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
          >
        <div className="text-center space-y-4">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white secure-content">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto">
            From emergency medical access to AI-powered health insights, 
            HealthSphere provides everything modern healthcare needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
          >
            <Card
              className={`group cursor-pointer border-2 ${
            feature.highlight 
              ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-zinc-900/50' 
              : 'border-transparent hover:border-red-200 dark:hover:border-red-800 bg-white/80 dark:bg-zinc-900/80'
              } backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 transform-gpu will-change-transform secure-content no-drag`}
              onClick={() => router.push(feature.href)}
            >
              <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className={`p-4 rounded-xl ${feature.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 gpu-accelerated`}
              >
                <Icon className="w-6 h-6" />
              </div>
              {feature.badge && (
                <Badge variant="secondary" className="text-xs bg-red-100 dark:bg-zinc-800 text-red-800 dark:text-red-200 secure-content">
              {feature.badge}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors secure-content">
              {feature.title}
            </CardTitle>
              </CardHeader>
              <CardContent>
            <CardDescription className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              {feature.description}
            </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
            );
          })}
        </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
        className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg rounded-2xl p-8 border border-red-200 dark:border-zinc-700 shadow-xl secure-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
          >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
          <motion.div 
            key={index} 
            className="text-center space-y-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.6 + index * 0.1 }}
          >
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <Icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className={`text-2xl md:text-3xl font-bold ${stat.color} secure-content`}>
              {stat.value}
            </div>
            <div className="text-slate-600 dark:text-zinc-400 font-medium">
              {stat.label}
            </div>
          </motion.div>
            );
          })}
        </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div 
        className="space-y-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
          >
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white secure-content">
            Why Choose HealthSphere?
          </h2>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Advanced technology meets compassionate care in our comprehensive platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
          <motion.div
            key={index}
            className="text-center space-y-4 p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-red-100 dark:border-zinc-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 will-change-transform secure-content no-drag"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.9 + index * 0.1 }}
          >
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg gpu-accelerated">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white secure-content">
              {benefit.title}
            </h3>
            <p className="text-slate-600 dark:text-zinc-400">
              {benefit.description}
            </p>
          </motion.div>
            );
          })}
        </div>
          </motion.div>

          {/* Device Compatibility */}
          <motion.div 
        className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-8 md:p-12 shadow-xl secure-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.3 }}
          >
        <div className="text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Access Anywhere, Anytime
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            HealthSphere works seamlessly across all your devices without hassle
          </p>
          
          <div className="flex justify-center items-center space-x-8 pt-4">
            {devices.map((device, index) => {
          const Icon = device.icon;
          return (
            <motion.div 
              key={index} 
              className="text-center space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 2.4 + index * 0.1 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300 transform hover:scale-110 gpu-accelerated">
            <Icon className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">{device.name}</p>
            </motion.div>
          );
            })}
          </div>
        </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
        className="text-center space-y-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-red-200 dark:border-zinc-700 shadow-xl secure-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.7 }}
          >
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Join the community of healthcare providers who trust HealthSphere for secure, 
            efficient, and intelligent medical management.
          </p>
        </div>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.8 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 will-change-transform security-focus"
            onClick={() => router.push("/register")}
          >
            <UserCheck className="w-5 h-5 mr-2" />
            Get Started Today
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-red-300 dark:border-zinc-600 text-red-600 dark:text-red-400  dark:hover:bg-zinc-800 px-8 py-4 transition-all duration-300 security-focus"
            onClick={() => router.push("/demo")}
          >
            <Heart className="w-5 h-5 mr-2" />
            Watch Demo
          </Button>
        </motion.div>
          </motion.div>
        </div>

        {/* Custom Animations */}
        <style jsx>{`
          @keyframes gradient-xy {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
          }
          
          @keyframes float-slow {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(30px, -30px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 20px) scale(0.9);
        }
          }
          
          @keyframes float-slower {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(-40px, -20px) scale(1.05);
        }
          }
          
          @keyframes float-fast {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        25% {
          transform: translate(20px, -10px) scale(1.1);
        }
        75% {
          transform: translate(-10px, 15px) scale(0.95);
        }
          }
          
          .animate-gradient-xy {
        animation: gradient-xy 15s ease infinite;
        background-size: 400% 400%;
          }
          
          .animate-float-slow {
        animation: float-slow 20s ease-in-out infinite;
          }
          
          .animate-float-slower {
        animation: float-slower 25s ease-in-out infinite;
          }
          
          .animate-float-fast {
        animation: float-fast 15s ease-in-out infinite;
          }
          
          .bg-gradient-radial {
        background: radial-gradient(circle, var(--tw-gradient-stops));
          }
          
          .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
          }
          
          .no-context {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
          }
          
          .no-drag {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
          }
          
          .protected {
        position: relative;
        overflow: hidden;
          }
          
          .secure-content {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
          }
          
          .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
          }
          
          .will-change-transform {
        will-change: transform;
          }
          
          .security-focus:focus {
        outline: 2px solid #dc2626;
        outline-offset: 2px;
          }
          
          /* Responsive breakpoints */
          @media (max-width: 768px) {
        .animate-float-slow,
        .animate-float-slower,
        .animate-float-fast {
          animation-duration: 10s;
        }
          }
          
          @media (prefers-reduced-motion: reduce) {
        .animate-gradient-xy,
        .animate-float-slow,
        .animate-float-slower,
        .animate-float-fast {
          animation: none !important;
        }
          }
        `}</style>
      </div>
      
      {/* Modern Footer */}
      </motion.div>
      <GlobalFooter />
    </>
  );
}
