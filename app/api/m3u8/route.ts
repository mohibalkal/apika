import { NextRequest } from 'next/server';

// API Route: /api/m3u8?b64=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const b64 = searchParams.get('b64');
  if (!b64) {
    return new Response('Missing b64 parameter', { status: 400 });
  }
  try {
    const m3u8 = Buffer.from(b64, 'base64').toString('utf-8');
    return new Response(m3u8, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new Response('Invalid base64', { status: 400 });
  }
}
