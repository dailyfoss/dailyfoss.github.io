# Daily FOSS

> Discover, explore, and deploy open-source applications with ease

A modern, comprehensive platform for browsing and deploying 1000+ self-hosted applications and open-source tools. Built with Next.js, featuring real-time community insights, advanced filtering, and detailed deployment guides.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 🔍 Discovery & Search
- **Smart Search** - Fuzzy search with keyboard shortcuts (press `/` to focus)
- **Advanced Filtering** - Filter by platform, deployment method, hosting type, interface, community integrations, and activity status
- **Quick Filters** - One-click filters for Desktop, Mobile, Web App, and Browser Extensions
- **Category Browsing** - Organized by use case with 50+ categories

### � Coimmunity Insights
- **Real-time GitHub Stats** - Contributors, commits this year, open/closed issues, releases
- **Repository Status Indicators** - Visual badges showing project activity:
  - 🟢 Active (updated within 30 days)
  - 🟡 Regular (updated within 6 months)
  - 🟠 Occasional (updated within 1 year)
  - ant (no updates in over 1 year)
  - 📦 Archread-only, no longer maintained)
- **Trending This Month** - Real-time visitor tracking with Plausible Analytics
- **Popular Scripts** - Ranked by GitHub stars and deployment versatility

### 🤝 Community Integrations
- **Proxmox VE Support** - Automatic detection of 303+ apps with Proxmox community scripts
- **YunoHost Support** - Automatic detection of 412+ apps with YunoHost packages
- **Dual Platform Support** - 177 apps available on both platforms
- **Integration Filtering** - Filter apps by community platform support

### 🎨 User Experience
- **Responsive Design** - Mobile-first UI with smooth animations and transitions
- **Dark/Light Mode** - Theme support with system preference detection
- **Keyboard Navigation** - Full accessibility with keyboard shortcuts
- **Tooltips & Hints** - Contextual information on hover
- **NEW Badges** - Highlight recently added apps (within 7 days)

### 📈 Rich Metadata
- **Version Tracking** - Latest release versions with relative timestamps
- **License Information** - SPDX license identifiers
- **Star Counts** - Formatted GitHub star counts (e.g., 3.5k, 1.2m)
- **Release Dates** - Last release and commit timestamps
- **Platform Support** - Desktop (Linux, Windows, macOS), Mobile (Android, iOS), Web, Browser Extensions
- **Deployment Methods** - Docker, Docker Compose, Kubernetes, Helm, Terraform, Scripts
- **Hosting Options** - Self-hosted, SaaS, Managed Cloud
- **Interface Types** - CLI, TUI, GUI, Web UI, API

### ⚡ Performance
- **Static Site Generation** - Pre-rendered pages for instant loading
- **Optimized Images** - Automatic image optimization with Next.js
- **Code Splitting** - Lazy loading for optimal bundle sizes
- **Edge Caching** - CDN distribution via GitHub Pages

### ♿ Accessibility
- **WCAG Compliant** - Meets accessibility standards
- **Screen Reader Support** - Semantic HTML and ARIA labels
- **Keyboard Navigation** - Full keyboard support
- **Focus Management** - Clear focus indicators

## 🛠️ Tech Stack

