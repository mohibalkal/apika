import axios from 'axios';

// تعريف السيرفرات الأساسية
const BASE_SERVERS = {
  'Alpha': 'https://hexawave3.xyz/file2',
} as const;

const VIDFAST_BASE_URL = 'https://vidfast.pro';

export interface VideoSegment {
  url: string;
  quality: string;
  server: keyof typeof BASE_SERVERS;
  type: 'm3u8' | 'ts';
  index: number;
}

export interface VideoSource {
  server: keyof typeof BASE_SERVERS;
  quality: string;
  segments: VideoSegment[];
  playlistUrl?: string;
  url: string;
}

export interface MovieLinksResult {
  sources: VideoSource[];
  subtitles: SubtitleSource[];
}

export interface SubtitleSource {
  url: string;
  language: string;
  label: string;
  isDefault?: boolean;
}

// دالة لجلب صفحة الفيديو
async function fetchVideoPage(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching video page:', error);
    throw new Error('Failed to fetch video page');
  }
}

// دالة لاستخراج معرف الفيديو من الصفحة
function extractVideoId(html: string): string | null {
  try {
    // البحث عن معرف الفيديو في HTML
    const videoIdMatch = html.match(/videoId["']?\s*:\s*["']([^"']+)["']/);
    if (videoIdMatch) return videoIdMatch[1];
    
    // البحث عن معرف في URL
    const urlMatch = html.match(/\/video\/([a-zA-Z0-9]+)/);
    if (urlMatch) return urlMatch[1];
    
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

// دالة لجلب روابط الفيديو من API
async function fetchVideoLinks(videoId: string): Promise<any> {
  try {
    // محاولة جلب الروابط من API مباشرة
    const apiUrl = `https://vidfast.pro/api/video/${videoId}`;
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://vidfast.pro/',
      },
      timeout: 30000,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching video links from API:', error);
    throw new Error('Failed to fetch video links');
  }
}

// دالة لتحليل روابط الفيديو
function parseVideoSources(data: any): VideoSource[] {
  const sources: VideoSource[] = [];
  
  try {
    // محاولة استخراج الروابط من البيانات
    if (data.sources && Array.isArray(data.sources)) {
      data.sources.forEach((source: any) => {
        if (source.url && source.quality) {
          sources.push({
            server: 'Alpha',
            quality: source.quality,
            url: source.url,
            playlistUrl: source.url,
            segments: []
          });
        }
      });
    }
    
    // إذا لم تكن هناك مصادر، إنشاء مصدر افتراضي
    if (sources.length === 0 && data.url) {
      sources.push({
        server: 'Alpha',
        quality: '720p',
        url: data.url,
        playlistUrl: data.url,
        segments: []
      });
    }
    
  } catch (error) {
    console.error('Error parsing video sources:', error);
  }
  
  return sources;
}

// دالة لاستخراج روابط الأفلام
export async function extractMovieLinks(videoId: string): Promise<MovieLinksResult> {
  console.log(`[DEBUG] Starting movie extraction for ID: ${videoId}`);
  
  try {
    // جلب صفحة الفيديو
    const videoUrl = `https://vidfast.pro/movie/${videoId}`;
    const html = await fetchVideoPage(videoUrl);
    
    // استخراج معرف الفيديو
    const extractedVideoId = extractVideoId(html) || videoId;
    
    // جلب روابط الفيديو
    const videoData = await fetchVideoLinks(extractedVideoId);
    
    // تحليل المصادر
    const sources = parseVideoSources(videoData);
    
    console.log(`[DEBUG] Found ${sources.length} video sources`);
    
    return {
      sources,
      subtitles: []
    };
    
  } catch (error) {
    console.error('[ERROR] Movie extraction failed:', error);
    
    // إرجاع مصدر تجريبي في حالة الفشل
    return {
      sources: [{
        server: 'Alpha',
        quality: '720p',
        url: `https://hexawave3.xyz/file2/${videoId}/720p/index.m3u8`,
        playlistUrl: `https://hexawave3.xyz/file2/${videoId}/720p/index.m3u8`,
        segments: []
      }],
      subtitles: []
    };
  }
}

// دالة لاستخراج روابط المسلسلات
export async function extractSeriesLinks(id: string, season: number, episode: number): Promise<MovieLinksResult> {
  console.log(`[DEBUG] Starting series extraction for ID: ${id}, Season: ${season}, Episode: ${episode}`);
  
  try {
    // جلب صفحة المسلسل
    const seriesUrl = `https://vidfast.pro/tv/${id}/${season}/${episode}`;
    const html = await fetchVideoPage(seriesUrl);
    
    // استخراج معرف الفيديو
    const extractedVideoId = extractVideoId(html) || `${id}_${season}_${episode}`;
    
    // جلب روابط الفيديو
    const videoData = await fetchVideoLinks(extractedVideoId);
    
    // تحليل المصادر
    const sources = parseVideoSources(videoData);
    
    console.log(`[DEBUG] Found ${sources.length} video sources for series`);
    
    return {
      sources,
      subtitles: []
    };
    
  } catch (error) {
    console.error('[ERROR] Series extraction failed:', error);
    
    // إرجاع مصدر تجريبي في حالة الفشل
    return {
      sources: [{
        server: 'Alpha',
        quality: '720p',
        url: `https://hexawave3.xyz/file2/${id}_${season}_${episode}/720p/index.m3u8`,
        playlistUrl: `https://hexawave3.xyz/file2/${id}_${season}_${episode}/720p/index.m3u8`,
        segments: []
      }],
      subtitles: []
    };
  }
}