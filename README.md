# VidJoy Embed API - Video Embed Platform

A modern video embed API platform built with Next.js, featuring customizable embed players for movies, TV shows, and anime. This platform allows you to easily embed video players on your website with full customization options and watch progress tracking, similar to [vidjoy.pro](https://vidjoy.pro/embed/doc).

## 🚀 Features

### Core Features
- **Embed Video Players** for easy website integration
- **Watch Progress Tracking** with localStorage and postMessage
- **Customizable Player** with color themes and parameters
- **Ad-free Experience** with customizable badges
- **Responsive Design** for all devices
- **Cross-origin Communication** via postMessage API

### Content Support
- **Movies** via TMDB ID integration
- **TV Shows** via TMDB ID with season/episode support
- **Anime** via MyAnimeList ID with sub/dub support

### Embed Features
- **Simple iframe Integration** with customizable parameters
- **Color Customization** (primary, secondary, icon colors)
- **Player Controls** (autoplay, title, poster, next episode)
- **Event Listeners** for player interactions
- **Progress Tracking** with detailed watch history
- **Fallback Support** for anime audio types

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Video**: HLS.js, HTML5 Video API
- **State Management**: Zustand
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Major Mono Display, Iceberg, Langar, Playfair Display)
- **Package Manager**: pnpm
- **Containerization**: Docker, Docker Compose
- **Development**: ESLint, TypeScript, PostCSS
- **Build Tools**: Next.js, pnpm, Docker
- **Performance**: HLS.js, Next.js Image Optimization

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Docker (optional, for containerization)
- Git
- Modern web browser
- At least 4GB RAM (for development)

### Install pnpm (if not installed)
```bash
npm install -g pnpm
```

### Install Docker (optional)
```bash
# For Windows/macOS: Download from https://www.docker.com/
# For Linux:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Verify Installation
```bash
# Check Node.js version
node --version

# Check pnpm version
pnpm --version

# Check Docker version (if installed)
docker --version

# Check Git version
git --version

# Check available memory
node -e "console.log('Available memory:', require('os').freemem() / 1024 / 1024 / 1024, 'GB')"
```

1. **Clone the repository**
```bash
git clone <repository-url>
cd vidjoy-clone
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Run the development server**
```bash
pnpm dev
```

5. **Open your browser**
```
http://localhost:3000
```

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm clean        # Clean build files
pnpm type-check   # Run TypeScript type checking
pnpm docker:dev   # Run with Docker Compose (dev)
pnpm docker:prod  # Run with Docker Compose (prod)
pnpm audit        # Security audit
pnpm update       # Update dependencies
pnpm check        # Run all checks (lint + type-check + audit)
pnpm install      # Install dependencies
pnpm why <pkg>    # Show why a package is installed
```

## 🔧 Configuration

### Environment Variables
```env
# TMDB API (for movies and TV shows)
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3

# MyAnimeList API (for anime)
MAL_API_KEY=your_mal_api_key
MAL_BASE_URL=https://api.myanimelist.net/v2

# Video Sources (configure your video sources)
VIDEO_SOURCE_1=https://your-video-source.com
VIDEO_SOURCE_2=https://backup-video-source.com
```

### pnpm Configuration (.npmrc)
```ini
# Enable faster installation
prefer-offline=true
auto-install-peers=true

# Use the latest version of packages
latest-version=false

# Enable strict peer dependencies
strict-peer-dependencies=false

# Use the fastest registry
registry=https://registry.npmjs.org/

# Enable workspace features
shamefully-hoist=true

# Store settings
store-dir=.pnpm-store
```

### TypeScript Configuration
The project uses TypeScript with strict mode enabled. See `tsconfig.json` for configuration details.

### Tailwind CSS Configuration
Custom styling with Tailwind CSS. See `tailwind.config.js` for theme customization.

### Next.js Configuration
Optimized Next.js setup with custom headers for embed functionality. See `next.config.js` for details.

### PostCSS Configuration
PostCSS setup for Tailwind CSS processing. See `postcss.config.js` for details.

### Git Configuration
Recommended Git hooks and ignore patterns. See `.gitignore` for details.

## 📖 API Documentation

### Embed Movies
```html
<!-- Basic movie embed -->
<iframe src="http://localhost:3000/embed/movie/786892" 
        frameborder="0" 
        scrolling="no" 
        allowfullscreen>
</iframe>

<!-- With customization -->
<iframe src="http://localhost:3000/embed/movie/786892?primary=6FAC8A&secondary=4ECDC4&icon=76F2B4&autoplay=true&title=true&adFree=true" 
        frameborder="0" 
        scrolling="no" 
        allowfullscreen>
</iframe>
```

### Embed TV Shows
```html
<!-- Basic TV show embed -->
<iframe src="http://localhost:3000/embed/tv/94997/1/1" 
        scrolling="no" 
        frameborder="0" 
        allowfullscreen>
</iframe>

<!-- With customization -->
<iframe src="http://localhost:3000/embed/tv/94997/1/1?primary=FF6B6B&autoplay=true&next=true" 
        scrolling="no" 
        frameborder="0" 
        allowfullscreen>
