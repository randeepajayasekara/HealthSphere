"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Share2,
  Bookmark,
  MessageCircle,
  Calendar,
  User,
  ThumbsUp,
  Clock,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useBlog } from '@/hooks/use-blog';
import { useAuth } from '@/app/contexts/auth-context';
import { BlogPost, BlogComment, UserRole } from '@/app/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const { user } = useAuth();
  const { 
    posts,
    likePost, 
    incrementViews,
    fetchPosts,
    addComment,
    fetchComments,
    likeComment
  } = useBlog();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Category configuration
  const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
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

  // Helper functions
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

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

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        await fetchPosts({}, 100);
      } catch (error) {
        console.error('Failed to load blog post:', error);
        toast.error('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    } else {
      setLoading(false);
    }
  }, [slug, fetchPosts]);

  // Find post by slug
  useEffect(() => {
    if (posts.length > 0 && slug) {
      const foundPost = posts.find(p => p.slug === slug);
      if (foundPost) {
        setPost(foundPost);
        // Only increment views if post exists
        if (foundPost.id) {
          incrementViews(foundPost.id).catch(error => 
            console.error('Failed to increment views:', error)
          );
        }
        // Only fetch comments if post exists
        if (foundPost.id) {
          fetchComments(foundPost.id)
            .then(setComments)
            .catch(error => {
              console.error('Failed to fetch comments:', error);
              setComments([]);
            });
        }
      }
    }
  }, [posts, slug, incrementViews, fetchComments]);

  // Handle interactions
  const handleLikePost = async () => {
    if (!user || !post) {
      toast.error('Please log in to like posts');
      return;
    }

    if (!post.id) {
      toast.error('Unable to like post');
      return;
    }

    try {
      await likePost(post.id);
      setIsLiked(!isLiked);
      setPost({ ...post, likes: (post.likes || 0) + (isLiked ? -1 : 1) });
      toast.success(isLiked ? 'Post unliked' : 'Post liked!');
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async () => {
    if (!user || !post) {
      toast.error('Please log in to comment');
      return;
    }

    if (!post.id) {
      toast.error('Unable to add comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      await addComment(post.id, commentText);
      setCommentText('');
      const updatedComments = await fetchComments(post.id);
      setComments(updatedComments || []);
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (!post) {
      toast.error('Unable to share post');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title || 'HealthSphere Blog Post',
          text: post.excerpt || 'Check out this blog post',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
        toast.error('Failed to share post');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading article...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-black dark:via-zinc-900 dark:to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article not found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-black dark:via-zinc-900 dark:to-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikePost}
                className={cn(
                  "transition-colors",
                  isLiked ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
                )}
                >
                  <Heart className={cn("h-4 w-4 mr-1", isLiked && "fill-current")} />
                  {formatNumber(post.likes || 0)}
                </Button>              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={cn(
                  "transition-colors",
                  isBookmarked ? "text-yellow-600 dark:text-yellow-400" : "text-gray-600 dark:text-gray-400"
                )}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge className={cn(categoryConfig[post.category]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", "mb-4")}>
              <span className="mr-1">{categoryConfig[post.category]?.icon || "📄"}</span>
              {categoryConfig[post.category]?.label || "Article"}
            </Badge>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title || "Untitled Article"}
            </h1>

            <div className="flex items-center mb-8">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage 
                  src="" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}  
                />
                <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                  {post.authorName?.split(' ').map(n => n[0]).join('') || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{post.authorName || "Unknown Author"}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {post.publishedAt ? formatDate(post.publishedAt) : "Recent"}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readingTime || 5} min read
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {formatNumber(post.views || 0)} views
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: (post.content || "Content not available").replace(/\n/g, '<br />') }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <MessageCircle className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h3>
            </div>

            {user ? (
              <Card className="mb-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {user.firstName?.[0] || "?"}{user.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your thoughts about this article..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="mb-4 min-h-[100px] resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Commenting as <span className="font-medium">{user.firstName || "User"} {user.lastName || ""}</span>
                        </p>
                        <Button
                          onClick={handleAddComment}
                          disabled={submittingComment || !commentText.trim()}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {submittingComment ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Posting...
                            </div>
                          ) : (
                            'Post Comment'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Please log in to join the discussion
                  </p>
                  <Link href="/login">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      <User className="h-4 w-4 mr-2" />
                      Log In
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {comments.length === 0 && !loading ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src=""
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                              {comment.userName?.split(' ').map(n => n[0]).join('') || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {comment.userName || "Anonymous"}
                              </p>
                              <Badge variant="outline" className={cn("text-xs", getRoleBadgeColor(comment.userRole || 'patient'))}>
                                {(comment.userRole || 'user').replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {comment.createdAt ? formatDate(comment.createdAt) : "Recently"}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                              {comment.content || "No content available"}
                            </p>
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => comment.id && likeComment(comment.id)}
                                disabled={!comment.id}
                                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {comment.likes || 0}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
