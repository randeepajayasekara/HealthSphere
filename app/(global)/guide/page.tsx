"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Search } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/backend/config";

// Types
interface VideoData {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  views: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  createdAt?: Date;
}

const fetchVideosFromFirestore = async (): Promise<VideoData[]> => {
  try {
    const videosRef = collection(db, "guide-videos");
    const q = query(videosRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const videos: VideoData[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as VideoData)
    );

    return videos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

// Video Player Component
const VideoPlayer = ({
  video,
  onClose,
}: {
  video: VideoData;
  onClose: () => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video iframe */}
        <iframe
          ref={playerRef}
          src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        />

        {/* Custom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{video.title}</h3>
              <p className="text-sm text-gray-300 mt-1">{video.description}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Video Card Component
const VideoCard = ({
  video,
  onClick,
}: {
  video: VideoData;
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-zinc-800">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/api/placeholder/400/225";
            }}
          />

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-gray-800 ml-1" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
              {video.title}
            </h3>
          </div>

          <p className="text-gray-600 dark:text-zinc-400 text-sm line-clamp-2 mb-3">
            {video.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500">
            <div className="flex items-center space-x-4">
              <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                {video.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function GuidePage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  // Fetch videos from Firestore
  const loadVideos = async () => {
    setIsLoading(true);
    const fetchedVideos = await fetchVideosFromFirestore();
    setVideos(fetchedVideos);
    setIsLoading(false);
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Filter videos
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || video.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "All" || video.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = [
    "All",
    ...Array.from(new Set(videos.map((v) => v.category))),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: y1, opacity }}
          className="text-center z-10 px-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-6"
          >
            The best place
            <br />
            to learn
            <br />
            <span className="text-red-500">HealthSphere</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-800 bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:outline-none border border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors duration-300"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-zinc-400">
              Loading tutorials...
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Featured Tutorials
                  </h2>
                </div>
              </div>

              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <VideoCard
                    video={video}
                    onClick={() => setSelectedVideo(video)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty state */}
            {filteredVideos.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No tutorials found
                </h3>
                <p className="text-gray-600 dark:text-zinc-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <style jsx global>{`
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f9fafb;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --border-color: #e5e7eb;
        }

        [data-theme="dark"] {
          --bg-primary: #000000;
          --bg-secondary: #18181b;
          --text-primary: #f9fafb;
          --text-secondary: #a1a1aa;
          --border-color: #27272a;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
