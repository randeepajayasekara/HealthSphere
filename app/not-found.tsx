import Link from 'next/link';
import { Metadata } from 'next';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
    title: '404 - Page Not Found | HealthSphere',
    description: 'The page you are looking for does not exist.',
    robots: 'noindex, nofollow',
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <FaceFrownIcon className="w-20 h-20 text-red-500 mb-6" />
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
                We're sorry, the page you are looking for does not exist or has been moved.
            </p>
            <Link 
                href="/" 
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Return to Home
            </Link>
        </div>
    );
}