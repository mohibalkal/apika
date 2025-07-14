"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import dynamicComponent from 'next/dynamic';

const VideoPlayer = dynamicComponent(() => import('../components/VideoPlayer'), {
  ssr: false,
});

const images1 = [
  "https://image.tmdb.org/t/p/w154//2VUmvqsHb6cEtdfscEA6fqqVzLg.jpg",
  "https://image.tmdb.org/t/p/w154//wqfu3bPLJaEWJVk3QOm0rKhxf1A.jpg",
  "https://image.tmdb.org/t/p/w154//hqcexYHbiTBfDIdDWxrxPtVndBX.jpg",
  "https://image.tmdb.org/t/p/w154//lVgE5oLzf7ABmzyASEVcjYyHI41.jpg",
  "https://image.tmdb.org/t/p/w154//2vHQBX5L4yoExTa55KmGIg2Q5s3.jpg",
  "https://image.tmdb.org/t/p/w154//khohu1IKmgGNvETjEaxZaWBw4fr.jpg",
  "https://image.tmdb.org/t/p/w154//6WxhEvFsauuACfv8HyoVX6mZKFj.jpg",
  "https://image.tmdb.org/t/p/w154//7c5VBuCbjZOk7lSfj9sMpmDIaKX.jpg",
  "https://image.tmdb.org/t/p/w154//tObSf1VzzHt9xB0csanFtb3DRjf.jpg",
  "https://image.tmdb.org/t/p/w154//jfS5KEfiwsS35ieZvdUdJKkwLlZ.jpg",
  "https://image.tmdb.org/t/p/w154//3lwlJL8aW6Wor9tKvME8VoMnBkn.jpg",
  "https://image.tmdb.org/t/p/w154//vqBmyAj0Xm9LnS1xe1MSlMAJyHq.jpg",
  "https://image.tmdb.org/t/p/w154//fy56jsxq9fXG7OWQCViNa4ttpzU.jpg",
  "https://image.tmdb.org/t/p/w154//6U0i0HsSCvhRW4IpGzdead6QRo3.jpg",
  "https://image.tmdb.org/t/p/w154//ajsGI4JYaciPIe3gPgiJ3Vw5Vre.jpg",
  "https://image.tmdb.org/t/p/w154//8OP3h80BzIDgmMNANVaYlQ6H4Oc.jpg",
  "https://image.tmdb.org/t/p/w154//m5NKltgQqqyoWJNuK18IqEGRG7J.jpg",
  "https://image.tmdb.org/t/p/w154//wnHUip9oKvDJEJUEk62L4rFSYGa.jpg",
  "https://image.tmdb.org/t/p/w154//yQGaui0bQ5Ai3KIFBB45nTeIqad.jpg",
  "https://image.tmdb.org/t/p/w154//yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg",
];
const images2 = [
  "https://image.tmdb.org/t/p/w154//1QdXdRYfktUSONkl1oD5gc6Be0s.jpg",
  "https://image.tmdb.org/t/p/w154//kBBbSgNchtMvsgD6z1oI1RRluHP.jpg",
  "https://image.tmdb.org/t/p/w154//fTBC5EpsgKmli9VQcJMtqQ08Qj4.jpg",
  "https://image.tmdb.org/t/p/w154//9jkThAGYj2yp8jsS6Nriy5mzKFT.jpg",
  "https://image.tmdb.org/t/p/w154//gGC7zSDgG0FY0MbM1pjfhTCWQBI.jpg",
  "https://image.tmdb.org/t/p/w154//if7ECoH4xaYw5S8gomNIEmtwTxP.jpg",
  "https://image.tmdb.org/t/p/w154//vHqeLzYl3dEAutojCO26g0LIkom.jpg",
  "https://image.tmdb.org/t/p/w154//oQxrvUhP3ycwnlxIrIMQ9Z3kleq.jpg",
  "https://image.tmdb.org/t/p/w154//abWOCrIo7bbAORxcQyOFNJdnnmR.jpg",
  "https://image.tmdb.org/t/p/w154//x9HeaagUAyyGl1fQ6exQcpELBxP.jpg",
  "https://image.tmdb.org/t/p/w154//pbpoLLp4kvnYVfnEGiEhagpJuVZ.jpg",
  "https://image.tmdb.org/t/p/w154//jMpBQr2aNOFAI6wsC47zsOG6qOh.jpg",
  "https://image.tmdb.org/t/p/w154//uSvET5YUvHNDIeoCpErrbSmasFb.jpg",
  "https://image.tmdb.org/t/p/w154//9ZN1P32SHviL3SV51qLivxycvcx.jpg",
  "https://image.tmdb.org/t/p/w154//7jEVqXC14bhfAzSPgr896dMdDv6.jpg",
  "https://image.tmdb.org/t/p/w154//gNS5tRSG3UlXodCxznKKOKweqxh.jpg",
  "https://image.tmdb.org/t/p/w154//zMWldNZF0wS3L5XkDVFHxYhclcL.jpg",
  "https://image.tmdb.org/t/p/w154//uX5ldo2snjJuZ8P9AxOharboxJn.jpg",
  "https://image.tmdb.org/t/p/w154//udaLIJ6Na7GOHjvTlyP9JFPTccv.jpg",
  "https://image.tmdb.org/t/p/w154//liQIvgYvnNwqjV6MvnFzvlXJNL2.jpg",
];

