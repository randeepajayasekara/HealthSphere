"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  arrayUnion,
  arrayRemove,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { 
  BlogPost, 
  BlogComment, 
  BlogFilter, 
  BlogSearchResult, 
  BlogCategory,
  BlogStatus,
  UserRole
} from '@/app/types';
import { useAuth } from '@/app/contexts/auth-context';
import toast from 'react-hot-toast';

export interface UseBlogReturn {
  // State
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  featuredPosts: BlogPost[];
  categories: BlogCategory[];
  
  // Blog operations
  createPost: (postData: Partial<BlogPost>) => Promise<string>;
  updatePost: (postId: string, updates: Partial<BlogPost>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  publishPost: (postId: string) => Promise<void>;
  unpublishPost: (postId: string) => Promise<void>;
  
  // Fetching operations
  fetchPosts: (filter?: BlogFilter, pageSize?: number) => Promise<BlogSearchResult>;
  fetchPost: (postId: string) => Promise<BlogPost | null>;
  fetchFeaturedPosts: () => Promise<void>;
  searchPosts: (searchQuery: string, filter?: BlogFilter) => Promise<BlogSearchResult>;
  
  // Interaction operations
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  incrementViews: (postId: string) => Promise<void>;
  
  // Comment operations
  addComment: (postId: string, content: string, parentCommentId?: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<BlogComment[]>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
}

export const useBlog = (): UseBlogReturn => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const categories: BlogCategory[] = [
    'healthcare_tips',
    'medical_news',
    'patient_stories',
    'research_updates',
    'health_awareness',
    'technology',
    'wellness',
    'prevention',
    'mental_health',
    'nutrition',
    'exercise',
    'chronic_diseases',
    'pediatric_health',
    'senior_health'
  ];

  // Convert Firestore timestamp to Date
  const convertTimestamp = (timestamp: any): Date => {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  };

  // Convert Firestore document to BlogPost
  const convertToBlogPost = (doc: QueryDocumentSnapshot | DocumentSnapshot): BlogPost => {
    const data = doc.data();
    if (!data) throw new Error('Document data is undefined');

    return {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
      status: data.status,
      featured: data.featured || false,
      readingTime: data.readingTime || 0,
      views: data.views || 0,
      likes: data.likes || 0,
      authorId: data.authorId,
      authorName: data.authorName,
      authorRole: data.authorRole,
      authorAvatar: data.authorAvatar,
      featuredImage: data.featuredImage,
      publishedAt: data.publishedAt ? convertTimestamp(data.publishedAt) : undefined,
      scheduledFor: data.scheduledFor ? convertTimestamp(data.scheduledFor) : undefined,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      keywords: data.keywords || [],
      relatedPosts: data.relatedPosts || []
    };
  };

  // Create a new blog post
  const createPost = async (postData: Partial<BlogPost>): Promise<string> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      setLoading(true);
      setError(null);

      const slug = postData.title?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || '';

      const newPost = {
        title: postData.title || '',
        slug,
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        category: postData.category || 'healthcare_tips',
        tags: postData.tags || [],
        status: postData.status || 'draft',
        featured: postData.featured || false,
        readingTime: Math.ceil((postData.content || '').split(' ').length / 200),
        views: 0,
        likes: 0,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorRole: user.role,
        authorAvatar: user.profileImageUrl,
        featuredImage: postData.featuredImage,
        publishedAt: postData.status === 'published' ? serverTimestamp() : null,
        scheduledFor: postData.scheduledFor || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        seoTitle: postData.seoTitle,
        seoDescription: postData.seoDescription,
        keywords: postData.keywords || [],
        relatedPosts: []
      };

      const docRef = await addDoc(collection(db, 'blog_posts'), newPost);
      toast.success('Blog post created successfully!');
      return docRef.id;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create blog post';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing blog post
  const updatePost = async (postId: string, updates: Partial<BlogPost>): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      setLoading(true);
      setError(null);

      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      if (updates.title) {
        updateData.slug = updates.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      if (updates.content) {
        updateData.readingTime = Math.ceil(updates.content.split(' ').length / 200);
      }

      if (updates.status === 'published' && !updates.publishedAt) {
        updateData.publishedAt = serverTimestamp();
      }

      await updateDoc(doc(db, 'blog_posts', postId), updateData);
      toast.success('Blog post updated successfully!');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update blog post';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a blog post
  const deletePost = async (postId: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, 'blog_posts', postId));
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Blog post deleted successfully!');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete blog post';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Publish a blog post
  const publishPost = async (postId: string): Promise<void> => {
    await updatePost(postId, { 
      status: 'published', 
      publishedAt: new Date() 
    });
  };

  // Unpublish a blog post
  const unpublishPost = async (postId: string): Promise<void> => {
    await updatePost(postId, { 
      status: 'draft',
      publishedAt: undefined 
    });
  };

  // Fetch blog posts with filtering and pagination
  const fetchPosts = async (
    filter: BlogFilter = {}, 
    pageSize: number = 10
  ): Promise<BlogSearchResult> => {
    try {
      setLoading(true);
      setError(null);

      let q = query(collection(db, 'blog_posts'));

      // Apply filters
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      } else {
        q = query(q, where('status', '==', 'published'));
      }

      if (filter.category) {
        q = query(q, where('category', '==', filter.category));
      }

      if (filter.author) {
        q = query(q, where('authorId', '==', filter.author));
      }

      if (filter.featured !== undefined) {
        q = query(q, where('featured', '==', filter.featured));
      }

      // Apply sorting
      q = query(q, orderBy('publishedAt', 'desc'), limit(pageSize));

      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(convertToBlogPost);

      setPosts(fetchedPosts);

      return {
        posts: fetchedPosts,
        totalCount: fetchedPosts.length,
        hasMore: fetchedPosts.length === pageSize,
        filters: filter,
        sortBy: 'newest'
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch blog posts';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single blog post
  const fetchPost = async (postId: string): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, 'blog_posts', postId);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return convertToBlogPost(snapshot);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch blog post';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured posts
  const fetchFeaturedPosts = async (): Promise<void> => {
    try {
      const q = query(
        collection(db, 'blog_posts'),
        where('status', '==', 'published'),
        where('featured', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const featured = snapshot.docs.map(convertToBlogPost);
      setFeaturedPosts(featured);
    } catch (err: any) {
      console.error('Failed to fetch featured posts:', err);
    }
  };

  // Search blog posts
  const searchPosts = async (
    searchQuery: string, 
    filter: BlogFilter = {}
  ): Promise<BlogSearchResult> => {
    try {
      setLoading(true);
      setError(null);

      // Simple text search implementation
      // In a real application, you might want to use a more sophisticated search solution
      const allPosts = await fetchPosts(filter, 100);
      
      const searchResults = allPosts.posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      return {
        ...allPosts,
        posts: searchResults,
        totalCount: searchResults.length
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to search blog posts';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Like a blog post
  const likePost = async (postId: string): Promise<void> => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'blog_posts', postId), {
        likes: increment(1)
      });
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    } catch (err: any) {
      toast.error('Failed to like post');
    }
  };

  // Unlike a blog post
  const unlikePost = async (postId: string): Promise<void> => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'blog_posts', postId), {
        likes: increment(-1)
      });
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post
      ));
    } catch (err: any) {
      toast.error('Failed to unlike post');
    }
  };

  // Increment post views
  const incrementViews = async (postId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'blog_posts', postId), {
        views: increment(1)
      });
    } catch (err: any) {
      console.error('Failed to increment views:', err);
    }
  };

  // Add a comment to a blog post
  const addComment = async (
    postId: string, 
    content: string, 
    parentCommentId?: string
  ): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const newComment = {
        postId,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        userAvatar: user.profileImageUrl,
        content,
        parentCommentId: parentCommentId || null,
        approved: true,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'blog_comments'), newComment);
      toast.success('Comment added successfully!');
    } catch (err: any) {
      toast.error('Failed to add comment');
      throw err;
    }
  };

  // Fetch comments for a blog post
  const fetchComments = async (postId: string): Promise<BlogComment[]> => {
    try {
      const q = query(
        collection(db, 'blog_comments'),
        where('postId', '==', postId),
        where('approved', '==', true),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as BlogComment[];
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
      return [];
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');

    try {
      await deleteDoc(doc(db, 'blog_comments', commentId));
      toast.success('Comment deleted successfully!');
    } catch (err: any) {
      toast.error('Failed to delete comment');
      throw err;
    }
  };

  // Like a comment
  const likeComment = async (commentId: string): Promise<void> => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'blog_comments', commentId), {
        likes: increment(1)
      });
    } catch (err: any) {
      toast.error('Failed to like comment');
    }
  };

  // Load featured posts on component mount
  useEffect(() => {
    fetchFeaturedPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    featuredPosts,
    categories,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    fetchPosts,
    fetchPost,
    fetchFeaturedPosts,
    searchPosts,
    likePost,
    unlikePost,
    incrementViews,
    addComment,
    fetchComments,
    deleteComment,
    likeComment
  };
};
