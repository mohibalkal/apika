import React, { useState, useRef, useEffect } from "react";
import Hls from "hls.js";

interface VideoSource {
  quality: string;
  url: string;
  server: string;
  playlistUrl?: string;
}

interface SubtitleSource {
  label: string;
  url: string;
  isDefault?: boolean;
  server?: string;
}

interface PlayerCoreProps {
  videoSources?: VideoSource[];
  subtitles?: SubtitleSource[];
  defaultUrl?: string;
  mediaMeta?: any;
  poster?: string;
  backdrop?: string;
}

interface ServerInfo {
  label: string;
  icon: string;
  qualities: string[];
  available: boolean;
}

type EdgeStyleType = 'none' | 'shadow' | 'outline' | 'raised' | 'depressed';

export default function PlayerCore({
  videoSources = [],
  subtitles = [],
  defaultUrl = '',
  mediaMeta = {},
  poster,
  backdrop,
}: PlayerCoreProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCenterControls, setShowCenterControls] = useState(true);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPip, setIsPip] = useState(false);
  const [volume, setVolume] = useState(1);
  const [serverOpen, setServerOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(videoSources[0]?.server || 'English');
  const [isCasting, setIsCasting] = useState(false);
  const [castAvailable, setCastAvailable] = useState(false);
  // استخراج قائمة السيرفرات الفعلية من videoSources

// تعريف قائمة الجودات المتوفرة من videoSources
const availableQualities = videoSources.map(src => ({
  value: src.quality,
  label: src.quality.toUpperCase(), // يمكنك تعديل التسمية حسب الحاجة
  url: src.url,
}));
  // تحديث منطق معالجة السيرفرات والجودات
  const processServers = () => {
    const servers = new Map<string, ServerInfo>();
    // تعريف السيرفرات المتاحة - Alpha فقط
    const serverIcons: Record<string, string> = {
      'Alpha': '🇺🇸',
    };
    // إنشاء قائمة السيرفرات مع جوداتها - Alpha فقط
    videoSources.forEach(source => {
      if (source.server === 'Alpha' && !servers.has(source.server)) {
        servers.set(source.server, {
          label: source.server,
          icon: serverIcons[source.server] || '🌐',
          qualities: [],
          available: true
        });
      }
      if (source.server === 'Alpha') {
        const serverInfo = servers.get(source.server)!;
        if (!serverInfo.qualities.includes(source.quality)) {
          serverInfo.qualities.push(source.quality);
        }
      }
    });
    // إضافة Alpha فقط إذا لم يكن موجوداً
    if (!servers.has('Alpha')) {
      servers.set('Alpha', {
        label: 'Alpha',
        icon: serverIcons['Alpha'],
        qualities: [],
        available: false
      });
    }
    return Array.from(servers.values());
  };

  const serversList = processServers();
  
  // تحديث قائمة الجودات للسيرفر المحدد
  const getServerQualities = (server: string) => {
    return videoSources
      .filter(source => source.server === server)
      .map(source => ({
        label: source.quality + 'p',
        value: source.quality,
        url: source.url || source.playlistUrl || ''  // Add default empty string
      }))
      .sort((a, b) => parseInt(b.value) - parseInt(a.value));
  };

  const currentServerQualities = getServerQualities(selectedServer);

  // إغلاق النافذة عند الضغط خارجها
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settingsOpen]);

  // مزامنة الحالة مع الفيديو
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolume = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolume);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolume);
    };
  }, []);

  // تعريف الجودات الفعلية من videoSources
  const qualitiesList = videoSources
    .filter(v => v.server === selectedServer)
    .map(v => ({ label: v.quality, value: v.quality, url: v.url }));
  const [selectedQuality, setSelectedQuality] = useState(qualitiesList[0]?.value || '');
  const [videoSrc, setVideoSrc] = useState(defaultUrl || qualitiesList[0]?.url || '');
  const [showQualityList, setShowQualityList] = useState(false);

  // تحديث الفيديو عند تغيير الجودة أو السيرفر
  useEffect(() => {
    const q = videoSources.find(v => v.server === selectedServer && v.quality === selectedQuality);
    setVideoSrc(q?.url || defaultUrl || '');
  }, [selectedQuality, selectedServer, videoSources, defaultUrl]);

  const [autoPlay, setAutoPlay] = useState(false);
  const [autoNext, setAutoNext] = useState(false);

  // تفعيل التشغيل التلقائي عند تغيير autoPlay
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.autoplay = autoPlay;
  }, [autoPlay]);

  // منطق الانتقال للفيديو التالي (تجريبي)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      if (autoNext) {
        // هنا منطق الانتقال للفيديو التالي (placeholder)
        alert('تشغيل الفيديو التالي!');
      }
    };
    v.addEventListener('ended', onEnded);
    return () => v.removeEventListener('ended', onEnded);
  }, [autoNext]);

  // نافذة الترجمة
  const [subtitleOpen, setSubtitleOpen] = useState(false);
  const [subtitleTab, setSubtitleTab] = useState<'advanced' | 'style' | 'subtitles'>('subtitles');
  const subtitleRef = useRef<HTMLDivElement>(null);

  // إغلاق نافذة الترجمة عند الضغط خارجها
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (subtitleRef.current && !subtitleRef.current.contains(e.target as Node)) {
        setSubtitleOpen(false);
      }
    }
    if (subtitleOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [subtitleOpen]);

  // قائمة الترجمات الفعلية من props
  const subtitlesList = [{ label: 'Off', url: '' }, ...subtitles];
  const [selectedSubtitle, setSelectedSubtitle] = useState(subtitlesList[0]);

  // أنماط خطوط الترجمة التجريبية
  const subtitleStyles = [
    { key: 'elegant', font: 'font-elegant', name: 'Sophisticated serif', desc: 'Elegant' },
    { key: 'modern', font: 'font-modern', name: 'Clean sans-serif', desc: 'Modern' },
    { key: 'luxury', font: 'font-luxury', name: 'Bold editorial style', desc: 'Luxury' },
    { key: 'classic', font: 'font-classic', name: 'Traditional book style', desc: 'Classic' },
    { key: 'vintage', font: 'font-vintage', name: 'Art deco aesthetic', desc: 'Vintage' },
    { key: 'literary', font: 'font-literary', name: 'Newspaper-inspired', desc: 'Literary' },
    { key: 'wisdom', font: 'font-wisdom', name: 'Philosophical tone', desc: 'Wisdom' },
    { key: 'romantic', font: 'font-romantic', name: 'Flowing script', desc: 'Romantic' },
    { key: 'delicate', font: 'font-delicate', name: 'Thin elegant script', desc: 'Delicate' },
    { key: 'parisian', font: 'font-parisian', name: 'French café style', desc: 'Parisian' },
    { key: 'majestic', font: 'font-majestic', name: 'Royal appearance', desc: 'Majestic' },
    { key: 'editorial', font: 'font-editorial', name: 'Magazine headlines', desc: 'Editorial' },
    { key: 'clean', font: 'font-clean', name: 'Minimalist style', desc: 'Clean' },
    { key: 'harmony', font: 'font-harmony', name: 'Balanced hybrid', desc: 'Harmony' },
    { key: 'contemporary', font: 'font-contemporary', name: 'Universal sans', desc: 'Contemporary' },
    { key: 'cursive', font: 'font-cursive', name: 'Formal script', desc: 'Cursive' },
    { key: 'glamour', font: 'font-glamour', name: 'Hollywood style', desc: 'Glamour' },
  ];
  const [selectedStyle, setSelectedStyle] = useState('elegant');

  // حالة إعدادات الترجمة المتقدمة
  const [subtitleSize, setSubtitleSize] = useState(100);
  const [subtitleColor, setSubtitleColor] = useState('#FFFFFF');
  const [subtitleBgOpacity, setSubtitleBgOpacity] = useState(70);
  const [subtitleFont, setSubtitleFont] = useState('Arial');
  const [subtitleWeight, setSubtitleWeight] = useState('normal');
  const [subtitleEdge, setSubtitleEdge] = useState('none');
  const [subtitlePosition, setSubtitlePosition] = useState(10);

  // منطق إغلاق نافذة السيرفرات عند تحريك الماوس أو فقدان التركيز
  useEffect(() => {
    if (!serverOpen) return;
    function handleClick(e: MouseEvent) {
      if (serverOpen && serverRef.current && !serverRef.current.contains(e.target as Node)) {
        setServerOpen(false);
      }
    }
    function handleScrollOrBlur() {
      setServerOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScrollOrBlur, true);
    window.addEventListener('blur', handleScrollOrBlur);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleScrollOrBlur, true);
      window.removeEventListener('blur', handleScrollOrBlur);
    };
  }, [serverOpen]);
  const serverRef = useRef<HTMLDivElement>(null);

  // Add HLS instance ref
  const hlsRef = useRef<Hls | null>(null);

  // Function to initialize HLS
  const initializeHls = (videoElement: HTMLVideoElement, source: string) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(source);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              // Cannot recover
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has built-in HLS support
      videoElement.src = source;
    }
  };

  // Update video source handling
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoSrc) return;

    if (videoSrc.includes('.m3u8')) {
      initializeHls(videoElement, videoSrc);
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      videoElement.src = videoSrc;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSrc]);

  // Clean up HLS on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // تعريف دوال إظهار/إخفاء عناصر التحكم
  const handleMouseMove = () => {
    setShowCenterControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (isPlaying) {
      hideTimeout.current = setTimeout(() => setShowCenterControls(false), 2500);
    }
  };
  const handleMouseLeave = () => {
    if (isPlaying) setShowCenterControls(false);
  };

  // تفعيل PiP
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!isPip) {
      try { await (video as any).requestPictureInPicture(); } catch {}
    } else {
      try { await (document as any).exitPictureInPicture(); } catch {}
    }
  };

  // مزامنة حالة ملء الشاشة
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ));
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    };
  }, []);

  // تفعيل ملء الشاشة
  const toggleFullscreen = () => {
    const el = playerRef.current;
    if (!el) return;

    try {
      if (!isFullscreen) {
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        } else if ((el as any).mozRequestFullScreen) {
          (el as any).mozRequestFullScreen();
        } else if ((el as any).msRequestFullscreen) {
          (el as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // إضافة حالة لتتبع وقت التشغيل
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // تحديث التوقيت عند تشغيل الفيديو
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // التحكم في شريط التقدم
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    const video = videoRef.current;
    if (!progressBar || !video) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  // تحديث دالة معالجة رابط الترجمة
  const processSubtitleUrl = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch subtitle: ${response.status}`);
      }

      const subtitleContent = await response.text();
      
      // تحويل SRT إلى VTT إذا لزم الأمر
      let processedContent = subtitleContent;
      if (!subtitleContent.trim().startsWith('WEBVTT')) {
        processedContent = `WEBVTT\n\n${subtitleContent.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')}`;
      }
      
      const blob = new Blob([processedContent], { type: 'text/vtt' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error processing subtitle URL:', error);
      return url; // إرجاع الرابط الأصلي في حالة الفشل
    }
  };

  // تحديث معالج النقر على الترجمة
  const handleSubtitleSelect = async (sub: SubtitleSource) => {
    console.log('Selecting subtitle:', sub);
    setSelectedSubtitle(sub);
    
    const video = videoRef.current;
    if (!video) return;

    // إزالة المسارات القديمة
    Array.from(video.textTracks).forEach(track => {
      track.mode = 'disabled';
    });

    // إزالة عناصر track القديمة
    const oldTracks = video.getElementsByTagName('track');
    while (oldTracks.length > 0) {
      video.removeChild(oldTracks[0]);
    }

    if (!sub.url || sub.label === 'Off') return;

    try {
      const processedUrl = await processSubtitleUrl(sub.url);
      console.log('Processed subtitle URL:', processedUrl);

      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = processedUrl;
      track.label = sub.label;
      track.srclang = sub.label.split(' ')[0].toLowerCase();
      track.default = true;

      video.appendChild(track);

      // تفعيل المسار بعد إضافته
      requestAnimationFrame(() => {
        if (video.textTracks.length > 0) {
          const newTrack = Array.from(video.textTracks).find(t => t.label === sub.label);
          if (newTrack) {
            newTrack.mode = 'showing';
          }
        }
      });
    } catch (error) {
      console.error('Error setting up subtitle:', error);
    }
  };

  // إضافة useEffect لمراقبة تغييرات الترجمة
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tracks = video.textTracks;
    Array.from(tracks).forEach(track => {
      track.mode = track.label === selectedSubtitle.label ? 'showing' : 'disabled';
    });
  }, [selectedSubtitle]);

  // تحديث زر اختيار الترجمة
  {subtitlesList.map((sub, i) => (
    <button
      key={sub.label + i}
      className={`w-full flex items-center px-3 py-2 hover:bg-green-950/50 rounded-md text-sm transition-all duration-100 ${selectedSubtitle.label === sub.label ? 'bg-gradient-to-tr from-green-600/30 border-green-600 shadow-lg shadow-green-700/60 border font-bold text-green-200' : 'text-white/90'}`}
      onClick={() => handleSubtitleSelect(sub)}
    >
      <span>{sub.label}</span>
      {selectedSubtitle.label === sub.label && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  ))}

  // تحديث تنسيق الترجمة
  const getSubtitleStyle = () => {
    const edgeStyles: Record<EdgeStyleType, string> = {
      'none': '',
      'shadow': '2px 2px 4px rgba(0,0,0,0.8)',
      'outline': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      'raised': '0 1px 1px rgba(0,0,0,0.5), 0 2px 2px rgba(0,0,0,0.5)',
      'depressed': '0 -1px 1px rgba(0,0,0,0.5), 0 -2px 2px rgba(0,0,0,0.5)'
    };

    // تعريف أنماط الخطوط
    const fontStyles: Record<string, string> = {
      'elegant': 'Georgia, serif',
      'modern': 'Arial, sans-serif',
      'luxury': 'Palatino, serif',
      'classic': 'Times New Roman, serif',
      'vintage': 'Garamond, serif',
      'literary': 'Bookman, serif',
      'wisdom': 'Baskerville, serif',
      'romantic': 'Lucida Calligraphy, cursive',
      'delicate': 'Century Gothic, sans-serif',
      'parisian': 'Didot, serif',
      'majestic': 'Trajan Pro, serif',
      'editorial': 'Helvetica Neue, sans-serif',
      'clean': 'Verdana, sans-serif',
      'harmony': 'Optima, sans-serif',
      'contemporary': 'Futura, sans-serif',
      'cursive': 'Brush Script MT, cursive',
      'glamour': 'Copperplate, serif'
    };

    const currentFontFamily = fontStyles[selectedStyle] || fontStyles['modern'];

    return `
      ::cue {
        color: ${subtitleColor};
        font-family: ${currentFontFamily};
        font-size: ${subtitleSize}%;
        font-weight: ${subtitleWeight};
        text-shadow: ${edgeStyles[subtitleEdge as EdgeStyleType]};
        line-height: 1.4;
        padding: 4px 8px;
        white-space: pre-line;
        background-color: transparent !important;
      }

      video::-webkit-media-text-track-container {
        bottom: ${subtitlePosition}px !important;
        pointer-events: none;
      }

      video::-webkit-media-text-track-background {
        background-color: transparent !important;
      }

      video::-webkit-media-text-track-display {
        padding: 8px;
      }

      video::cue-region {
        background-color: transparent !important;
      }
    `;
  };

  // تحديث useEffect لمراقبة تغييرات النمط
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = getSubtitleStyle();
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [subtitleColor, subtitleBgOpacity, subtitleFont, subtitleSize, subtitleWeight, subtitleEdge, subtitlePosition, selectedStyle]);

  // تحديث قائمة الخطوط
  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' }
  ];

  // تحديث قائمة الحواف
  const edgeOptions: Array<{ value: string; label: string }> = [
    { value: 'none', label: 'None' },
    { value: 'shadow', label: 'Shadow' },
    { value: 'outline', label: 'Outline' },
    { value: 'raised', label: 'Raised' },
    { value: 'depressed', label: 'Depressed' }
  ];

  // تحديث قائمة الألوان
  const colorOptions: Array<{ value: string; label: string }> = [
    { value: '#FFFFFF', label: 'White' },
    { value: '#FFFF00', label: 'Yellow' },
    { value: '#00FF00', label: 'Green' },
    { value: '#00FFFF', label: 'Cyan' },
    { value: '#FFA500', label: 'Orange' },
    { value: '#FF69B4', label: 'Pink' }
  ];

  // إضافة منطق البث
  useEffect(() => {
    // Load the Cast API script
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    script.async = true;
    document.body.appendChild(script);

    // Initialize Cast API when script loads
    (window as any).__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable && (window as any).chrome?.cast) {
        const castContext = (window as any).chrome.cast;
        
        const sessionRequest = new castContext.SessionRequest(
          castContext.media.DEFAULT_MEDIA_RECEIVER_APP_ID
        );
        
        const apiConfig = new castContext.ApiConfig(
          sessionRequest,
          () => {
            console.log('Cast session initialized');
            setCastAvailable(true);
          },
          (availability: boolean) => {
            console.log('Cast availability changed:', availability);
            setCastAvailable(availability);
          }
        );

        castContext.initialize(apiConfig, 
          () => {
            console.log('Cast API initialized successfully');
            setCastAvailable(true);
          },
          (error: Error) => {
            console.error('Cast API initialization error:', error);
            setCastAvailable(false);
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // دالة بدء البث
  const startCasting = async () => {
    if (!(window as any).chrome?.cast) return;
    
    try {
      const castContext = (window as any).chrome.cast;
      const session: any = await new Promise((resolve, reject) => {
        castContext.requestSession(resolve, reject);
      });

      if (session && videoRef.current) {
        const mediaInfo = new castContext.media.MediaInfo(videoSrc, 'video/mp4');
        mediaInfo.metadata = new castContext.media.GenericMediaMetadata();
        mediaInfo.metadata.title = mediaMeta?.title || 'Video';
        
        const request = new castContext.media.LoadRequest(mediaInfo);
        request.currentTime = videoRef.current.currentTime;
        
        await session.loadMedia(request);
        setIsCasting(true);
      }
    } catch (error) {
      console.error('Error starting cast:', error);
    }
  };

  // دالة إيقاف البث
  const stopCasting = () => {
    if (!(window as any).chrome?.cast) return;
    
    try {
      const castSession = (window as any).chrome.cast.getCurrentSession();
      if (castSession) {
        castSession.stop();
        setIsCasting(false);
      }
    } catch (error) {
      console.error('Error stopping cast:', error);
    }
  };

  return (
    <div
      ref={playerRef}
      className="relative w-full h-full bg-black rounded-2xl border border-green-700 overflow-hidden flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* إضافة زر البث في الزاوية العلوية */}
      {castAvailable && (
        <div className={`absolute top-2 right-2 z-30 transition-opacity duration-300 ${showCenterControls ? 'opacity-100' : 'opacity-0'}`}>
          <button
            className="transition delay-150 duration-300 ease-in-out icon group ring-media-focus relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
            onClick={isCasting ? stopCasting : startCasting}
            aria-label={isCasting ? "إيقاف البث" : "بدء البث"}
            type="button"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-7 h-7"
            >
              <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
              <line x1="2" y1="20" x2="2.01" y2="20"></line>
            </svg>
          </button>
        </div>
      )}

      {/* إضافة صورة الخلفية */}
      {(backdrop || poster) && !isPlaying && (
        <div 
          className="absolute inset-0 bg-cover bg-center z-10"
          style={{ 
            backgroundImage: `url(${backdrop || poster})`,
            filter: 'brightness(0.7)'
          }}
        />
      )}
      
      {/* الفيديو */}
      <video
        className="w-full h-full object-cover bg-black"
        style={{ 
          minHeight: 320,
          '--webkit-media-text-track-display': 'initial',
          '--webkit-media-text-track-background-color': 'rgba(0,0,0,0.5)',
        } as React.CSSProperties}
        ref={videoRef}
        crossOrigin="anonymous"
        playsInline
      >
        {selectedSubtitle && selectedSubtitle.url && selectedSubtitle.url !== '' && (
          <track
            kind="subtitles"
            src={selectedSubtitle.url}
            srcLang={selectedSubtitle.label}
            label={selectedSubtitle.label}
            default
          />
        )}
      </video>

      <style jsx global>{`
        /* تنسيق الترجمة */
        ::cue {
          color: white;
          font-family: Arial, sans-serif;
          font-size: 1.2em;
          line-height: 1.4;
          padding: 4px 8px;
          margin-bottom: 2px;
          text-shadow: 2px 2px 1px rgba(0, 0, 0, 0.8);
          white-space: pre-line;
          background: transparent !important;
        }

        video::-webkit-media-text-track-container {
          bottom: 10px !important;
          pointer-events: none;
        }

        video::-webkit-media-text-track-background {
          background: transparent !important;
        }

        video::-webkit-media-text-track-display {
          padding: 8px;
          margin-bottom: 2px;
          background: transparent !important;
        }

        video::cue-region {
          background: transparent !important;
        }
      `}</style>

      {/* أزرار التحكم المركزية */}
      {showCenterControls && (
        <div className="absolute inset-0 flex items-center justify-center gap-8 z-20">
          {/* زر التشغيل/الإيقاف */}
          <button
            className="transition delay-150 duration-300 mx-1 ease-in-out icon group ring-media-focus relative inline-flex h-14 w-14 md:h-20 md:w-20 cursor-pointer items-center justify-center rounded-full outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
            tabIndex={0}
            role="button"
            type="button"
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            aria-keyshortcuts="k Space"
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (isPlaying) {
                v.pause();
              } else {
                v.play().catch(error => {
                  console.error('Error playing video:', error);
                });
              }
            }}
          >
            {isPlaying ? (
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-11 h-11 md:w-16 md:h-16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-11 h-11 md:w-16 md:h-16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
            )}
          </button>
        </div>
      )}

      {/* شريط التحكمات السفلي */}
      <div 
        className={`absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2 flex flex-col z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showCenterControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* شريط التقدم */}
        <div className="flex items-center w-full mb-2">
          <span className="text-white font-mono text-xs mr-2">{formatTime(currentTime)}</span>
          <div 
            ref={progressBarRef}
            className="flex-1 h-1 bg-white/20 rounded-full relative cursor-pointer"
            onClick={handleProgressBarClick}
        >
          <div 
              className="absolute left-0 top-0 h-1 bg-white rounded-full" 
              style={{ width: `${(currentTime / duration) * 100}%` }} 
            />
          </div>
          <span className="text-white font-mono text-xs ml-2">{formatTime(duration)}</span>
        </div>
        {/* أزرار التحكم الجديدة */}
        <div className="-mt-0.5 flex w-full items-center px-2 pb-2" style={{ pointerEvents: 'auto' }}>
          {/* زر الصوت/كتم */}
          <button
            className="transition delay-150 duration-300 mx-1 ease-in-out icon group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
            onClick={() => {
              const v = videoRef.current;
              if (v) v.muted = !v.muted;
            }}
            aria-label={isMuted ? "إلغاء كتم" : "كتم"}
            type="button"
          >
            {isMuted ? (
              // أيقونة كتم
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-8 h-8" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2"/></svg>
            ) : (
              // أيقونة صوت
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-8 h-8" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><path d="M16 9a5 5 0 0 1 0 6"></path><path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path></svg>
            )}
          </button>
          {/* شريط الصوت */}
          <div className="volume-slider group relative mx-[7.5px] inline-flex h-10 w-full max-w-[80px] items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={e => {
                const v = videoRef.current;
                const val = Number(e.target.value);
                setVolume(val);
                if (v) {
                  v.volume = val;
                  v.muted = val === 0;
                }
              }}
              className="w-full h-[5px] bg-white/30 rounded-sm focus:outline-none volume-range"
          />
        </div>
          <span className="inline-block flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-sm font-medium text-white/70"><span></span></span>
          <div className="flex-1"></div>
          {/* ترجمة */}
          <div className="relative">
            <button
              className="transition delay-150 duration-300 mx-1 ease-in-out icon group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
              onClick={() => setSubtitleOpen(v => !v)}
              aria-label="Subtitles"
              type="button"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-8 h-8" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"></rect><path d="M7 15h4M15 15h2M7 11h2M13 11h4"></path></svg>
            </button>
            {/* نافذة الترجمة */}
            {subtitleOpen && (
              <div
                ref={subtitleRef}
                className="absolute left-1/2 bottom-16 z-[9999] min-w-[380px] max-w-[96%] w-auto max-h-[340px] rounded-xl bg-[#181A20] shadow-2xl border border-white/10 p-0.5 animate-fade-in overflow-hidden"
                style={{ transform: 'translateX(-50%)' }}
              >
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#23262F] text-green-400">
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"></rect><path d="M7 15h4M15 15h2M7 11h2M13 11h4"></path></svg>
                    </span>
                    <span className="font-bold text-white text-base">Select Subtitle</span>
                    <span className="ml-auto px-2 py-0.5 rounded-lg bg-green-600/90 text-white text-xs font-bold">{subtitlesList.length} Subtitles</span>
                  </div>
                  <div className="text-white/70 text-xs mb-2">Select your preferred Subtitle</div>
                  {/* Tabs */}
                  <div className="flex gap-1 mb-2">
                    <button onClick={() => setSubtitleTab('subtitles')} className={`px-2 py-1 rounded-md font-bold text-xs transition ${subtitleTab === 'subtitles' ? 'bg-green-600 text-white' : 'bg-[#23262F] text-green-200 hover:bg-green-900/60'}`}>Subtitles</button>
                    <button onClick={() => setSubtitleTab('style')} className={`px-2 py-1 rounded-md font-bold text-xs transition ${subtitleTab === 'style' ? 'bg-purple-700 text-white' : 'bg-[#23262F] text-purple-200 hover:bg-purple-900/60'}`}>Style</button>
                    <button onClick={() => setSubtitleTab('advanced')} className={`px-2 py-1 rounded-md font-bold text-xs transition ${subtitleTab === 'advanced' ? 'bg-blue-700 text-white' : 'bg-[#23262F] text-blue-200 hover:bg-blue-900/60'}`}>Advanced</button>
            </div>
                  {/* محتوى التبويبات */}
                  <div className="min-h-[120px]">
                    {subtitleTab === 'subtitles' && (
                      <div className="flex flex-col gap-1 p-1 max-h-[220px] overflow-y-auto pr-1 min-w-[340px] w-full">
                        {subtitlesList.map((sub, i) => (
                          <button
                            key={sub.label + i}
                            className={`w-full flex items-center px-3 py-2 hover:bg-green-950/50 rounded-md text-sm transition-all duration-100 ${selectedSubtitle.label === sub.label ? 'bg-gradient-to-tr from-green-600/30 border-green-600 shadow-lg shadow-green-700/60 border font-bold text-green-200' : 'text-white/90'}`}
                            onClick={() => handleSubtitleSelect(sub)}
                          >
                            <span>{sub.label}</span>
                            {selectedSubtitle.label === sub.label && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {subtitleTab === 'style' && (
                      <div className="flex flex-col gap-1 p-1 max-h-[220px] overflow-y-auto pr-1 min-w-[340px] w-full">
                        <div className="grid grid-cols-2 gap-2">
                          {subtitleStyles.map(style => (
                            <button
                              key={style.key}
                              className={`${style.font} relative rounded-md px-3 py-2 text-left border-2 transition-colors shadow-sm text-sm ${selectedStyle === style.key ? 'border-green-500 shadow-green-500/85 text-green-500 bg-zinc-900 hover:bg-zinc-800' : 'border-transparent text-white bg-zinc-900 hover:bg-zinc-800'}`}
                              onClick={() => setSelectedStyle(style.key)}
                            >
                              <div className="text-base text-center">{style.name}</div>
                              <div className="text-xs text-zinc-400 mt-1 text-center">{style.desc}</div>
                              {selectedStyle === style.key && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check absolute top-1 right-1 text-green-400"><path d="M20 6 9 17l-5-5"></path></svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {subtitleTab === 'advanced' && (
                      <div className="space-y-4 text-white max-w-md mx-auto p-2">
                        {/* حجم الترجمة */}
                        <div className="flex items-center gap-2"><span className="text-base font-medium">Subtitle Size</span></div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Small</span>
                          <div className="text-center text-green-400 font-medium">{subtitleSize}%</div>
                          <span>Large</span>
                        </div>
                        <div className="relative flex w-full items-center">
                  <input
                    type="range"
                            min={50}
                            max={130}
                            step={1}
                            value={subtitleSize}
                            onChange={e => setSubtitleSize(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full bg-primary/20 appearance-none focus:outline-none"
                            style={{ accentColor: '#22c55e' }}
                          />
                        </div>
                        <div className="flex justify-between gap-1">
                          <button onClick={() => setSubtitleSize(70)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors bg-zinc-800 text-white shadow-sm hover:bg-zinc-700 h-7 px-2 py-1 w-full">Small</button>
                          <button onClick={() => setSubtitleSize(100)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors bg-zinc-800 text-white shadow-sm hover:bg-zinc-700 h-7 px-2 py-1 w-full">Default</button>
                          <button onClick={() => setSubtitleSize(130)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors bg-zinc-800 text-white shadow-sm hover:bg-zinc-700 h-7 px-2 py-1 w-full">Large</button>
                        </div>
                        {/* لون الترجمة */}
                        <div className="flex items-center gap-2 mt-4"><span className="text-lg font-medium">Subtitle Color</span></div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 w-full justify-center mt-1">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              title={color.value}
                              className="w-[21px] h-[21px] rounded-[4px] flex items-center justify-center border-2 transition-all duration-100 focus:outline-none"
                    style={{
                                background: color.value,
                                boxShadow: subtitleColor === color.value ? `${color.value} 0px 0px 0px 2px` : undefined,
                                borderColor: subtitleColor === color.value ? '#22c55e' : 'transparent',
                                marginRight: '0px', marginBottom: '5px', padding: '3px',
                              }}
                              onClick={() => setSubtitleColor(color.value)}
                            >
                              {subtitleColor === color.value && (
                                <div style={{height: '7px', width: '7px', borderRadius: '50%', background: '#fff'}}></div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              )}
            </div>
          {/* زر السيرفرات */}
          <div className="relative">
            <button
              className="transition delay-150 duration-300 mx-1 ease-in-out icon group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
              onClick={() => setServerOpen(v => !v)}
              aria-label="Select Server"
              type="button"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-8 h-8" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M2 12h20"></path>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            </button>
            {serverOpen && (
              <div
                ref={serverRef}
                className="absolute bottom-14 right-0 z-[9999] w-[320px] max-w-[98vw] rounded-xl bg-black/95 shadow-2xl border border-white/10 animate-fade-in font-sans text-[15px] font-medium backdrop-blur-sm"
                role="menu"
                tabIndex={-1}
              >
                {/* Header - Fixed */}
                <div className="sticky top-0 z-10 bg-black/95 p-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 p-1.5 rounded-lg bg-gradient-to-l from-green-400/25 via-slate-100/25 to-green-400/25 flex justify-center items-center">
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full" height="1em" width="1em">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="M2 12h20"></path>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 mx-2">
                      <h2 className="text-white font-bold text-base">Select Server</h2>
                      <p className="text-white/60 text-xs">Choose your preferred server</p>
                    </div>
                    <div className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold bg-green-600/20 border-green-500/20 text-green-400">
                      {serversList.length} servers
          </div>
        </div>
      </div>

                {/* Scrollable Content */}
                <div className="p-3 max-h-[240px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                  <div className="grid grid-cols-2 gap-2">
                    {serversList.map((srv) => (
        <button
                        key={srv.label}
                        onClick={() => {
                          if (srv.available) {
                            setSelectedServer(srv.label);
                            setServerOpen(false);
                            const qualities = getServerQualities(srv.label);
                            if (qualities.length > 0) {
                              setSelectedQuality(qualities[0].value);
                              setVideoSrc(qualities[0].url);
                            }
                          }
                        }}
                        disabled={!srv.available}
                        className={`relative flex flex-col items-center p-2 rounded-lg border transition-all duration-200
                          ${selectedServer === srv.label 
                            ? 'bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/50 shadow-lg shadow-green-500/20' 
                            : 'bg-[#23262F] border-transparent hover:border-gray-600'
                          }
                          ${!srv.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          min-h-[90px]
                        `}
                      >
                        <div className="text-2xl mb-1">{srv.icon}</div>
                        <div className="text-center w-full">
                          <div className="font-bold text-white text-sm mb-0.5">{srv.label}</div>
                          <div className="text-[10px] text-gray-400 mb-1">
                            {srv.available ? `${srv.qualities.length} qualities` : 'No sources'}
                          </div>
                          <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            srv.available
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {srv.available ? 'Available' : 'Not Available'}
                          </div>
                        </div>
                        {selectedServer === srv.label && (
                          <div className="absolute top-1 right-1">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
        </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
      </div>
          {/* PiP */}
          <button
            className="transition delay-150 duration-300 mx-1 ease-in-out icon group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
            onClick={togglePiP}
            aria-label="وضع نافذة ضمن نافذة"
            type="button"
          >
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-8 h-8" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
          </button>
          {/* إعدادات */}
          <div className="relative">
            <button
              className="transition delay-150 duration-300 mx-1 ease-in-out icon group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="Settings"
              type="button"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 transform transition-transform duration-200 ease-out" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                <path d="M12 2v2"></path>
                <path d="M12 22v-2"></path>
                <path d="m17 20.66-1-1.73"></path>
                <path d="M11 10.27 7 3.34"></path>
                <path d="m20.66 17-1.73-1"></path>
                <path d="m3.34 7 1.73 1"></path>
                <path d="M14 12h8"></path>
                <path d="M2 12h2"></path>
                <path d="m20.66 7-1.73 1"></path>
                <path d="m3.34 17 1.73-1"></path>
                <path d="m17 3.34-1 1.73"></path>
                <path d="m11 13.73-4 6.93"></path>
              </svg>
              </button>
            {/* نافذة الإعدادات */}
            {settingsOpen && (
              <div ref={settingsRef} className="absolute bottom-12 right-0 z-[9999] w-80 max-w-[90vw] rounded-xl bg-[#181A20] shadow-2xl border border-white/10 p-0.5 animate-fade-in">
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-[#23262F] text-green-400">
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path></svg>
                    </span>
                    <span className="font-bold text-white text-lg">Settings</span>
                  </div>
                  {/* Quality */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#23262F] text-blue-300">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"></rect><path d="M7 15h4M15 15h2M7 11h2M13 11h4"></path></svg>
                      </span>
                      <span className="font-semibold text-white">Quality</span>
                      <span className="ml-auto text-xs text-white/60">Current: {selectedQuality}p</span>
            </div>
                    <button
                      className={`mt-2 w-full flex items-center justify-center rounded-lg bg-[#23262F] text-green-400 font-bold text-lg py-2 transition hover:bg-[#23262F]/80 focus:outline-none border ${showQualityList ? 'border-green-500/60' : 'border-green-500/20'} shadow-inner`}
                      onClick={() => setShowQualityList(v => !v)}
                    >
                      {selectedQuality}p
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showQualityList && (
                      <div className="mt-2 bg-[#23262F] rounded-lg border border-green-500/20 shadow-lg">
                        {currentServerQualities.map(q => (
                          <button
                            key={q.value}
                            className={`w-full text-left px-4 py-2 text-white hover:bg-green-500/10 ${selectedQuality === q.value ? 'text-green-400 font-bold' : ''}`}
                  onClick={() => {
                              setSelectedQuality(q.value);
                              const currentTime = videoRef.current?.currentTime || 0;
                              setVideoSrc(q.url);
                              setShowQualityList(false);
                              setTimeout(() => {
                                if (videoRef.current) {
                                  videoRef.current.currentTime = currentTime;
                                  videoRef.current.play();
                                }
                              }, 100);
                            }}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* AutoPlay */}
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#23262F] text-blue-300">
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-white">AutoPlay</div>
                      <div className="text-xs text-white/50">Automatically play video</div>
                    </div>
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoPlay} onChange={e => setAutoPlay(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all ${autoPlay ? 'translate-x-5' : ''}`}></div>
                    </label>
                  </div>
                  {/* Auto Next Video */}
                  <div className="mb-2 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#23262F] text-blue-300">
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                    </span>
                  <div className="flex-1">
                      <div className="font-semibold text-white">Auto Next Video</div>
                      <div className="text-xs text-white/50">Automatically play next video</div>
                    </div>
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoNext} onChange={e => setAutoNext(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all ${autoNext ? 'translate-x-5' : ''}`}></div>
                    </label>
                  </div>
          </div>
        </div>
      )}
        </div>
          {/* ملء الشاشة */}
          <button
            className="transition delay-150 duration-300 mx-1 ease-in-out icon group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"}
            type="button"
          >
            {isFullscreen ? (
              // أيقونة خروج من ملء الشاشة
              <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 15 15" className="w-8 h-8 stroke-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6 6.5C6 6.77614 5.77614 7 5.5 7H3V9.5C3 9.77614 2.77614 10 2.5 10C2.22386 10 2 9.77614 2 9.5V5.5C2 5.22386 2.22386 5 2.5 5H5.5C5.77614 5 6 5.22386 6 5.5C6 5.77614 5.77614 6 5.5 6H3V6.5ZM13 6.5C13 6.77614 12.7761 7 12.5 7H10V5.5C10 5.22386 10.2239 5 10.5 5H13.5C13.7761 5 14 5.22386 14 5.5V9.5C14 9.77614 13.7761 10 13.5 10C13.2239 10 13 9.77614 13 9.5V7H12.5C12.2239 7 12 6.77614 12 6.5ZM6 12.5C6 12.2239 5.77614 12 5.5 12H3V10.5C3 10.2239 2.77614 10 2.5 10C2.22386 10 2 10.2239 2 10.5V14.5C2 14.7761 2.22386 15 2.5 15H5.5C5.77614 15 6 14.7761 6 14.5C6 14.2239 5.77614 14 5.5 14H3V12.5ZM13 12.5C13 12.2239 12.7761 12 12.5 12H10V14.5C10 14.7761 10.2239 15 10.5 15H13.5C13.7761 15 14 14.7761 14 14.5V10.5C14 10.2239 13.7761 10 13.5 10C13.2239 10 13 10.2239 13 10.5V12.5Z" fill="currentColor"></path>
              </svg>
            ) : (
              // أيقونة ملء الشاشة
              <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 15 15" className="w-8 h-8 stroke-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z" fill="currentColor"></path>
            </svg>
            )}
          </button>
        </div>
      </div>
      {/* أزرار التحكم في منتصف المشغل */}
      {videoSrc && showCenterControls && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 media-buffering:hidden pointer-events-auto transition-opacity duration-200">
          <div className="flex gap-4 md:gap-8 items-center">
            {/* زر التشغيل/إيقاف مؤقت */}
            <button
              className="transition delay-150 duration-300 mx-1 ease-in-out icon group ring-media-focus relative inline-flex h-14 w-14 md:h-20 md:w-20 cursor-pointer items-center justify-center rounded-full outline-none ring-inset hover:scale-110 data-[focus]:ring-4"
              tabIndex={0}
              role="button"
              type="button"
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              aria-keyshortcuts="k Space"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                if (isPlaying) v.pause(); else v.play();
              }}
            >
              {isPlaying ? (
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-11 h-11 md:w-16 md:h-16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="icon w-11 h-11 md:w-16 md:h-16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 