const ScrollerComponent = ({ images, direction = "forwards" }: { images: string[]; direction?: "forwards" | "reverse" }) => {
  return (
    <div
      className={`scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white_20%,white_80%,transparent)]`}
      style={{
        animationDirection: direction,
        animationDuration: "80s",
      }}
    >
      <ul className="flex flex-row min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap animate-scroll hover:[animation-play-state:paused]">
        {images.map((src, i) => (
          <li key={i}>
            <img src={src} className="w-32 mx-2 rounded-3xl" alt="" />
          </li>
        ))}
      </ul>
    </div>
  );
};
const Scroller = dynamicComponent(() => Promise.resolve(ScrollerComponent), { ssr: false });

// تعريف مفتاح TMDB API
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGY1YjE5NjI2MmMzMzFlMmUyOWJjYmU2NTJmZmRiYSIsIm5iZiI6MTcyMzc1OTU0Mi45NzgsInN1YiI6IjY2YmU3YmI2MmJlNTQ2ZDE4ZmMzOGMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.mynmNrgUkgSbhSG-v2wGgn2IEOE6vNQx58qEv9kP4V8';

interface VideoSource {
  quality: string;
  url?: string;
  playlistUrl?: string;
  segments?: Array<{ url: string }>;
}

interface VideoQuality {
  quality: string;
  url: string | undefined;
}

interface VideoData {
  qualities: VideoQuality[];
  subtitles: any[];
  url: string;
}