</iframe>
```

### Embed Anime
```html
<!-- Basic anime embed -->
<iframe src="http://localhost:3000/embed/anime/5/1/sub" 
        scrolling="no" 
        frameborder="0" 
        allowfullscreen>
</iframe>

<!-- With fallback -->
<iframe src="http://localhost:3000/embed/anime/5/1/sub?fallback=true" 
        scrolling="no" 
        frameborder="0" 
        allowfullscreen>
</iframe>
```

### Customization Parameters
| Parameter | Description | Example |
|-----------|-------------|---------|
| `primary` | Primary color (hex without #) | `6FAC8A` |
| `secondary` | Secondary color (hex without #) | `4ECDC4` |
| `icon` | Icon color (hex without #) | `76F2B4` |
| `autoplay` | Auto-play video | `true` |
| `title` | Show title | `true` |
| `poster` | Show poster | `true` |
| `next` | Show next episode button | `true` |
| `adFree` | Ad-free mode | `true` |
| `fallback` | Force fallback for anime | `true` |

### Event Listeners
```javascript
// Listen for watch progress updates
window.addEventListener('message', (event) => {
  if (event.origin === 'http://localhost:3000' && event.data.type === 'MEDIA_DATA') {
    console.log('Watch progress updated:', event.data);
  }
});

// Listen for player events
window.addEventListener('message', (event) => {
  if (event.origin === 'http://localhost:3000' && event.data?.type === 'PLAYER_EVENT') {
    const { event: eventType, currentTime, duration } = event.data.data;
    console.log(`Player ${eventType} at ${currentTime} of ${duration}s`);
  }
});
```

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd vidjoy-clone
pnpm install
cp env.example .env.local
pnpm dev
```

### Alternative Setup
```bash
# Using Docker
git clone <repository-url>
cd vidjoy-clone
pnpm docker:dev

# Using npm (not recommended)
git clone <repository-url>
cd vidjoy-clone
npm install
npm run dev
```

### Embed Movies
```
https://your-domain.com/embed/movie/{tmdbId}
```

**Example:**
```html
<iframe src="https://your-domain.com/embed/movie/786892" 
        frameborder="0" 
        scrolling="no" 
        allowfullscreen>
</iframe>
```

### Embed TV Shows
```
https://your-domain.com/embed/tv/{tmdbId}/{season}/{episode}
```

**Example:**
```html
<iframe src="https://your-domain.com/embed/tv/94997/1/1" 
        scrolling="no" 
        frameborder="0" 
        allowfullscreen>
</iframe>
```

### Embed Anime
```
https://your-domain.com/embed/anime/{malId}/{episode}/{type}
```

**Example:**
```html
<iframe src="https://your-domain.com/embed/anime/5/1/sub" 
        scrolling="no" 
        frameborder="0" 
        allowfullscreen>
</iframe>
```

## 🎨 Customization Parameters

