"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ModeToggle } from "./components/features/toggles/theme-toggle";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  // Handle mouse movement for spatial effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Hero Section with Spatial Effect */}
      <div
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Spatial Illusion Elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-500/20 dark:bg-blue-400/20"
              style={{
                width: `${(i + 1) * 100}px`,
                height: `${(i + 1) * 100}px`,
                x: (mousePosition.x - window.innerWidth / 2) / (10 - i * 2),
                y: (mousePosition.y - window.innerHeight / 2) / (10 - i * 2),
                opacity: 0.8 - i * 0.15,
              }}
              animate={{
                scale: [1, 1.02, 1],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left">
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Revolutionizing{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Healthcare
                </span>{" "}
                with Technology
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Experience the future of healthcare with our innovative
                solutions designed to improve patient care and outcomes.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg mr-4 transition-colors duration-300">
                  Get Started
                </button>
                <button className="bg-transparent border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600/10 font-semibold px-6 py-3 rounded-lg transition-colors duration-300">
                  Learn More
                </button>
                <div className="ml-4"></div>
                <ModeToggle />
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 mt-12 md:mt-0">
              <motion.div
                className="relative h-[400px] w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl transform rotate-3 dark:from-blue-600/20 dark:to-purple-600/20"></div>
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center p-6">
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <Image
                      src="https://fcmod.org/wp-content/uploads/2020/07/starburst-5392040_1280-e1596212186834.png"
                      alt="Healthcare Illustration"
                      fill
                      style={{ objectFit: "cover" }}
                      className="p-6"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg
            className="w-10 h-10 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>

      {/* Features Section with Parallax */}
      <motion.section
        style={{ y }}
        className="py-20 bg-gray-100 dark:bg-gray-800 transition-colors duration-300"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Our Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Cutting-edge technologies designed to enhance patient care,
              streamline operations, and improve health outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: "Telemedicine",
                description:
                  "Connect with healthcare providers from the comfort of your home.",
                icon: "🏥",
              },
              {
                title: "Health Monitoring",
                description:
                  "Track your vitals and health metrics in real-time with smart devices.",
                icon: "📊",
              },
              {
                title: "AI Diagnostics",
                description:
                  "Advanced AI algorithms to assist in accurate and early diagnosis.",
                icon: "🤖",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <button className="bg-white hover:bg-gray-100 text-blue-600 font-bold px-8 py-4 rounded-lg text-lg shadow-lg transition-colors duration-300">
            Get Started Today
          </button>
        </div>
      </section>

    </main>
  );
}
