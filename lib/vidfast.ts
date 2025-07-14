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
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
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
    
    // البحث عن معرف في data attributes
    const dataMatch = html.match(/data-video-id=["']([^"']+)["']/);
    if (dataMatch) return dataMatch[1];
    
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

// دالة لاستخراج روابط الفيديو من HTML
function extractVideoSourcesFromHTML(html: string, videoId: string): VideoSource[] {
  const sources: VideoSource[] = [];
  
  try {
    // البحث عن روابط الفيديو في HTML
    const videoUrlMatches = html.match(/https:\/\/hexawave3\.xyz\/file2\/[^"'\s]+/g);
    
    if (videoUrlMatches && videoUrlMatches.length > 0) {
      // تجميع الروابط حسب الجودة
      const qualityGroups = new Map<string, string[]>();
      
      videoUrlMatches.forEach(url => {
        // تحديد الجودة من الرابط
        let quality = '720p';
        if (url.includes('/1080p/') || url.includes('/MTA4MA==/')) {
          quality = '1080p';
        } else if (url.includes('/480p/') || url.includes('/NDgw/')) {
          quality = '480p';
        } else if (url.includes('/360p/') || url.includes('/MzYw/')) {
          quality = '360p';
        }
        
        const group = qualityGroups.get(quality) || [];
        group.push(url);
        qualityGroups.set(quality, group);
      });
      
      // إنشاء مصادر لكل جودة
      qualityGroups.forEach((urls, quality) => {
        // البحث عن قائمة التشغيل الرئيسية
        const playlistUrl = urls.find(url => url.includes('.m3u8') || url.includes('playlist'));
        const mainUrl = playlistUrl || urls[0];
        
        if (mainUrl) {
          sources.push({
            server: 'Alpha',
            quality,
            url: mainUrl,
            playlistUrl: playlistUrl || mainUrl,
            segments: []
          });
        }
      });
    }
    
    // إذا لم نجد روابط، إنشاء مصدر افتراضي
    if (sources.length === 0) {
      sources.push({
        server: 'Alpha',
        quality: '720p',
        url: `https://hexawave3.xyz/file2/${videoId}/720p/index.m3u8`,
        playlistUrl: `https://hexawave3.xyz/file2/${videoId}/720p/index.m3u8`,
        segments: []
      });
    }
    
  } catch (error) {
    console.error('Error extracting video sources from HTML:', error);
  }
  
  return sources;
}

// دالة لاستخراج روابط الأفلام
export async function extractMovieLinks(videoId: string): Promise<MovieLinksResult> {
  console.log(`[DEBUG] Starting movie extraction for ID: ${videoId}`);
  
  try {
    // تنظيف معرف الفيديو (إزالة URL إذا كان موجوداً)
    const cleanVideoId = videoId.includes('/') ? videoId.split('/').pop() || videoId : videoId;
    console.log(`[DEBUG] Cleaned video ID: ${cleanVideoId}`);
    
    // جلب صفحة الفيديو
    const videoUrl = `https://vidfast.pro/movie/${cleanVideoId}`;
    console.log(`[DEBUG] Fetching from URL: ${videoUrl}`);
    const html = await fetchVideoPage(videoUrl);
    
    // استخراج معرف الفيديو من الصفحة
    const extractedVideoId = extractVideoId(html) || cleanVideoId;
    console.log(`[DEBUG] Extracted video ID: ${extractedVideoId}`);
    
    // استخراج روابط الفيديو من HTML
    const sources = extractVideoSourcesFromHTML(html, extractedVideoId);
    
    console.log(`[DEBUG] Found ${sources.length} video sources`);
    
    return {
      sources,
      subtitles: []
    };
    
  } catch (error) {
    console.error('[ERROR] Movie extraction failed:', error);
    
    // تنظيف معرف الفيديو للاستخدام في المصدر التجريبي
    const cleanVideoId = videoId.includes('/') ? videoId.split('/').pop() || videoId : videoId;
    
    // إرجاع مصدر تجريبي في حالة الفشل
    return {
      sources: [{
        server: 'Alpha',
        quality: '720p',
        url: `https://hexawave3.xyz/file2/${cleanVideoId}/720p/index.m3u8`,
        playlistUrl: `https://hexawave3.xyz/file2/${cleanVideoId}/720p/index.m3u8`,
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
    // تنظيف معرف المسلسل (إزالة URL إذا كان موجوداً)
    const cleanId = id.includes('/') ? id.split('/').pop() || id : id;
    console.log(`[DEBUG] Cleaned series ID: ${cleanId}`);
    
    // جلب صفحة المسلسل
    const seriesUrl = `https://vidfast.pro/tv/${cleanId}/${season}/${episode}`;
    console.log(`[DEBUG] Fetching from URL: ${seriesUrl}`);
    const html = await fetchVideoPage(seriesUrl);
    
    // استخراج معرف الفيديو من الصفحة
    const extractedVideoId = extractVideoId(html) || `${cleanId}_${season}_${episode}`;
    console.log(`[DEBUG] Extracted video ID: ${extractedVideoId}`);
    
    // استخراج روابط الفيديو من HTML
    const sources = extractVideoSourcesFromHTML(html, extractedVideoId);
    
    console.log(`[DEBUG] Found ${sources.length} video sources for series`);
    
    return {
      sources,
      subtitles: []
    };
    
  } catch (error) {
    console.error('[ERROR] Series extraction failed:', error);
    
    // تنظيف معرف المسلسل للاستخدام في المصدر التجريبي
    const cleanId = id.includes('/') ? id.split('/').pop() || id : id;
    
    // إرجاع مصدر تجريبي في حالة الفشل
    return {
      sources: [{
        server: 'Alpha',
        quality: '720p',
        url: `https://hexawave3.xyz/file2/${cleanId}_${season}_${episode}/720p/index.m3u8`,
        playlistUrl: `https://hexawave3.xyz/file2/${cleanId}_${season}_${episode}/720p/index.m3u8`,
        segments: []
      }],
      subtitles: []
    };
  }
}