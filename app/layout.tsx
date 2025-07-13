import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VidJoy Clone - Advanced Video Streaming Platform',
  description: 'Best streaming API you could ever dream of - 115k+ Movies, 79k+ Episodes, 5.3k+ Animes',
  keywords: 'streaming, video, movies, tv shows, anime, embed player',
  authors: [{ name: 'VidJoy Clone Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script src="https://cdn.lordicon.com/lordicon.js"></script>
      </head>
      <body className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
        <div className="relative">
          {/* Background Pattern */}
          <div className="fixed inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
} 