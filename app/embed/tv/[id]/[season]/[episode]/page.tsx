"use client";

import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';

interface SeriesData {
  sources: any[];
  title?: string;
  series_name?: string;
  episode_name?: string;
  overview?: string;
  episode_overview?: string;
  poster?: string;
  backdrop?: string;
  still?: string;
  subtitles?: { label: string; url: string; }[];
}

interface PageProps {
  params: {
    id: string;
    season: string;
    episode: string;
  };
}

export default function Page({ params }: PageProps) {
  const [videoSources, setVideoSources] = useState<any[]>([]);
  const [poster, setPoster] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SeriesData | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    async function fetchVideo() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current hostname for API URL
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
        
        const res = await fetch(
          `${baseUrl}/api/vidfast-series?id=${params.id}&season=${params.season}&episode=${params.episode}`,
          {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'فشل في تحميل الفيديو');
        }
        
        const responseData = await res.json();
        if (!isMounted) return;

        if (responseData.sources && responseData.sources.length > 0) {
          setVideoSources(responseData.sources);
          setPoster(responseData.poster);
          setData(responseData);
          setError(null);
        } else {
          throw new Error('لم يتم العثور على مصدر للفيديو');
        }
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error('Error fetching video:', err);
        setError(err.message || 'حدث خطأ أثناء تحميل الفيديو');
        
        // Retry logic
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchVideo, 2000 * retryCount); // Exponential backoff
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchVideo();
    return () => {
      isMounted = false;
    };
  }, [params.id, params.season, params.episode]);

  return (
    <div className="w-full h-screen bg-black">
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-blue-400 font-bold">جاري جلب روابط الفيديو...</div>
      ) : error ? (
        <div className="flex items-center justify-center h-full text-red-400 font-bold">{error}</div>
      ) : (
        <VideoPlayer
          videoSources={videoSources}
          poster={poster}
          backdrop={data?.backdrop}
          subtitles={data?.subtitles || []}
          mediaMeta={{
            title: data?.series_name,
            episode_name: data?.episode_name,
            id: params.id,
            type: 'tv',
            season: params.season,
            episode: params.episode
          }}
        />
      )}
    </div>
  );
} 