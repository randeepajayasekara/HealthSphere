'use client';

import { useSocialLinks } from '../../../../contexts/social-links-context';

export default function SocialLinksFooter() {
  const { socialLinks, loading, error } = useSocialLinks();

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Loading skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} HealthSphere
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Social links error:', error);
    // Fallback to empty state
    return (
      <div className="flex items-center gap-4">
        <div className="text-xs text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} HealthSphere
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {socialLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            aria-label={link.name}
            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d={link.svgPath} />
            </svg>
          </a>
        ))}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-500">
        © {new Date().getFullYear()} HealthSphere
      </div>
    </div>
  );
}
