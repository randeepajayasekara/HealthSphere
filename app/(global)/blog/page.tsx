"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Heart, 
  Eye, 
  Clock, 
  User, 
  Calendar,
  ChevronRight,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Share2,
  Star,
  ArrowRight,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useBlog } from '@/hooks/use-blog';
import { useAuth } from '@/app/contexts/auth-context';
import { BlogPost, BlogCategory, UserRole } from '@/app/types';
import { seedBlogData } from '@/app/utils/seed-blog-data';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Category display configuration
const categoryConfig: Record<BlogCategory, { label: string; color: string; icon: string }> = {
  healthcare_tips: { label: 'Healthcare Tips', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: '💡' },
  medical_news: { label: 'Medical News', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '📰' },
  patient_stories: { label: 'Patient Stories', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: '❤️' },
  research_updates: { label: 'Research Updates', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', icon: '🔬' },
  health_awareness: { label: 'Health Awareness', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200', icon: '🎗️' },
  technology: { label: 'Technology', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', icon: '💻' },
  wellness: { label: 'Wellness', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '🌿' },
  prevention: { label: 'Prevention', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '🛡️' },
  mental_health: { label: 'Mental Health', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200', icon: '🧠' },
  nutrition: { label: 'Nutrition', color: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200', icon: '🥗' },
  exercise: { label: 'Exercise', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: '💪' },
  chronic_diseases: { label: 'Chronic Diseases', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '⚕️' },
  pediatric_health: { label: 'Pediatric Health', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', icon: '👶' },
  senior_health: { label: 'Senior Health', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200', icon: '👴' }
};

// Role-based permission checking
const canCreatePost = (role: UserRole): boolean => {
  return ['doctor', 'nurse', 'admin', 'hospital_management'].includes(role);
};

const canEditPost = (post: BlogPost, userId: string, userRole: UserRole): boolean => {
  return post.authorId === userId || ['admin', 'hospital_management'].includes(userRole);
};

export default function BlogPage() {
  const { user } = useAuth();
  const { 
    posts, 
    loading, 
    error, 
    featuredPosts, 
    categories,
    fetchPosts, 
    likePost, 
    incrementViews,
    searchPosts
  } = useBlog();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_viewed' | 'most_liked'>('newest');
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize blog data
  const initializeBlogData = useCallback(async () => {
    if (hasInitialized) return;
    
    try {
      // Try to fetch posts first
      const result = await fetchPosts({}, 10);
      
      // If no posts exist, seed the data
      if (result.posts.length === 0) {
        toast.loading('Setting up blog content...', { duration: 3000 });
        await seedBlogData();
        await fetchPosts({}, 10);
        toast.success('Blog content loaded successfully!');
      }
      
      setHasInitialized(true);
    } catch (error) {
      console.error('Failed to initialize blog data:', error);
      toast.error('Failed to load blog content');
    }
  }, [fetchPosts, hasInitialized]);

  useEffect(() => {
    initializeBlogData();
  }, [initializeBlogData]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchPosts({ 
        category: selectedCategory === 'all' ? undefined : selectedCategory 
      });
      return;
    }

    setIsSearching(true);
    try {
      await searchPosts(query, { 
        category: selectedCategory === 'all' ? undefined : selectedCategory 
      });
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [searchPosts, fetchPosts, selectedCategory]);

  // Handle category filter
  const handleCategoryChange = useCallback(async (category: string) => {
    const cat = category as BlogCategory | 'all';
    setSelectedCategory(cat);
    
    try {
      if (searchQuery.trim()) {
        await searchPosts(searchQuery, { 
          category: cat === 'all' ? undefined : cat 
        });
      } else {
        await fetchPosts({ 
          category: cat === 'all' ? undefined : cat 
        });
      }
    } catch (error) {
      toast.error('Failed to filter posts');
    }
  }, [searchQuery, searchPosts, fetchPosts]);

  // Handle post like
  const handleLikePost = useCallback(async (postId: string) => {
    if (!user) {
      toast.error('Please log in to like posts');
      return;
    }

    try {
      await likePost(postId);
      toast.success('Post liked!');
    } catch (error) {
      toast.error('Failed to like post');
    }
  }, [user, likePost]);

  // Handle post view
  const handleViewPost = useCallback(async (postId: string) => {
    try {
      await incrementViews(postId);
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  }, [incrementViews]);

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Get author role badge color
  const getRoleBadgeColor = (role: UserRole): string => {
    const colors = {
      doctor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      nurse: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      pharmacist: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      lab_technician: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      patient: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      receptionist: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      hospital_management: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return colors[role] || colors.patient;
  };

  if (loading && !hasInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-black dark:via-zinc-900 dark:to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading blog content...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-black">
        <div className="absolute inset-0 bg-white dark:bg-black"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-red-400 dark:text-red-800">
              HealthSphere Blog
            </h1>
            <p className="text-md lg:text-lg mb-8 max-w-3xl mx-auto opacity-90 text-black dark:text-white">
              Your trusted source for health insights, medical updates, and wellness guidance from healthcare professionals
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search health topics, conditions, treatments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="pl-12 pr-4 py-3 sm:text-xs text-md bg-white/95 backdrop-blur-md border-1 border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg text-black dark:text-white"
                />
                <Button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isSearching}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Articles</h2>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {featuredPosts.length} Featured
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`} onClick={() => handleViewPost(post.id)}>
                    <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm cursor-pointer">
                      <div className="relative">
                        <div className="h-48 rounded-xl bg-[url('https://i.ibb.co/jvwspqwH/image.png')] flex items-center justify-center">
                          <span className="text-4xl">{categoryConfig[post.category]?.icon}</span>
                        </div>
                        <Badge 
                          className={cn("absolute top-3 left-3", categoryConfig[post.category]?.color)}
                        >
                          {categoryConfig[post.category]?.label}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage 
                                src={post.authorAvatar && !post.authorAvatar.startsWith('/avatars/') ? post.authorAvatar : undefined}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                                {post.authorName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{post.authorName}</p>
                              <Badge variant="outline" className={cn("text-xs", getRoleBadgeColor(post.authorRole))}>
                                {post.authorRole.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {post.readingTime} min
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {formatNumber(post.views)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleLikePost(post.id);
                              }}
                              className="flex items-center hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Heart className="h-4 w-4 mr-1" />
                              {formatNumber(post.likes)}
                            </button>
                          </div>
                          <div className="flex items-center font-medium text-red-600 dark:text-red-400">
                            Read More
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        <Separator className="my-12" />

        {/* Filters and Controls */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Articles</h2>
              <Badge variant="secondary" className="px-3 py-1">
                {posts.length} Articles
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <span className="flex items-center">
                        <span className="mr-2">{categoryConfig[category]?.icon}</span>
                        {categoryConfig[category]?.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SortDesc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most_viewed">Most Viewed</SelectItem>
                  <SelectItem value="most_liked">Most Liked</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-r border-gray-200 dark:border-gray-700"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Posts Grid/List */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchQuery ? 'Try adjusting your search terms or filters' : 'Be the first to share your health insights'}
              </p>
              {user && canCreatePost(user.role) && (
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Write Article
                </Button>
              )}
            </div>
          ) : (
            <div className={cn(
              "grid gap-8",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group"
                  >
                    <Link href={`/blog/${post.slug}`} onClick={() => handleViewPost(post.id)}>
                      <Card className={cn(
                        "h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm cursor-pointer",
                        viewMode === 'list' && "flex flex-row"
                      )}>
                        <div className={cn(
                          "relative",
                          viewMode === 'list' ? "w-64 flex-shrink-0" : ""
                        )}>
                          <div className={cn(
                            "bg-[url('https://i.ibb.co/jvwspqwH/image.png')] flex items-center justify-center rounded-xl",
                            viewMode === 'list' ? "h-full" : "h-48"
                          )}>
                            <span className="text-4xl">{categoryConfig[post.category]?.icon}</span>
                          </div>
                          <Badge 
                            className={cn("absolute top-3 left-3", categoryConfig[post.category]?.color)}
                          >
                            {categoryConfig[post.category]?.label}
                          </Badge>
                        </div>
                        
                        <CardContent className={cn(
                          "p-6",
                          viewMode === 'list' && "flex-1 flex flex-col justify-between"
                        )}>
                          <div>
                            <h3 className={cn(
                              "font-bold mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors",
                              viewMode === 'list' ? "text-2xl line-clamp-2" : "text-xl line-clamp-2"
                            )}>
                              {post.title}
                            </h3>
                            <p className={cn(
                              "text-gray-600 dark:text-gray-300 mb-4",
                              viewMode === 'list' ? "line-clamp-2" : "line-clamp-3"
                            )}>
                              {post.excerpt}
                            </p>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage 
                                    src={post.authorAvatar && !post.authorAvatar.startsWith('/avatars/') ? post.authorAvatar : undefined}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                                    {post.authorName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{post.authorName}</p>
                                  <Badge variant="outline" className={cn("text-xs", getRoleBadgeColor(post.authorRole))}>
                                    {post.authorRole.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">
                                {post.publishedAt && formatDate(post.publishedAt)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {post.readingTime} min
                                </span>
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {formatNumber(post.views)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleLikePost(post.id);
                                  }}
                                  className="flex items-center hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                                  <Heart className="h-4 w-4 mr-1" />
                                  {formatNumber(post.likes)}
                                </button>
                              </div>
                              <div className="flex items-center font-medium text-red-600 dark:text-red-400">
                                Read More
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Load More Button */}
        {posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchPosts({}, posts.length + 10)}
              disabled={loading}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Load More Articles
                </div>
              )}
            </Button>
          </motion.div>
        )}

        {/* Create Post FAB for authorized users */}
        {user && canCreatePost(user.role) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              size="lg"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300"
              onClick={() => {
                // Navigate to create post page
                toast('Create post feature coming soon!', { icon: 'ℹ️' });
              }}
            >
              <BookOpen className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
