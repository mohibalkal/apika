import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
import { extractSeriesLinks } from '@/lib/vidfast';

// تعريف مفتاح TMDB API
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGY1YjE5NjI2MmMzMzFlMmUyOWJjYmU2NTJmZmRiYSIsIm5iZiI6MTcyMzc1OTU0Mi45NzgsInN1YiI6IjY2YmU3YmI2MmJlNTQ2ZDE4ZmMzOGMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.mynmNrgUkgSbhSG-v2wGgn2IEOE6vNQx58qEv9kP4V8';

export async function GET(req: NextRequest) {
  console.log('Received series request');
  
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const season = searchParams.get('season');
    const episode = searchParams.get('episode');
    
    if (!id || !season || !episode) {
      console.log('Missing required parameters');
      return new Response('Missing required parameters', { status: 400 });
    }

    console.log(`Processing series - ID: ${id}, Season: ${season}, Episode: ${episode}`);
    const seriesUrl = `https://vidfast.pro/tv/${id}/${season}/${episode}`;
    console.log(`Fetching from URL: ${seriesUrl}`);
    
    // جلب معلومات المسلسل من TMDb
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/tv/${id}`, {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tmdbRes.ok) {
      throw new Error('Failed to fetch series info from TMDb');
    }

    const tmdbData = await tmdbRes.json();
    const posterPath = tmdbData.poster_path;
    const backdropPath = tmdbData.backdrop_path;
    
    // جلب معلومات الحلقة
    const episodeRes = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${season}/episode/${episode}`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let episodeData = null;
    if (episodeRes.ok) {
      episodeData = await episodeRes.json();
    }
    
    const data = await extractSeriesLinks(id, parseInt(season), parseInt(episode));
    console.log(`Successfully extracted links for series ${id} S${season}E${episode}`);

    // إضافة معلومات المسلسل والحلقة للرد
    const response = {
      ...data,
      title: tmdbData.name,
      series_name: tmdbData.name,
      overview: tmdbData.overview,
      episode_name: episodeData?.name,
      episode_overview: episodeData?.overview,
      poster: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : undefined,
      backdrop: backdropPath ? `https://image.tmdb.org/t/p/original${backdropPath}` : undefined,
      still: episodeData?.still_path ? `https://image.tmdb.org/t/p/original${episodeData.still_path}` : undefined
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error processing series request:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch series',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 