"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 dark:from-black dark:via-zinc-950 dark:to-emerald-950/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar Skeleton */}
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
              
              {/* Profile Info Skeleton */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-5 w-32" />
                </div>

                {/* Contact Info Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>

                {/* Badges Skeleton */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-24" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Navigation Skeleton */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-4" />
                
                <div className="space-y-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i}>
                      <div className="flex items-center space-x-3 p-3">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      {i < 5 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>

                {/* Quick Actions Skeleton */}
                <div className="pt-6">
                  <Separator className="mb-4" />
                  <Skeleton className="h-3 w-24 mb-3" />
                  <div className="space-y-1">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2 p-2">
                        <Skeleton className="w-3 h-3" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-9">
            <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Section Header Skeleton */}
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-6 h-6" />
                    <div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-80" />
                    </div>
                  </div>

                  <Separator />

                  {/* Content Skeleton */}
                  <div className="space-y-6">
                    {[...Array(4)].map((_, sectionIndex) => (
                      <div key={sectionIndex} className="space-y-4">
                        <Skeleton className="h-5 w-32" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[...Array(4)].map((_, fieldIndex) => (
                            <div key={fieldIndex} className="space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-10 w-full" />
                            </div>
                          ))}
                        </div>
                        
                        {sectionIndex < 3 && <Separator className="mt-6" />}
                      </div>
                    ))}

                    {/* Action Buttons Skeleton */}
                    <div className="flex gap-3 pt-6">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