export default function HomePage() {
  const [origin, setOrigin] = useState("https://apika.netlify.app");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use production URL instead of localhost
      setOrigin("https://apika.netlify.app");
    }
  }, []);

  // حالة النوع المحدد
  const [type, setType] = useState<string>("movie");
  
  // حالة الأفلام
  const [movieId, setMovieId] = useState<string>("");
  const [movieData, setMovieData] = useState<any>(null);
  const [movieTMDB, setMovieTMDB] = useState<any>(null);
  const [movieError, setMovieError] = useState<string>("");
  const [movieLoading, setMovieLoading] = useState<boolean>(false);
  const [movieVideoSources, setMovieVideoSources] = useState<any[]>([]);
  const [movieVideoData, setMovieVideoData] = useState<any>(null);
  const [movieVideoError, setMovieVideoError] = useState<string>("");
  const [movieVideoLoading, setMovieVideoLoading] = useState(false);

  // حالة المسلسلات
  const [tvId, setTvId] = useState<string>("");
  const [tvData, setTvData] = useState<any>(null);
  const [tvTMDB, setTvTMDB] = useState<any>(null);
  const [tvError, setTvError] = useState<string>("");
  const [tvLoading, setTvLoading] = useState<boolean>(false);
  const [tvVideoSources, setTvVideoSources] = useState<any[]>([]);
  const [tvVideoData, setTvVideoData] = useState<any>(null);
  const [tvVideoError, setTvVideoError] = useState<string>("");
  const [tvVideoLoading, setTvVideoLoading] = useState(false);
  const [season, setSeason] = useState<string>("");
  const [episode, setEpisode] = useState<string>("");
  
  // دالة لإعادة تعيين حالة الأفلام
  const resetMovieStates = () => {
    setMovieId("");
    setMovieData(null);
    setMovieTMDB(null);
    setMovieError("");
    setMovieVideoSources([]);
    setMovieVideoData(null);
    setMovieVideoError("");
    setMovieVideoLoading(false);
    setMovieLoading(false);
  };

  // دالة لإعادة تعيين حالة المسلسلات
  const resetTvStates = () => {
    setTvId("");
    setTvData(null);
    setTvTMDB(null);
    setTvError("");
    setTvVideoSources([]);
    setTvVideoData(null);
    setTvVideoError("");
    setTvVideoLoading(false);
    setTvLoading(false);
    setSeason("");
    setEpisode("");
  };

  // دالة لتغيير النوع
  const handleTypeChange = (newType: string) => {
    if (type !== newType) {
      // إعادة تعيين جميع الحالات أولاً
      resetMovieStates();
      resetTvStates();
      // ثم تغيير النوع
      setType(newType);
    }
  };

  // دالة جلب بيانات الفيلم
  async function fetchMovie() {
    if (movieVideoLoading) return;
    
    setMovieVideoLoading(true);
    setMovieVideoError("");
    setMovieVideoData(null);
    setMovieVideoSources([]);

    if (!movieId) {
      setMovieVideoLoading(false);
      setMovieVideoError("الرجاء إدخال معرف الفيلم");
      return;
    }

    try {
      const res = await fetch("/api/vidfast-movie?id=" + encodeURIComponent(movieId), {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "لم يتم العثور على روابط للفيديو");
      }
      
      const responseData = await res.json();
      
      if (responseData.sources && responseData.sources.length > 0) {
        setMovieVideoData(responseData);
        setMovieVideoSources(responseData.sources);
      } else {
        throw new Error("لم يتم العثور على مصدر للفيديو");
      }
    } catch (e: any) {
      setMovieVideoError(e?.message || "خطأ في جلب روابط الفيديو");
    } finally {
      setMovieVideoLoading(false);
    }
  }

  // دالة جلب بيانات المسلسل
  async function fetchTvShow() {
    if (tvVideoLoading) return;
    
    setTvVideoLoading(true);
    setTvVideoError("");
    setTvVideoData(null);
    setTvVideoSources([]);

    if (!tvId || !season || !episode) {
      setTvVideoLoading(false);
      setTvVideoError("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }
    
    try {
      const seasonNum = parseInt(season);
      const episodeNum = parseInt(episode);
      
      if (isNaN(seasonNum) || isNaN(episodeNum)) {
        throw new Error("رقم الموسم أو الحلقة غير صحيح");
      }

      const res = await fetch(
        `/api/vidfast-series?id=${encodeURIComponent(tvId)}&season=${seasonNum}&episode=${episodeNum}`,
        {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "لم يتم العثور على روابط للفيديو");
      }
      
      const responseData = await res.json();
      
      if (responseData.sources && responseData.sources.length > 0) {
        setTvVideoData(responseData);
        setTvVideoSources(responseData.sources);
      } else {
        throw new Error("لم يتم العثور على مصدر للفيديو");
      }
    } catch (e: any) {
      setTvVideoError(e?.message || "خطأ في جلب روابط الفيديو");
    } finally {
      setTvVideoLoading(false);
    }
  }

  // دالة جلب بيانات TMDB للفيلم
  async function fetchMovieTMDB() {
    if (!movieId) return;
    
    setMovieLoading(true);
    setMovieError("");
    setMovieTMDB(null);

    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.status_message || "Not found");
      }

      const json = await res.json();
      setMovieTMDB(json);
    } catch (e: any) {
      console.error('TMDB API Error:', e);
      setMovieError(e?.message || "Not found or error in API");
    } finally {
      setMovieLoading(false);
    }
  }

  // دالة جلب بيانات TMDB للمسلسل
  async function fetchTvTMDB() {
    if (!tvId) return;
    
    setTvLoading(true);
    setTvError("");
    setTvTMDB(null);

    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}`, {
          headers: { 
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.status_message || "Not found");
        }
        
        const json = await res.json();
      setTvTMDB(json);
      } catch (e: any) {
        console.error('TMDB API Error:', e);
      setTvError(e?.message || "Not found or error in API");
      } finally {
      setTvLoading(false);
      }
    }

  // Effects للأفلام
  useEffect(() => {
    if (!movieId) {
      // إعادة تعيين البيانات إذا لم يكن هناك معرف فيلم
      setMovieVideoSources([]);
      setMovieVideoData(null);
      setMovieVideoError("");
      return;
    }
    
    const timer = setTimeout(() => {
      fetchMovie();
    }, 500);

    return () => clearTimeout(timer);
  }, [movieId]);

  useEffect(() => {
    if (!movieId) return;
    
    const timer = setTimeout(() => {
      fetchMovieTMDB();
    }, 500);

    return () => clearTimeout(timer);
  }, [movieId]);

  // Effects للمسلسلات
  useEffect(() => {
    if (!tvId || !season || !episode) {
      // إعادة تعيين البيانات إذا لم تكن جميع المدخلات متوفرة
      setTvVideoSources([]);
      setTvVideoData(null);
      setTvVideoError("");
      return;
    }
    
    const timer = setTimeout(() => {
      fetchTvShow();
    }, 500);

    return () => clearTimeout(timer);
  }, [tvId, season, episode]);

  useEffect(() => {
    if (!tvId) return;
    
    const timer = setTimeout(() => {
      fetchTvTMDB();
    }, 500);

    return () => clearTimeout(timer);
  }, [tvId]);

  return (
    <div className="min-h-screen w-full bg-black relative overflow-x-hidden">
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* hero + scroller */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Hero */}
          <div className="hero flex justify-center w-fit max-w-[26rem] flex-col text-center md:text-left">
            <h1 className="mt-10 text-3xl font-extrabold font-mono text-white">vidjoy</h1>
            <h2 className="font-bold max-w-fit font-mono bg-gradient-to-r from-purple-400 via-white to-red-400 bg-clip-text text-transparent mt-2">
              best streaming Api you could ever dream of
            </h2>
            <div className="flex flex-col justify-center items-center md:items-start">
              <div className="mt-4 flex gap-2">
                <div className="glass-box p-4 bg-black/40 rounded-xl border border-pink-500">
                  <h2 className="text-white text-lg font-semibold font-mono">115k+</h2>
                  <h6 className="text-white/80 font-mono text-[10px] text-left">Movies</h6>
                </div>
                <div className="glass-box p-4 bg-black/40 rounded-xl border border-blue-400">
                  <h2 className="text-white text-lg font-semibold font-mono">79k+</h2>
                  <h6 className="text-white/80 font-mono text-[10px] text-left">Episodes</h6>
                </div>
                
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button className="glass-box w-fit h-fit rounded-lg p-2 border-2 bg-transparent text-white font-bold">Lets Go =&gt;</button>
              </div>
            </div>
          </div>
          {/* Scroller */}
          <div className="flex items-center justify-center md:justify-start md:items-start">
            <div className="min-h-[32rem] h-full max-h-[75vh] w-fit rounded-md flex antialiased dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
              <Scroller images={images1} direction="reverse" />
              <Scroller images={images2} direction="forwards" />
            </div>
          </div>
        </div>
        {/* حقول البحث بتصميم مطابق للصور */}
        <div className="flex flex-col items-center w-full mt-8">
          {/* Tabs */}
          <div className="flex flex-row items-center justify-center gap-2 mb-2">
            <button
              className={`px-6 py-2 rounded-lg font-mono text-lg transition-all ${type === "movie" ? "bg-[#161618] text-white border border-[#32a7f6]" : "bg-[#161618]/60 text-gray-400 border border-transparent"}`}
              onClick={() => handleTypeChange("movie")}
            >
              MOVIE PLAYER
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-mono text-lg transition-all ${type === "tv" ? "bg-[#161618] text-white border border-[#32a7f6]" : "bg-[#161618]/60 text-gray-400 border border-transparent"}`}
              onClick={() => handleTypeChange("tv")}
            >
              SERIES PLAYER
            </button>
        
          </div>
          {/* Fields */}
          <div className="flex flex-row items-center justify-center gap-3 w-full max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="TMDB ID"
              value={type === "movie" ? movieId : tvId}
              onChange={e => type === "movie" ? setMovieId(e.target.value) : setTvId(e.target.value)}
              className="flex-1 bg-[#161618] text-white text-lg px-4 py-2 rounded-lg border border-[#32a7f6] focus:outline-none"
            />
            {type === "tv" && (
              <input
                type="number"
                placeholder="Season"
                value={season}
                onChange={e => setSeason(e.target.value)}
                className="w-28 bg-[#161618] text-white text-lg px-4 py-2 rounded-lg border border-[#32a7f6] focus:outline-none"
                min={1}
              />
            )}
            {type === "tv" && (
              <input
                type="number"
                placeholder="Episode"
                value={episode}
                onChange={e => setEpisode(e.target.value)}
                className="w-28 bg-[#161618] text-white text-lg px-4 py-2 rounded-lg border border-[#32a7f6] focus:outline-none"
                min={1}
              />
            )}
          </div>
        </div>
        {/* مشغل الفيديو */}
        <div className="flex flex-col items-center w-full mt-8">
          <div className="w-full max-w-3xl aspect-video rounded-2xl border border-green-700 bg-black/80 flex items-center justify-center shadow-lg relative overflow-hidden">
            {type === "movie" ? (
              movieVideoLoading ? (
                <div className="flex items-center justify-center w-full h-full text-blue-400 font-bold">جاري جلب روابط الفيديو...</div>
              ) : movieVideoError ? (
                <div className="flex items-center justify-center w-full h-full text-red-400 font-bold">{movieVideoError}</div>
              ) : (
                <VideoPlayer
                  videoSources={movieVideoSources.map(source => ({
                    quality: source.quality,
                    url: source.playlistUrl || source.url || '',
                    server: source.server || 'Alpha'
                  }))}
                  poster={movieVideoData?.poster}
                  backdrop={movieVideoData?.backdrop}
                  subtitles={movieVideoData?.subtitles || []}
                  mediaMeta={{
                    title: movieTMDB?.title,
                    id: movieId,
                    type: "movie"
                  }}
                />
              )
            ) : (
              tvVideoLoading ? (
  <div className="flex items-center justify-center w-full h-full text-blue-400 font-bold">جاري جلب روابط الفيديو...</div>
              ) : tvVideoError ? (
                <div className="flex items-center justify-center w-full h-full text-red-400 font-bold">{tvVideoError}</div>
) : (
                <VideoPlayer
                  videoSources={tvVideoSources.map(source => ({
                    quality: source.quality,
                    url: source.playlistUrl || source.url || '',
                    server: source.server || 'Alpha'
                  }))}
                  poster={tvVideoData?.poster}
                  backdrop={tvVideoData?.backdrop}
                  subtitles={tvVideoData?.subtitles || []}
                  mediaMeta={{
                    title: tvTMDB?.name,
                    episode_name: tvVideoData?.episode_name,
                    id: tvId,
                    type: "tv",
                    season: season,
                    episode: episode
                  }}
                />
              )
)}
          </div>
          {/* رابط التضمين وكود iframe */}
          <div className="mt-6 w-full max-w-3xl flex flex-col gap-2 items-center">
            {/* رابط التضمين */}
            <div className="w-full flex flex-row items-center gap-2">
              <span className="text-gray-400 font-mono text-sm min-w-fit">Embed Link:</span>
              <input
                type="text"
                readOnly
                value={getEmbedUrl(type, type === "movie" ? movieId : tvId, season, episode)}
                className="flex-1 bg-[#232a36]/80 border border-[#3a3f4b] text-white font-mono rounded-md px-3 py-1 text-xs select-all"
              />
              <button
                className="bg-[#232a36] border border-blue-400 text-blue-300 px-3 py-1 rounded-md font-mono text-xs hover:bg-blue-900/40 transition"
                onClick={() => copyToClipboard(getEmbedUrl(type, type === "movie" ? movieId : tvId, season, episode))}
              >
                نسخ
              </button>
            </div>
            {/* كود iframe */}
            <div className="w-full flex flex-row items-center gap-2">
              <span className="text-gray-400 font-mono text-sm min-w-fit">iframe:</span>
              <input
                type="text"
                readOnly
                value={`<iframe src=\"${getEmbedUrl(type, type === "movie" ? movieId : tvId, season, episode)}\" frameborder=\"0\" allowfullscreen style=\"width:100%;height:100%;border-radius:18px;\"></iframe>`}
                className="flex-1 bg-[#232a36]/80 border border-[#3a3f4b] text-white font-mono rounded-md px-3 py-1 text-xs select-all"
              />
              <button
                className="bg-[#232a36] border border-blue-400 text-blue-300 px-3 py-1 rounded-md font-mono text-xs hover:bg-blue-900/40 transition"
                onClick={() => copyToClipboard(`<iframe src=\"${getEmbedUrl(type, type === "movie" ? movieId : tvId, season, episode)}\" frameborder=\"0\" allowfullscreen style=\"width:100%;height:100%;border-radius:18px;\"></iframe>`)}
              >
                نسخ
              </button>
            </div>
          </div>
        </div>
        {/* عرض نتيجة البحث (اختياري كبداية) */}
        <div className="flex justify-center">
          {movieLoading && <div className="text-blue-400 font-bold">Loading...</div>}
          {movieError && <div className="text-red-400 font-bold">{movieError}</div>}
          {movieData && (
            <div className="bg-black/70 border border-gray-700 rounded-2xl p-6 w-full max-w-xl flex flex-col items-center shadow-lg">
              <img
                src={`https://image.tmdb.org/t/p/w500${movieData.poster_path}`}
                alt={movieData.title}
                className="w-40 rounded-xl mb-4 shadow-lg"
              />
              <h3 className="text-white text-xl font-bold mb-2">{movieData.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{movieData.overview}</p>
            </div>
          )}
          {tvLoading && <div className="text-blue-400 font-bold">Loading...</div>}
          {tvError && <div className="text-red-400 font-bold">{tvError}</div>}
          {tvData && (
            <div className="bg-black/70 border border-gray-700 rounded-2xl p-6 w-full max-w-xl flex flex-col items-center shadow-lg">
              <img
                src={`https://image.tmdb.org/t/p/w500${tvData.poster_path}`}
                alt={tvData.name}
                className="w-40 rounded-xl mb-4 shadow-lg"
              />
              <h3 className="text-white text-xl font-bold mb-2">{tvData.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{tvData.overview}</p>
            </div>
          )}
        </div>
        {/* كروت الميزات */}
        <div className="w-full flex flex-col items-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {/* كرت 1 */}
            <FeatureCard color="pink" icon={
              <span dangerouslySetInnerHTML={{
                __html: `<lord-icon src=\"https://cdn.lordicon.com/ogjpwrxe.json\" trigger=\"hover\" colors=\"primary:#f472b6,secondary:#f472b6\" style=\"width:48px;height:48px\"></lord-icon>`
              }} />
            } title="Seamless Integration" desc="Effortlessly embed the player with just a simple link—no setup required." />
            {/* كرت 2 */}
            <FeatureCard color="blue" icon={
              <span dangerouslySetInnerHTML={{
                __html: `<lord-icon src=\"https://cdn.lordicon.com/lbcxnxti.json\" trigger=\"hover\" colors=\"primary:#121331,secondary:#7166ee\" style=\"width:48px;height:48px\"></lord-icon>`
              }} />
            } title="Vast Collection" desc="Access a massive library of movies and shows, aggregated from multiple sources." />
            {/* كرت 3 */}
            <FeatureCard color="purple" icon={
              <span dangerouslySetInnerHTML={{
                __html: `<lord-icon src=\"https://cdn.lordicon.com/jectmwqf.json\" trigger=\"hover\" colors=\"primary:#a78bfa,secondary:#a78bfa\" style=\"width:48px;height:48px\"></lord-icon>`
              }} />
            } title="Fully Customizable" desc="Tailor the player to your preferences using intuitive query parameters." />
            {/* كرت 4 */}
            <FeatureCard color="green" icon={
              <span dangerouslySetInnerHTML={{
                __html: `<lord-icon src=\"https://cdn.lordicon.com/nvsfzbop.json\" trigger=\"hover\" colors=\"primary:#4ade80,secondary:#4ade80\" style=\"width:48px;height:48px\"></lord-icon>`
              }} />
            } title="Always Fresh" desc="New content is added daily and updated automatically, so you never miss out." />
            {/* كرت 5 */}
            <FeatureCard color="red" icon={
              <span dangerouslySetInnerHTML={{
                __html: `<lord-icon src=\"https://cdn.lordicon.com/cwwqfdik.json\" trigger=\"hover\" colors=\"primary:#f87171,secondary:#f87171\" style=\"width:48px;height:48px\"></lord-icon>`
              }} />
            } title="Top-Tier Quality" desc="Enjoy the latest available quality with lightning-fast performance." />
            {/* كرت 6 */}
            <FeatureCard color="gray" icon={
              <span dangerouslySetInnerHTML={{
                __html: `<lord-icon src=\"https://cdn.lordicon.com/rpviwvwn.json\" trigger=\"hover\" colors=\"primary:#d1d5db,secondary:#d1d5db\" style=\"width:48px;height:48px\"></lord-icon>`
              }} />
            } title="Adfree plays" desc="Boost your traffic with adfree plays" />
          </div>
        </div>
        {/* قسم التوثيق */}
        <div className="w-full flex flex-col items-center mt-16">
          <div className="w-full max-w-6xl rounded-2xl border border-green-900 bg-[#18181b]/90 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-mono font-bold text-white">API <span className="text-green-400">DOCUMENTATION</span></span>
            </div>
            {/* Movies */}
            <div className="mb-8">
              <div className="font-bold text-white mb-1">Embed Movies <span className="font-normal text-xs text-gray-400">TmdbId is required from <a href="https://themoviedb.org/" className="text-green-400 underline" target="_blank">The Movie Database</a> API.</span></div>
              <div className="bg-[#232a36]/80 border border-[#3a3f4b] rounded-lg px-4 py-2 text-white font-mono text-sm flex items-center justify-between mb-1">
                <span>{origin}/embed/movie/[tmdb_id]</span>
                <button className="ml-2 text-gray-400 hover:text-green-400" onClick={() => copyToClipboard(`${origin}/embed/movie/[tmdb_id]`)}>📋</button>
              </div>
              <div className="text-xs text-gray-400 mb-1">Code Example</div>
              <div className="bg-[#232a36]/80 border border-[#3a3f4b] rounded-lg px-4 py-2 text-white font-mono text-xs flex items-center justify-between">
                <code className="whitespace-pre overflow-x-auto">{`<iframe src="${origin}/embed/movie/[tmdb_id]" frameborder="0" scrolling="no" allowfullscreen ></iframe>`}</code>
                <button className="ml-2 text-gray-400 hover:text-green-400" onClick={() => copyToClipboard(`<iframe src="${origin}/embed/movie/[tmdb_id]" frameborder="0" scrolling="no" allowfullscreen ></iframe>`)}>📋</button>
              </div>
            </div>
            {/* Shows */}
            <div className="mb-8">
              <div className="font-bold text-white mb-1">Embed Shows <span className="font-normal text-xs text-gray-400">TmdbId is required from <a href="https://themoviedb.org/" className="text-green-400 underline" target="_blank">The Movie Database</a> API. Season and episode number should not be empty.</span></div>
              <div className="bg-[#232a36]/80 border border-[#3a3f4b] rounded-lg px-4 py-2 text-white font-mono text-sm flex items-center justify-between mb-1">
                <span>{origin}/embed/tv/[tmdb_id]/[season]/[episode]</span>
                <button className="ml-2 text-gray-400 hover:text-green-400" onClick={() => copyToClipboard(`${origin}/embed/tv/[tmdb_id]/[season]/[episode]`)}>📋</button>
              </div>
              <div className="text-xs text-gray-400 mb-1">Code Example</div>
              <div className="bg-[#232a36]/80 border border-[#3a3f4b] rounded-lg px-4 py-2 text-white font-mono text-xs flex items-center justify-between">
                <code className="whitespace-pre overflow-x-auto">{`<iframe src="${origin}/embed/tv/[tmdb_id]/[season]/[episode]" scrolling="no" frameborder="0" allowfullscreen ></iframe>`}</code>
                <button className="ml-2 text-gray-400 hover:text-green-400" onClick={() => copyToClipboard(`<iframe src="${origin}/embed/tv/[tmdb_id]/[season]/[episode]" scrolling="no" frameborder="0" allowfullscreen ></iframe>`)}>📋</button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      {/* Scroller animation */}
      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 80s linear infinite;
        }
      `}</style>
    </div>
  );
}// دوال مساعدة
function getEmbedUrl(type: string, id: string, season: string, episode: string) {
  if (!id) return "";
  const baseUrl = "https://apika.netlify.app"; // Use production URL
  if (type === "movie") return `${baseUrl}/embed/movie/${id}`;
  if (type === "tv") return `${baseUrl}/embed/tv/${id}/${season || 1}/${episode || 1}`;
  return "";
}

function copyToClipboard(text: string) {
  if (!text) return;
  navigator.clipboard.writeText(text.replace(/\\"/g, '"'));
}

// مكون الكرت
function FeatureCard({ color, icon, title, desc }: { color: string, icon: React.ReactNode, title: string, desc: string }) {
  const colorMap: any = {
    pink: 'border-pink-400',
    blue: 'border-blue-400',
    purple: 'border-purple-400',
    green: 'border-green-400',
    red: 'border-red-400',
    gray: 'border-gray-400',
  };
  return (
    <div className={`relative rounded-2xl bg-[#18181b]/90 border ${colorMap[color]} p-6 flex flex-col gap-2 min-h-[150px] shadow-lg overflow-hidden`}> 
      <div className="flex items-center gap-3 mb-2">{icon}<span className="font-bold text-white text-lg">{title}</span></div>
      <div className="text-gray-300 text-sm">{desc}</div>
    </div>
  );
}
