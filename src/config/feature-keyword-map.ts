/**
 * Keyword-based icon suggestion for features
 * Maps keywords found in feature titles to appropriate icons
 */

const keywordIconMap: Record<string, string> = {
  // Security
  "security": "shield",
  "secure": "shield-check",
  "encrypt": "lock",
  "encryption": "lock",
  "password": "key",
  "auth": "fingerprint",
  "authentication": "fingerprint",
  "2fa": "shield-check",
  "mfa": "shield-check",
  "totp": "key",
  "sso": "log-in",
  "oauth": "log-in",
  "permission": "shield",
  "access": "lock-keyhole",
  "privacy": "eye-off",
  
  // Sync & Backup
  "sync": "refresh",
  "synchron": "refresh",
  "backup": "database-backup",
  "restore": "rotate",
  "replicate": "repeat",
  "mirror": "copy",
  
  // Cloud & Storage
  "cloud": "cloud",
  "storage": "hard-drive",
  "s3": "cloud",
  "upload": "upload",
  "download": "download",
  "file": "file",
  "folder": "folder",
  
  // Users & Teams
  "user": "user",
  "team": "users",
  "group": "users",
  "member": "user-plus",
  "invite": "user-plus",
  "role": "user-check",
  "admin": "shield",
  "multi-user": "users",
  "collaboration": "users",
  "share": "share",
  "sharing": "share",
  
  // Notifications
  "notification": "bell",
  "alert": "bell-ring",
  "email": "mail",
  "webhook": "webhook",
  "push": "bell-ring",
  
  // API & Integration
  "api": "plug",
  "rest": "plug",
  "graphql": "plug",
  "integration": "puzzle",
  "plugin": "puzzle",
  "extension": "puzzle",
  "connect": "link",
  "import": "download",
  "export": "upload",
  
  // Mobile & Cross-platform
  "mobile": "smartphone",
  "android": "smartphone",
  "ios": "smartphone",
  "desktop": "monitor",
  "cross-platform": "layers",
  "responsive": "smartphone",
  "pwa": "smartphone",
  
  // Search & Filter
  "search": "search",
  "filter": "filter",
  "sort": "sort-asc",
  "query": "search",
  "find": "search",
  
  // Automation
  "automat": "zap",
  "schedule": "calendar",
  "cron": "clock",
  "task": "check-circle",
  "workflow": "workflow",
  "pipeline": "git-branch",
  
  // Monitoring & Analytics
  "monitor": "activity",
  "metric": "bar-chart",
  "analytic": "pie-chart",
  "dashboard": "layout-grid",
  "report": "file-text",
  "log": "scroll-text",
  "audit": "file-search",
  "track": "activity",
  "health": "activity",
  "status": "activity-square",
  
  // Performance
  "fast": "zap",
  "speed": "zap",
  "performance": "gauge",
  "cache": "database",
  "optimi": "sparkles",
  
  // Docker & Containers
  "docker": "box",
  "container": "box",
  "kubernetes": "boxes",
  "k8s": "boxes",
  "helm": "package",
  
  // Database
  "database": "database",
  "sql": "database",
  "postgres": "database",
  "mysql": "database",
  "mongo": "database",
  "redis": "database",
  
  // Git & Version Control
  "git": "git-branch",
  "version": "git-commit",
  "branch": "git-branch",
  "commit": "git-commit",
  "merge": "git-merge",
  
  // Media
  "image": "image",
  "photo": "image",
  "video": "video",
  "audio": "volume-2",
  "music": "volume-2",
  "stream": "play",
  "media": "film",
  "gallery": "grid",
  
  // AI & ML
  "ai": "brain",
  "ml": "brain",
  "machine learning": "brain",
  "neural": "brain",
  "gpt": "bot",
  "llm": "bot",
  "chat": "message-square",
  
  // UI & Themes
  "theme": "palette",
  "dark": "palette",
  "light": "palette",
  "custom": "sliders",
  "config": "settings",
  "setting": "settings",
  
  // Network
  "network": "network",
  "dns": "globe",
  "proxy": "globe",
  "vpn": "shield",
  "ssl": "lock",
  "tls": "lock",
  "https": "lock",
  "domain": "globe",
  
  // Documentation
  "document": "file-text",
  "wiki": "book",
  "note": "file-text",
  "markdown": "file-code",
  
  // E-commerce
  "payment": "credit-card",
  "billing": "dollar-sign",
  "invoice": "file-text",
  "subscription": "repeat",
  
  // Calendar & Time
  "calendar": "calendar",
  "event": "calendar",
  "reminder": "alarm",
  "time": "clock",
  "date": "calendar",
  
  // Testing
  "test": "beaker",
  "debug": "bug",
  "ci": "git-compare",
  "cd": "git-merge",
  
  // Misc
  "open source": "code",
  "self-host": "server",
  "offline": "wifi-off",
  "realtime": "zap",
  "real-time": "zap",
  "live": "radio",
  "bookmark": "bookmark",
  "favorite": "star",
  "tag": "tag",
  "label": "tag",
  "category": "folder",
};

/**
 * Suggests an icon based on keywords found in the feature title
 * @param title - The feature title to analyze
 * @param existingIcon - An existing icon if already specified
 * @returns The suggested icon key or the existing icon
 */
export function suggestIconFromKeywords(title: string, existingIcon?: string): string {
  // If an icon is already specified and valid, use it
  if (existingIcon) {
    return existingIcon;
  }
  
  const lowerTitle = title.toLowerCase();
  
  // Check each keyword against the title
  for (const [keyword, icon] of Object.entries(keywordIconMap)) {
    if (lowerTitle.includes(keyword)) {
      return icon;
    }
  }
  
  // Default fallback
  return "check-circle";
}
