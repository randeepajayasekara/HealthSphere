"use client";

import { useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

type Post = {
    id: number;
    title: string;
    author: string;
    date: string;
    replies: number;
    views: number;
    category: string;
}

export default function ForumPage() {
    const { theme, setTheme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Sample data
    const posts: Post[] = [
        { id: 1, title: 'Tips for maintaining a healthy diet', author: 'NutritionExpert', date: '2 hours ago', replies: 12, views: 145, category: 'Nutrition' },
        { id: 2, title: 'Best home workout routines for beginners', author: 'FitnessPro', date: '5 hours ago', replies: 24, views: 307, category: 'Fitness' },
        { id: 3, title: 'How to improve your sleep quality', author: 'SleepSpecialist', date: '1 day ago', replies: 18, views: 203, category: 'Wellness' },
        { id: 4, title: 'Dealing with stress and anxiety', author: 'MentalHealthCoach', date: '2 days ago', replies: 32, views: 412, category: 'Mental Health' },
        { id: 5, title: 'COVID-19 vaccination questions', author: 'MedicalDoc', date: '3 days ago', replies: 45, views: 528, category: 'COVID-19' },
    ];

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HealthSphere Forum</h1>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                        New Post
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-12 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <div className="col-span-6">Topic</div>
                            <div className="col-span-2 text-center hidden sm:block">Replies</div>
                            <div className="col-span-2 text-center hidden sm:block">Views</div>
                            <div className="col-span-6 sm:col-span-2 text-right sm:text-center">Activity</div>
                        </div>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <li key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                    <div className="px-4 py-5 sm:px-6">
                                        <div className="grid grid-cols-12 gap-2">
                                            <div className="col-span-6">
                                                <Link href={`/forum/post/${post.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                                    {post.title}
                                                </Link>
                                                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        {post.category}
                                                    </span>
                                                    <span className="ml-2">by {post.author}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center hidden sm:flex items-center justify-center text-gray-600 dark:text-gray-300">
                                                {post.replies}
                                            </div>
                                            <div className="col-span-2 text-center hidden sm:flex items-center justify-center text-gray-600 dark:text-gray-300">
                                                {post.views}
                                            </div>
                                            <div className="col-span-6 sm:col-span-2 text-right sm:text-center text-gray-600 dark:text-gray-300 flex sm:block items-center justify-end">
                                                {post.date}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-5 sm:px-6 text-center text-gray-500 dark:text-gray-400">
                                No topics found matching your search criteria.
                            </li>
                        )}
                    </ul>
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredPosts.length} of {posts.length} topics
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            Previous
                        </button>
                        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}