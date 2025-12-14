# Daily FOSS

> Discover, explore, and deploy open-source applications with ease

A modern, comprehensive platform for browsing and deploying 1000+ self-hosted applications and open-source tools. Built with Next.js, featuring real-time community insights, advanced filtering, and detailed deployment guides.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- **🔍 Smart Search** - Fuzzy search with advanced filtering across 1000+ applications
- **📊 Community Insights** - Real-time GitHub stats: contributors, commits, issues, releases
- **🤝 Community Integrations** - Automatic detection of community platform support (Proxmox VE, more coming)
- **📱 Responsive Design** - Mobile-first UI with smooth animations and transitions
- **🌙 Theme Support** - Dark/light mode with system preference detection
- **📈 Repository Status** - Active, regular, occasional, dormant, and archived indicators
- **🏷️ Rich Metadata** - License info, version tracking, release dates, and star counts
- **🎯 Category System** - Organized by use case with related tools suggestions
- **⚡ Lightning Fast** - Static site generation with optimized performance
- **♿ Accessible** - WCAG compliant with keyboard navigation support

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
git clone https://github.com/dailyfoss/dailyfoss-website.git
cd dailyfoss-website

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

# Tools
npm run download-icons              # Download app icons
npm run update-repo-metadata        # Update GitHub metadata (requires GITHUB_TOKEN)
npm run check-community-integrations # Check community platform support (Proxmox VE, YunoHost)

# Deployment
npm run deploy                 # Build and deploy to GitHub Pages
```

## 🏗️ Project Structure

```
dailyfoss-website/
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── scripts/           # Main application pages
│   │   └── category-view/     # Category browsing
│   ├── components/            # Reusable components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities and types
│   │   ├── types.ts           # TypeScript definitions
│   │   └── utils.ts           # Helper functions
│   └── hooks/                 # Custom React hooks
├── public/
│   ├── json/                  # Application data (1000+ files)
│   └── icons/                 # Application logos
├── tools/                     # Build and maintenance scripts
│   ├── download-icons.js      # Icon downloader
│   └── update-repo-metadata.js # GitHub data fetcher
└── .github/workflows/         # CI/CD automation
```

## 🔧 Development Guidelines

**Code Style**
- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling
- Mobile-first responsive design

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

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Open Source Community** - For creating amazing self-hosted applications
- **Contributors** - Thank you for your valuable contributions
- **[shadcn](https://twitter.com/shadcn)** - For the beautiful component library
- **[Vercel](https://vercel.com)** - For Next.js and hosting platform

## �  Links

- 🌐 **Website**: [dailyfoss.com](https://dailyfoss.com)
- 💬 **Discord**: [Join our community](https://discord.gg/dailyfoss)
- 🐦 **Twitter**: [@dailyfoss](https://twitter.com/dailyfoss)
- 📧 **Email**: hello@dailyfoss.com

---

**Built with ❤️ for the open-source community**
