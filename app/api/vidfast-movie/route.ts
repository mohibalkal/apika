import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
import { extractMovieLinks } from '@/lib/vidfast';

// تعريف مفتاح TMDB API
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGY1YjE5NjI2MmMzMzFlMmUyOWJjYmU2NTJmZmRiYSIsIm5iZiI6MTcyMzc1OTU0Mi45NzgsInN1YiI6IjY2YmU3YmI2MmJlNTQ2ZDE4ZmMzOGMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.mynmNrgUkgSbhSG-v2wGgn2IEOE6vNQx58qEv9kP4V8';

export async function GET(req: NextRequest) {
  console.log('Received movie request');
  
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      console.log('Missing movie ID');
      return new Response('Missing movie ID', { status: 400 });
    }

    console.log(`Processing movie ID: ${id}`);
    const movieUrl = `https://vidfast.pro/movie/${id}`;
    console.log(`Fetching from URL: ${movieUrl}`);
    
    // جلب معلومات الفيلم من TMDb
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tmdbRes.ok) {
      throw new Error('Failed to fetch movie info from TMDb');
    }

    const tmdbData = await tmdbRes.json();
    const posterPath = tmdbData.poster_path;
    const backdropPath = tmdbData.backdrop_path;
    
    const data = await extractMovieLinks(movieUrl);
    console.log(`Successfully extracted links for movie ${id}`);

    // إضافة معلومات الفيلم للرد
    const response = {
      ...data,
      title: tmdbData.title,
      overview: tmdbData.overview,
      poster: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : undefined,
      backdrop: backdropPath ? `https://image.tmdb.org/t/p/original${backdropPath}` : undefined
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error processing movie request:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch movie',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 