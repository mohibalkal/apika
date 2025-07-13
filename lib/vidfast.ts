import puppeteer from 'puppeteer';

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

async function extractServerSegments(page: any, server: keyof typeof BASE_SERVERS): Promise<VideoSegment[]> {
  console.log(`[DEBUG] Starting extraction for server: ${server}`);
  const segments: VideoSegment[] = [];

  try {
    // انتظار تحميل المحتوى مع timeout أطول
    await page.waitForFunction(() => {
      const ready = document.readyState === 'complete';
      const hasContent = document.body.innerHTML.length > 0;
      console.log('[DEBUG] Page state:', { ready, hasContent });
      return ready && hasContent;
    }, { 
      timeout: 30000,
      polling: 'mutation'
    });
    
    // محاولة النقر على زر السيرفر عدة مرات
    let serverButtonClicked = false;
    for (let attempt = 0; attempt < 3 && !serverButtonClicked; attempt++) {
      console.log(`[DEBUG] Attempt ${attempt + 1} to click server button: ${server}`);
      
             serverButtonClicked = await page.evaluate(() => {
         console.log('[DEBUG] Looking for Alpha server...');
         
         // First, try to find and click the server selection button (mui-e6tdqy)
         const serverSelectionButton = document.querySelector('.mui-e6tdqy');
         if (serverSelectionButton) {
           console.log('[DEBUG] Found server selection button, clicking it...');
           (serverSelectionButton as HTMLElement).click();
           
           // Wait a bit for the dialog to open
           setTimeout(() => {
             // Now look for Alpha server in the dialog
             const serverItems = Array.from(document.querySelectorAll('.MuiMenuItem-root'));
             console.log(`[DEBUG] Found ${serverItems.length} server items in dialog`);
             
             const targetServer = serverItems.find(item => {
               const text = (item.textContent || '').toLowerCase();
               return text.includes('alpha');
             });
             
             if (targetServer) {
               console.log('[DEBUG] Found Alpha server in dialog, clicking it...');
               (targetServer as HTMLElement).click();
               return true;
             } else {
               console.log('[DEBUG] Alpha server not found in dialog');
               return false;
             }
           }, 1000);
           
           return true; // We clicked the selection button
         }
         
         // Fallback: try direct button search
         const buttons = Array.from(document.querySelectorAll('button, [role="button"], .MuiButtonBase-root'));
         console.log('[DEBUG] Found buttons:', buttons.length);
         
         // Log all button texts for debugging
         buttons.forEach((btn, index) => {
           const text = (btn.textContent || '').toLowerCase();
           const classes = (btn.className || '').toLowerCase();
           console.log(`[DEBUG] Button ${index}: text="${text}", classes="${classes}"`);
         });
         
         const serverButton = buttons.find(btn => {
           const text = (btn.textContent || '').toLowerCase();
           const classes = (btn.className || '').toLowerCase();
           
           return text.includes('alpha') || classes.includes('alpha');
         });
         
         if (serverButton) {
           console.log('[DEBUG] Found direct Alpha button');
           try {
             (serverButton as HTMLElement).click();
             return true;
           } catch (error) {
             console.error('[DEBUG] Error clicking Alpha button:', error);
             return false;
           }
         }
         
         console.log('[DEBUG] No Alpha button found');
         return false;
       });
      
      if (!serverButtonClicked) {
        console.log(`[DEBUG] Click attempt ${attempt + 1} failed for ${server}, waiting 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log(`[DEBUG] Successfully clicked button for ${server}`);
      }
    }

    if (!serverButtonClicked) {
      console.log(`[DEBUG] Failed to click server button after 3 attempts: ${server}`);
      return [];
    }

    // انتظار ظهور مشغل الفيديو
    try {
      await page.waitForSelector('video', { timeout: 20000 });
    } catch (error) {
      console.warn('Video player not found in time, continuing anyway:', error);
    }

    // تتبع طلبات الشبكة
    page.on('request', async (request: any) => {
      const url = request.url();
      
             // Check if URL matches video patterns for Alpha server
       const isVideoUrl = (() => {
         // Check domain for Alpha server only
         const isValidDomain = url.startsWith('https://hexawave3.xyz/file2');
         
         if (!isValidDomain) return false;

         // Check if it's a video URL by checking path structure
         // The URLs contain encoded quality and segment information
         const isVideoPattern = url.includes('/MTA4MA==/') || 
                              url.includes('/NzIw/') ||
                              url.includes('/playlist.m3u8') ||
                              url.includes('/index.m3u8') ||
                              url.includes('/hls/') ||
                              url.includes('/c2VnL') || // Base64 encoded 'seg'
                              url.includes('.m3u8') ||
                              url.includes('.ts');

         return isVideoPattern;
       })();

      if (isVideoUrl) {
        console.log(`[DEBUG] Found video URL: ${url}`);
        try {
          const urlParts = url.split('/');
          
          // Extract quality from base64 encoded part
          let quality = 'unknown';
          const qualityIndex = urlParts.findIndex((part: string) => part === 'MTA4MA==' || part === 'NzIw');
          if (qualityIndex !== -1) {
            quality = urlParts[qualityIndex] === 'MTA4MA==' ? '1080' : 
                     urlParts[qualityIndex] === 'NzIw' ? '720' : 
                     urlParts[qualityIndex];
          }

          // Extract segment number from base64 encoded filename
          const filename = urlParts[urlParts.length - 1];
          let index = 0;
          
          // Try to decode base64 filename to get segment number
          try {
            if (filename.includes('c2VnL')) { // Base64 for 'seg'
              const decoded = Buffer.from(filename, 'base64').toString();
              const segmentMatch = decoded.match(/seg-(\d+)/i);
              if (segmentMatch) {
                index = parseInt(segmentMatch[1]);
              }
            }
          } catch (decodeError) {
            // If base64 decode fails, try to extract from the original filename
            const segmentMatch = filename.match(/seg-(\d+)/i);
            if (segmentMatch) {
              index = parseInt(segmentMatch[1]);
            }
          }

          // Determine segment type
          const type = filename.includes('.m3u8') || url.includes('.m3u8') ? 'm3u8' : 'ts';

          // Add segment to list
          console.log(`[DEBUG] Added video segment: ${url}, quality: ${quality}, index: ${index}, type: ${type}`);
          segments.push({
            url,
            quality,
            server,
            type,
            index
          });
        } catch (error) {
          console.error(`[ERROR] Failed to process video URL: ${url}`, error);
        }
      }
    });

    // Try to start video playback with retry
    console.log('Starting video playback...');
    let playbackStarted = false;
    for (let attempt = 0; attempt < 3 && !playbackStarted; attempt++) {
      playbackStarted = await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = 0;
          const playPromise = video.play();
          if (playPromise) {
            playPromise.catch(err => console.error('Error playing video:', err));
          }
          return true;
        }
        return false;
      });
      
              if (!playbackStarted) {
          console.log(`Playback attempt ${attempt + 1} failed, waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Wait for segments
    try {
      await new Promise(resolve => setTimeout(resolve, 15000));
    } catch (error) {
      console.error('Error during timeout:', error);
    }

    // Sort segments by index
    segments.sort((a, b) => a.index - b.index);

    // Remove duplicates
    const uniqueSegments = segments.filter((segment, index, self) => 
      index === self.findIndex(s => s.url === segment.url)
    );

    console.log(`[DEBUG] Found ${uniqueSegments.length} unique segments for server ${server}`);

    // Group segments by quality
    const qualityGroups = new Map<string, VideoSegment[]>();
    for (const segment of uniqueSegments) {
      const group = qualityGroups.get(segment.quality) || [];
      group.push(segment);
      qualityGroups.set(segment.quality, group);
    }

         return uniqueSegments;
  } catch (error) {
    console.error(`[ERROR] Failed to extract segments for server ${server}:`, error);
    return segments;
  }

  return segments;
}

export async function extractMovieLinks(videoId: string): Promise<MovieLinksResult> {
  const cleanVideoId = videoId.includes('/') ? videoId.split('/').pop() || videoId : videoId;
  console.log(`Processing movie ID: ${cleanVideoId}`);
  
  const videoUrl = `${VIDFAST_BASE_URL}/movie/${cleanVideoId}`;
  console.log(`Fetching from URL: ${videoUrl}`);

  let browser;
  const subtitles: SubtitleSource[] = [];
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--force-gpu-mem-available-mb=1024',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    const page = await browser.newPage();
    
    // Set modern user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br',
      'sec-fetch-site': 'none',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-user': '?1',
      'sec-fetch-dest': 'document',
      'Referer': 'https://vidfast.pro/'
    });

    // Enable request interception
    await page.setRequestInterception(true);

    // Handle requests - only allow essential resources
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (
        resourceType === 'image' || 
        resourceType === 'stylesheet' ||
        resourceType === 'font' ||
        resourceType === 'media' ||
        request.url().includes('google') ||
        request.url().includes('analytics') ||
        request.url().includes('ads')
      ) {
        request.abort();
      } else {
        console.log(`Allowing request: ${request.url()}`);
        request.continue();
      }
    });

    // Monitor responses for debugging and subtitle extraction
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      
      // تتبع طلبات الترجمات
      if (url.startsWith('https://sub.wyzie.ru/search')) {
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            // إزالة الترجمات المكررة باستخدام Map
            const uniqueSubtitles = new Map();
            
            data.forEach(sub => {
              if (sub && sub.id && sub.url && sub.language && sub.display) {
                const key = `${sub.language}-${sub.display}`;
                // نحتفظ فقط بأول نسخة من كل لغة
                if (!uniqueSubtitles.has(key)) {
                  uniqueSubtitles.set(key, {
                    url: sub.url, // رابط ملف الترجمة المباشر
                    language: sub.language,
                    label: sub.display,
                    isDefault: sub.language === 'en',
                    format: sub.format || 'srt',
                    encoding: sub.encoding || 'UTF-8'
                  });
                  console.log(`[DEBUG] Found subtitle: ${sub.language} - ${sub.display} (${sub.url})`);
                }
              }
            });
            
            // تحويل Map إلى مصفوفة باستخدام Array.from
            subtitles.push(...Array.from(uniqueSubtitles.values()));
          }
        } catch (error) {
          console.error('[ERROR] Failed to parse subtitles response:', error);
        }
      }
      
      // تتبع باقي الطلبات للتصحيح
      if (status !== 200) {
        try {
          const text = await response.text();
          console.log('Response text:', text.substring(0, 500));
        } catch (e) {
          console.log('Could not get response text:', e);
        }
      }
    });

    // Hide automation
    await page.evaluateOnNewDocument(() => {
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Array;
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise;
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
      
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      
      (window as any).chrome = {
        runtime: {},
        loadTimes: () => {},
        csi: () => {},
        app: {}
      };
    });

    // Enable page console and error logging
    page.on('console', msg => console.log('Page log:', msg.text()));
    page.on('error', err => console.error('Page error:', err));
    page.on('pageerror', err => console.error('Page error:', err));

    // Navigate to video page with better error handling
    console.log('Navigating to video page...');
    const response = await page.goto(videoUrl, { 
      waitUntil: 'domcontentloaded',  // تغيير من networkidle0 لتسريع التحميل
      timeout: 60000  // زيادة وقت الانتظار
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response?.status()} ${response?.statusText()}`);
    }

    // Wait for initial page load with more granular checks
    console.log('Waiting for page load...');
    try {
      await page.waitForFunction(() => {
        const ready = document.readyState === 'interactive' || document.readyState === 'complete';
        const hasContent = document.body && document.body.innerHTML.length > 0;
        console.log('Page state:', { ready, hasContent });
        return ready && hasContent;
      }, { 
        timeout: 45000,
        polling: 500
      });
    } catch (error) {
      console.warn('Initial page load timeout, continuing anyway:', error);
    }

    // Extract page info
    console.log('[DEBUG] Extracting page info...');
    const title = await page.title();
    console.log('[DEBUG] Page title:', title);

    // Extract poster image
    const poster = await page.$eval('meta[property="og:image"]', (el: any) => el.content)
      .catch(() => undefined);
    console.log('[DEBUG] Found poster:', poster);

         // استخراج المقاطع من Alpha فقط
     const sources: VideoSource[] = [];
     console.log('[DEBUG] Processing Alpha server...');
     try {
       const segments = await extractServerSegments(page, 'Alpha');
       console.log(`[DEBUG] Alpha server returned ${segments.length} segments`);
       
       if (segments.length > 0) {
         // تجميع المقاطع حسب الجودة
         const qualityGroups = new Map<string, VideoSegment[]>();
         
         // فرز المقاطع حسب الجودة
         for (const segment of segments) {
           const group = qualityGroups.get(segment.quality) || [];
           group.push(segment);
           qualityGroups.set(segment.quality, group);
         }

         // إضافة مصدر لكل جودة
         for (const [quality, qualitySegments] of Array.from(qualityGroups.entries())) {
           // ترتيب المقاطع حسب الترتيب
           const sortedSegments = qualitySegments.sort((a, b) => a.index - b.index);
           
           // البحث عن قائمة التشغيل الرئيسية
           const playlistSegment = sortedSegments.find(s => s.type === 'm3u8');
           const tsSegments = sortedSegments.filter(s => s.type === 'ts');

           // إذا وجدنا مقاطع صالحة
           if (playlistSegment || tsSegments.length > 0) {
             const source: VideoSource = {
               server: 'Alpha',
               quality,
               segments: tsSegments,
               playlistUrl: playlistSegment?.url,
               url: playlistSegment?.url || tsSegments[0]?.url || ''
             };

             if (source.url) {
               console.log(`[DEBUG] Adding source for Alpha ${quality}:`, {
                 hasUrl: !!source.url,
                 hasPlaylist: !!source.playlistUrl,
                 segmentsCount: source.segments.length
               });
               sources.push(source);
             }
           }
         }
       }
     } catch (error) {
       console.error('[DEBUG] Error extracting segments from Alpha:', error);
     }

         console.log(`[DEBUG] Final sources:`, sources.map(s => ({
       server: s.server,
       quality: s.quality,
       hasUrl: !!s.url,
       hasPlaylist: !!s.playlistUrl,
       segmentsCount: s.segments.length
     })));

     console.log(`[DEBUG] Found ${subtitles.length} subtitles`);

     return {
       sources,
       subtitles
     };

  } catch (error) {
    console.error('Error in extractMovieLinks:', error);
    if (browser) await browser.close();
    return { sources: [], subtitles: [] };
  } finally {
    if (browser) await browser.close();
  }
}

export async function extractSeriesLinks(id: string, season: number, episode: number): Promise<MovieLinksResult> {
  const cleanId = id.includes('/') ? id.split('/').pop() || id : id;
  console.log(`Processing series - ID: ${cleanId}, Season: ${season}, Episode: ${episode}`);
  
  const videoUrl = `${VIDFAST_BASE_URL}/tv/${cleanId}/${season}/${episode}`;
  console.log(`Fetching from URL: ${videoUrl}`);

  let browser;
  const subtitles: SubtitleSource[] = [];
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--force-gpu-mem-available-mb=1024',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    const page = await browser.newPage();
    
    // Set modern user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br',
      'sec-fetch-site': 'none',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-user': '?1',
      'sec-fetch-dest': 'document',
      'Referer': 'https://vidfast.pro/'
    });

    // Enable request interception
    await page.setRequestInterception(true);

    // Handle requests - only allow essential resources
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (
        resourceType === 'image' || 
        resourceType === 'stylesheet' ||
        resourceType === 'font' ||
        resourceType === 'media' ||
        request.url().includes('google') ||
        request.url().includes('analytics') ||
        request.url().includes('ads')
      ) {
        request.abort();
      } else {
        console.log(`Allowing request: ${request.url()}`);
        request.continue();
      }
    });

    // Monitor responses for debugging and subtitle extraction
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      
      // تتبع طلبات الترجمات
      if (url.startsWith('https://sub.wyzie.ru/search')) {
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            // إزالة الترجمات المكررة باستخدام Map
            const uniqueSubtitles = new Map();
            
            data.forEach(sub => {
              if (sub && sub.id && sub.url && sub.language && sub.display) {
                const key = `${sub.language}-${sub.display}`;
                // نحتفظ فقط بأول نسخة من كل لغة
                if (!uniqueSubtitles.has(key)) {
                  uniqueSubtitles.set(key, {
                    url: sub.url, // رابط ملف الترجمة المباشر
                    language: sub.language,
                    label: sub.display,
                    isDefault: sub.language === 'en',
                    format: sub.format || 'srt',
                    encoding: sub.encoding || 'UTF-8'
                  });
                  console.log(`[DEBUG] Found subtitle: ${sub.language} - ${sub.display} (${sub.url})`);
                }
              }
            });
            
            // تحويل Map إلى مصفوفة باستخدام Array.from
            subtitles.push(...Array.from(uniqueSubtitles.values()));
          }
        } catch (error) {
          console.error('[ERROR] Failed to parse subtitles response:', error);
        }
      }
      
      // تتبع باقي الطلبات للتصحيح
      if (status !== 200) {
        try {
          const text = await response.text();
          console.log('Response text:', text.substring(0, 500));
        } catch (e) {
          console.log('Could not get response text:', e);
        }
      }
    });

    // Hide automation
    await page.evaluateOnNewDocument(() => {
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Array;
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise;
      delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
      
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      
      (window as any).chrome = {
        runtime: {},
        loadTimes: () => {},
        csi: () => {},
        app: {}
      };
    });

    // Enable page console and error logging
    page.on('console', msg => console.log('Page log:', msg.text()));
    page.on('error', err => console.error('Page error:', err));
    page.on('pageerror', err => console.error('Page error:', err));

    // Navigate to video page with better error handling
    console.log('Navigating to video page...');
    const response = await page.goto(videoUrl, { 
      waitUntil: 'domcontentloaded',  // تغيير من networkidle0 لتسريع التحميل
      timeout: 60000  // زيادة وقت الانتظار
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response?.status()} ${response?.statusText()}`);
    }

    // Wait for initial page load with more granular checks
    console.log('Waiting for page load...');
    try {
      await page.waitForFunction(() => {
        const ready = document.readyState === 'interactive' || document.readyState === 'complete';
        const hasContent = document.body && document.body.innerHTML.length > 0;
        console.log('Page state:', { ready, hasContent });
        return ready && hasContent;
      }, { 
        timeout: 45000,
        polling: 500
      });
    } catch (error) {
      console.warn('Initial page load timeout, continuing anyway:', error);
    }

    // Extract page info
    console.log('[DEBUG] Extracting page info...');
    const title = await page.title();
    console.log('[DEBUG] Page title:', title);

    // Extract poster image
    const poster = await page.$eval('meta[property="og:image"]', (el: any) => el.content)
      .catch(() => undefined);
    console.log('[DEBUG] Found poster:', poster);

    // استخراج المقاطع من Alpha فقط
    const sources: VideoSource[] = [];
    console.log('[DEBUG] Processing Alpha server...');
    try {
      const segments = await extractServerSegments(page, 'Alpha');
      console.log(`[DEBUG] Alpha server returned ${segments.length} segments`);
      
      if (segments.length > 0) {
        // تجميع المقاطع حسب الجودة
        const qualityGroups = new Map<string, VideoSegment[]>();
        
        // فرز المقاطع حسب الجودة
        for (const segment of segments) {
          const group = qualityGroups.get(segment.quality) || [];
          group.push(segment);
          qualityGroups.set(segment.quality, group);
        }

        // إضافة مصدر لكل جودة
        for (const [quality, qualitySegments] of Array.from(qualityGroups.entries())) {
          // ترتيب المقاطع حسب الترتيب
          const sortedSegments = qualitySegments.sort((a, b) => a.index - b.index);
          
          // البحث عن قائمة التشغيل الرئيسية
          const playlistSegment = sortedSegments.find(s => s.type === 'm3u8');
          const tsSegments = sortedSegments.filter(s => s.type === 'ts');

          // إذا وجدنا مقاطع صالحة
          if (playlistSegment || tsSegments.length > 0) {
            const source: VideoSource = {
              server: 'Alpha',
              quality,
              segments: tsSegments,
              playlistUrl: playlistSegment?.url,
              url: playlistSegment?.url || tsSegments[0]?.url || ''
            };

            if (source.url) {
              console.log(`[DEBUG] Adding source for Alpha ${quality}:`, {
                hasUrl: !!source.url,
                hasPlaylist: !!source.playlistUrl,
                segmentsCount: source.segments.length
              });
              sources.push(source);
            }
          }
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error extracting segments from Alpha:', error);
    }

    console.log('[DEBUG] Final sources:', sources);
    console.log('[DEBUG] Found subtitles:', subtitles);

    return {
      sources,
      subtitles
    };

  } catch (error) {
    console.error('Error extracting series links:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}