### Colors
- `primary` - Primary color (hex without #)
- `secondary` - Secondary color (hex without #)
- `icon` - Icon color (hex without #)

### Options
- `autoplay` - Auto-play video (true/false)
- `title` - Show title (true/false)
- `poster` - Show poster (true/false)
- `next` - Show next episode button (true/false)
- `adFree` - Ad-free mode (true/false)

### Example with Parameters
```
https://your-domain.com/embed/movie/786892?primary=6FAC8A&secondary=6FAC8A&icon=76F2B4&autoplay=true&title=true&poster=true&adFree=true
```

### Development with pnpm
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run with Docker
pnpm docker:dev

# Run security audit
pnpm audit

# Update dependencies
pnpm update

# Run all checks
pnpm check
```

## 📊 Watch Progress System

### Data Structure
```typescript
interface WatchProgress {
  last_updated: number;
  id: string;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  backdrop_path: string;
  progress: {
    watched: number;
    duration: number;
    last_updated: number;
  };
  last_season_watched?: string;
  last_episode_watched?: string;
  show_progress?: {
    [key: string]: {
      season: string;
      episode: string;
      progress: {
        watched: number;
        duration: number;
      };
    };
  };
}
```

### Event Listeners
```javascript
// Listen for media data updates
window.addEventListener('message', (event) => {
  if (event.origin === 'https://your-domain.com' && event.data.type === 'MEDIA_DATA') {
    console.log('Watch progress updated:', event.data);
  }
});

// Listen for player events
window.addEventListener('message', (event) => {
  if (event.origin === 'https://your-domain.com' && event.data?.type === 'PLAYER_EVENT') {
    const { event: eventType, currentTime, duration } = event.data.data;
    console.log(`Player ${eventType} at ${currentTime} of ${duration}s`);
  }
});
```

### Development Setup
```bash
# Install with pnpm
pnpm install

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Clean build files
pnpm clean

# Run all checks
pnpm check

# Development workflow
pnpm dev          # Start development
pnpm check        # Run checks before commit
pnpm build        # Build for testing
pnpm docker:prod  # Test production build
```

## 🏗️ Project Structure

```
vidjoy-clone/
├── app/                    # Next.js app directory
│   ├── embed/             # Embed pages
│   │   ├── movie/[id]/    # Movie embed routes
│   │   └── tv/[id]/[season]/[episode]/  # TV embed routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   └── watchProgress.ts   # Watch progress management
├── components/            # Reusable components
│   └── VideoPlayer.tsx    # Video player component
├── public/                # Static assets
├── package.json           # Project configuration
├── pnpm-lock.yaml         # pnpm lock file
├── .npmrc                 # pnpm configuration
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── .dockerignore          # Docker ignore rules
├── tailwind.config.js     # Tailwind CSS config
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript config
├── postcss.config.js      # PostCSS config
├── .gitignore             # Git ignore rules
├── env.example            # Environment variables example
└── README.md              # Project documentation
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with `pnpm build` and `pnpm start`

### Netlify
1. Connect your GitHub repository
2. Set build command: `pnpm build`
3. Set publish directory: `.next`

### Other Platforms
```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

### Self-hosted
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build for production
pnpm build

# Start production server
pnpm start

# Or use Docker
pnpm docker:prod

# Production workflow
pnpm install --frozen-lockfile  # Install exact versions
pnpm build                      # Build application
pnpm start                      # Start server
```

### Docker (with pnpm)
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in development mode
docker-compose --profile dev up --build

# Build Docker image
docker build -t vidjoy-clone .

# Run Docker container
docker run -p 3000:3000 vidjoy-clone
```

```dockerfile
# Use pnpm in Docker
FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 🔒 Security

- **CORS Configuration** for embed functionality
- **X-Frame-Options** headers for iframe embedding
- **Content Security Policy** for secure embedding
- **Input Validation** for all parameters
- **Secure Dependencies** with pnpm's strict dependency resolution
- **Audit Support** with `pnpm audit`
- **Container Security** with Docker best practices
- **Environment Variable Protection** with proper .env handling

## 📈 Performance

- **Lazy Loading** for video components
- **Image Optimization** with Next.js
- **Code Splitting** for better load times
- **HLS Adaptive Streaming** for optimal quality
- **Fast Package Management** with pnpm
- **Efficient Dependency Resolution** with pnpm's symlink approach
- **Containerized Deployment** for consistent environments
- **Multi-stage Docker builds** for optimized images
- **Caching Strategies** with pnpm store
- **Build Optimization** with Next.js and pnpm

## 🚀 Why pnpm?

This project uses **pnpm** as the package manager for several benefits:

- **Faster Installation**: pnpm is significantly faster than npm and yarn
- **Disk Space Efficiency**: Uses symlinks to avoid duplicating packages
- **Strict Dependencies**: Prevents phantom dependencies
- **Workspace Support**: Better monorepo support
- **Security**: More secure dependency resolution
- **Docker Integration**: Better Docker builds with `--frozen-lockfile`
- **CI/CD Friendly**: Consistent installations across environments
- **Lock File Integrity**: Ensures reproducible builds
- **Peer Dependency Handling**: Better peer dependency resolution

### pnpm Commands
```bash
pnpm add <package>        # Add a dependency
pnpm add -D <package>     # Add a dev dependency
pnpm remove <package>     # Remove a dependency
pnpm update               # Update all dependencies
pnpm audit                # Security audit
pnpm store prune          # Clean unused packages
pnpm install --frozen-lockfile  # Install with exact versions
pnpm why <package>        # Show why a package is installed
pnpm list                 # List installed packages
pnpm run <script>         # Run a script
pnpm exec <command>       # Execute a command
pnpm publish              # Publish a package
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Use pnpm for package management
- Follow TypeScript best practices
- Add proper documentation
- Test with Docker if applicable
- Use `pnpm install --frozen-lockfile` in CI/CD
- Keep pnpm-lock.yaml updated
- Run `pnpm check` before committing
- Use conventional commit messages
- Follow the existing code style
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-party Licenses
- pnpm: MIT License
- Docker: Apache License 2.0
- Next.js: MIT License
- HLS.js: Apache License 2.0
- Tailwind CSS: MIT License
- Framer Motion: MIT License
- Lucide React: MIT License
- Zustand: MIT License
- React: MIT License

## 🙏 Acknowledgments

- Inspired by [vidjoy.pro](https://vidjoy.pro/embed/doc)
- Built with Next.js and React
- Video streaming powered by HLS.js
- Icons by Lucide React
- Package management by pnpm
- Containerization with Docker
- Styling with Tailwind CSS
- Animations with Framer Motion
- TypeScript for type safety
- ESLint for code quality
- State management with Zustand
- Modern web development practices

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples
- pnpm documentation: https://pnpm.io/
- Docker documentation: https://docs.docker.com/
- Next.js documentation: https://nextjs.org/docs
- Tailwind CSS documentation: https://tailwindcss.com/docs
- TypeScript documentation: https://www.typescriptlang.org/docs/
- HLS.js documentation: https://github.com/video-dev/hls.js/
- Zustand documentation: https://github.com/pmndrs/zustand
- Framer Motion documentation: https://www.framer.com/motion/

---

**Built with ❤️ using Next.js, pnpm, Docker, TypeScript, Tailwind CSS, and modern web technologies** 