**Framework & Core**
- [Next.js 15.5.2](https://nextjs.org/) - React framework with App Router
- [React 19.0.0](https://react.dev/) - UI library with concurrent features
- [TypeScript 5.8.2](https://www.typescriptlang.org/) - Type-safe development

**Styling & Components**
- [Tailwind CSS 3.4.17](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Framer Motion](https://www.framer.com/motion/) - Smooth animations
- [Lucide React](https://lucide.dev/) - Icon system

**Data & State**
- [TanStack Query 5.71.1](https://tanstack.com/query) - Server state management
- [Zod 3.24.2](https://zod.dev/) - Schema validation
- [nuqs 2.4.1](https://nuqs.47ng.com/) - URL state management
- [Fuse.js](https://fusejs.io/) - Fuzzy search engine

**Tooling**
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting
- [Chart.js](https://www.chartjs.org/) - Data visualization

## 🚀 Quick Start

**Prerequisites:** Node.js 18+ and npm/yarn/pnpm/bun

```bash
# Clone the repository
git clone https://github.com/dailyfoss/dailyfoss.git
cd dailyfoss

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Environment Setup

Create a `.env.local` file for local development:

```env
# Optional: GitHub token for metadata updates
GITHUB_TOKEN=your_github_token_here
```

## 📦 Available Scripts

```bash
# Development
npm run dev                    # Start dev server with Turbopack
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint with auto-fix
npm run typecheck              # TypeScript type checking

# Tools & Automation
npm run download-icons                    # Download and optimize app icons
npm run update-repo-metadata              # Update GitHub metadata (requires GITHUB_TOKEN)
npm run check-community-integrations      # Check Proxmox VE & YunoHost support
npm run validate-apps                     # Validate JSON schema for all apps

# Deployment
npm run deploy                 # Build and deploy to GitHub Pages
```

## 🏗️ Project Structure

```
dailyfoss-website/
├── src/
│   ├── app/                      # Next.js app router pages
│   │   ├── scripts/              # Main application pages
│   │   └── category-view/        # Category browsing
│   ├── components/               # Reusable components
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/                      # Utilities and types
│   │   ├── types.ts              # TypeScript definitions
│   │   └── utils.ts              # Helper functions
│   └── hooks/                    # Custom React hooks
├── public/
│   ├── json/                     # Application data (1000+ files)
│   └── icons/                    # Application logos
├── tools/                        # Build and maintenance scripts
│   ├── download-icons.js         # Icon downloader
│   └── update-repo-metadata.js   # GitHub data fetcher
└── .github/workflows/            # CI/CD automation
```

## 🔧 Development Guidelines

**Code Style**
- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling (no custom CSS)
- Mobile-first responsive design
- Accessibility-first approach

**Component Pattern**
```typescript
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  className?: string;
}

export function Component({ title, className }: Props) {
  return (
    <div className={cn("base-styles", className)}>
      {title}
    </div>
  );
}
```

**Adding New Apps**
1. Create a JSON file in `public/json/` following the schema in `src/lib/types.ts`
2. Add app icon to `public/icons/` (PNG or SVG, 512x512 recommended)
3. Run `npm run validate-apps` to check schema compliance
4. Submit a pull request with your changes

**JSON Schema Example**
```json
{
  "slug": "app-name",
  "name": "App Name",
  "description": "Brief description",
  "categories": ["category-id"],
  "resources": {
    "source_code": "https://github.com/user/repo",
    "website": "https://example.com",
    "logo": "/icons/app-name.png"
  },
  "metadata": {
    "license": "MIT",
    "github_stars": 1000
  },
  "platform_support": {
    "desktop": { "linux": true },
    "web_app": true
  },
  "deployment_methods": {
    "docker": true,
    "docker_compose": true
  }
}
```

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Areas to Contribute:**
- 🐛 Bug fixes and issue reports
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX refinements
- ♿ Accessibility improvements
- 🚀 Performance optimizations

**Guidelines:**
- Follow existing code patterns
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## � Automaeted Updates

The project includes automated workflows that run daily:

- **Repository Metadata** - Updates GitHub stats (stars, contributors, commits, issues, releases)
- **Icon Downloads** - Fetches and optimizes application logos
- **Status Tracking** - Monitors repository activity levels

These workflows ensure the platform always displays current information.

## � Staetistics

- **1,160+ Applications** - Curated collection of self-hosted apps
- **50+ Categories** - Organized by use case
- **303 Proxmox VE** - Community scripts available
- **412 YunoHost** - App packages available
- **177 Dual Support** - Apps on both platforms
- **Daily Updates** - Automated metadata refresh

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Open Source Community** - For creating amazing self-hosted applications
- **Contributors** - Thank you for your valuable contributions
- **[ProxmoxVE Frontend](https://github.com/community-scripts/ProxmoxVE/tree/main/frontend)** - For the beautiful frontend
- **[selfh.st Icons](https://github.com/selfhst/icons)** - For awesome icons

## �  Links

- 🌐 **Website**: [dailyfoss.github.io](https://dailyfoss.github.io)
- 🐦 **Twitter**: [@dailyfoss](https://twitter.com/dailyfoss)
- 📧 **Email**: dailyfoss@gmail.com

---

**Built with ❤️ for the open-source community**
