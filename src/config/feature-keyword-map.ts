/**
 * Keyword-based icon suggestions for feature titles
 * Maps keywords found in feature titles to appropriate icon names
 * 
 * Usage: Add new mappings to suggest better icons for feature titles
 * Format: { keywords: ['word1', 'word2'], icon: 'icon-name' }
 */

export type KeywordMapping = {
  keywords: string[];
  icon: string;
  priority?: number; // Higher priority = checked first (default: 0)
};

/**
 * Smart icon suggestion mappings
 * Organized by category for easier maintenance
 */
export const keywordMappings: KeywordMapping[] = [
  // === HIGH PRIORITY SPECIFIC MATCHES ===
  { keywords: ['agentless'], icon: 'server', priority: 10 },
  { keywords: ['orchestration', 'orchestrate'], icon: 'layers', priority: 10 },
  { keywords: ['idempotent'], icon: 'refresh-cw', priority: 10 },
  { keywords: ['gamification', 'gamif'], icon: 'award', priority: 10 },
  
  // === INFRASTRUCTURE & DEVOPS ===
  { keywords: ['module', 'modules'], icon: 'package' },
  { keywords: ['playbook', 'role'], icon: 'file-text' },
  { keywords: ['inventory'], icon: 'database' },
  { keywords: ['ci/cd', 'pipeline'], icon: 'git-pull-request' },
  { keywords: ['docker', 'container'], icon: 'box' },
  { keywords: ['kubernetes', 'k8s'], icon: 'layers' },
  { keywords: ['helm', 'chart'], icon: 'package' },
  { keywords: ['terraform', 'iac'], icon: 'layers' },
  { keywords: ['ansible'], icon: 'server' },
  { keywords: ['operator'], icon: 'settings' },
  { keywords: ['service mesh'], icon: 'shuffle' },
  { keywords: ['cluster', 'distributed'], icon: 'layers' },
  { keywords: ['scale', 'scaling'], icon: 'trending-up' },
  { keywords: ['replica', 'shard'], icon: 'copy' },
  { keywords: ['load', 'balanc'], icon: 'layers' },
  
  // OBSERVABILITY
  { keywords: ['observability'], icon: 'activity' },
  { keywords: ['monitoring'], icon: 'activity' },
  { keywords: ['logging'], icon: 'file-text' },
  { keywords: ['tracing'], icon: 'git-commit' },
  { keywords: ['status pages', 'status page'], icon: 'activity' },

  // === RECIPE & FOOD MANAGEMENT ===
  { keywords: ['recipe', 'cookbook'], icon: 'book' },
  { keywords: ['ingredient'], icon: 'list' },
  { keywords: ['meal', 'menu'], icon: 'calendar' },
  { keywords: ['shopping', 'cart'], icon: 'shopping-cart' },
  { keywords: ['cocktail', 'drink', 'bartender'], icon: 'glasses' },
  { keywords: ['pantry'], icon: 'archive' },
  
  // === HABIT & TASK MANAGEMENT ===
  { keywords: ['habit', 'streak'], icon: 'trending-up' },
  { keywords: ['task', 'todo'], icon: 'check' },
  { keywords: ['goal', 'target'], icon: 'target' },
  { keywords: ['daily', 'dailies'], icon: 'calendar' },
  { keywords: ['reward', 'prize'], icon: 'star' },
  { keywords: ['social', 'party', 'guild'], icon: 'users' },
  { keywords: ['pet', 'mount', 'creature'], icon: 'heart' },
  { keywords: ['class', 'warrior', 'mage', 'rogue', 'healer'], icon: 'shield' },
  
  // === FINANCE & BUDGETING ===
  { keywords: ['budget', 'expense', 'finance'], icon: 'dollar-sign' },
  { keywords: ['invoice', 'billing', 'payment'], icon: 'credit-card' },
  { keywords: ['transaction'], icon: 'database' },
  { keywords: ['recurring'], icon: 'repeat' },
  { keywords: ['balance'], icon: 'pie-chart' },
  
  // === MEDIA & ENTERTAINMENT ===
  { keywords: ['anime', 'manga'], icon: 'tv' },
  { keywords: ['book', 'library', 'reading'], icon: 'book' },
  { keywords: ['podcast', 'episode'], icon: 'mic' },
  { keywords: ['rss', 'feed'], icon: 'rss' },
  { keywords: ['video', 'stream'], icon: 'video' },
  { keywords: ['audio', 'music', 'sound'], icon: 'volume-2' },
  { keywords: ['image', 'photo'], icon: 'image' },
  
  // === NETWORK & COMMUNICATION ===
  { keywords: ['mqtt', 'zigbee'], icon: 'radio' },
  { keywords: ['ssh', 'telnet'], icon: 'terminal' },
  { keywords: ['vnc', 'remote'], icon: 'monitor' },
  { keywords: ['dns', 'domain'], icon: 'globe' },
  { keywords: ['firewall', 'block'], icon: 'shield' },
  { keywords: ['vpn', 'tunnel'], icon: 'shield' },
  { keywords: ['proxy', 'reverse'], icon: 'shuffle' },
  { keywords: ['bridge'], icon: 'shuffle' },
  { keywords: ['websocket', 'ws'], icon: 'activity' },
  
  // === SECURITY & CERTIFICATES ===
  { keywords: ['certificate', 'ssl', 'tls'], icon: 'award' },
  { keywords: ['acme', 'letsencrypt'], icon: 'key' },
  { keywords: ['encrypt', 'lock'], icon: 'lock' },
  { keywords: ['auth', 'login', 'password'], icon: 'key' },
  { keywords: ['security', 'secure', 'safe'], icon: 'shield' },
  { keywords: ['privacy', 'private'], icon: 'shield' },
  { keywords: ['authentication'], icon: 'key' },
  { keywords: ['authorization', 'rbac'], icon: 'shield-check' },
  { keywords: ['sso', 'single sign on'], icon: 'log-in' },
  { keywords: ['oauth', 'oidc'], icon: 'key' },
  { keywords: ['rate limit', 'throttling'], icon: 'sliders' },
  { keywords: ['data pipeline', 'etl'], icon: 'repeat' },
  
  // === DATABASE & STORAGE ===
  { keywords: ['database', 'storage'], icon: 'database' },
  { keywords: ['query', 'sql'], icon: 'database' },
  { keywords: ['migration', 'schema'], icon: 'database' },
  { keywords: ['seed', 'fixture'], icon: 'database' },
  { keywords: ['transaction', 'acid'], icon: 'database' },
  { keywords: ['replication'], icon: 'copy' },
  { keywords: ['cache', 'caching'], icon: 'zap' },
  { keywords: ['index', 'indexing'], icon: 'search' },
  { keywords: ['backup', 'restore'], icon: 'archive' },
  
  // === DEVELOPMENT & APIs ===
  { keywords: ['grpc', 'protobuf'], icon: 'code' },
  { keywords: ['graphql', 'gql'], icon: 'code' },
  { keywords: ['rest', 'restful'], icon: 'code' },
  { keywords: ['soap', 'xml'], icon: 'code' },
  { keywords: ['json', 'yaml'], icon: 'file-text' },
  { keywords: ['markdown', 'md'], icon: 'file-text' },
  { keywords: ['wysiwyg', 'editor'], icon: 'edit' },
  { keywords: ['syntax', 'highlight'], icon: 'code' },
  { keywords: ['lint', 'format'], icon: 'check' },
  { keywords: ['compile', 'transpile'], icon: 'code' },
  { keywords: ['minif', 'compress'], icon: 'archive' },
  { keywords: ['bundle', 'pack'], icon: 'package' },
  { keywords: ['api', 'code', 'developer'], icon: 'code' },

  // AI & AUTOMATION
  { keywords: ['ai', 'artificial intelligence'], icon: 'sparkles' },
  { keywords: ['llm', 'language model'], icon: 'sparkles' },
  { keywords: ['prompt'], icon: 'message-square' },
  { keywords: ['embedding', 'vector'], icon: 'grid' },
  { keywords: ['semantic search'], icon: 'search' },
  { keywords: ['rag'], icon: 'layers' },
  
  // === GIT & VERSION CONTROL ===
  { keywords: ['tree', 'hierarchy'], icon: 'git-branch' },
  { keywords: ['branch', 'merge'], icon: 'git-branch' },
  { keywords: ['commit', 'revision'], icon: 'git-commit' },
  { keywords: ['diff', 'patch'], icon: 'git-compare' },
  { keywords: ['pull', 'push'], icon: 'git-pull-request' },
  { keywords: ['fork', 'clone'], icon: 'git-fork' },
  { keywords: ['git integration'], icon: 'git-branch' },
  
  // === PACKAGE MANAGERS ===
  { keywords: ['npm', 'yarn', 'pnpm'], icon: 'package' },
  { keywords: ['pip', 'poetry'], icon: 'package' },
  { keywords: ['gem', 'bundler'], icon: 'package' },
  { keywords: ['cargo', 'crate'], icon: 'package' },
  { keywords: ['maven', 'gradle'], icon: 'package' },
  { keywords: ['nuget', 'dotnet'], icon: 'package' },
  { keywords: ['artifact', 'asset'], icon: 'package' },
  { keywords: ['registry', 'repository'], icon: 'database' },
  { keywords: ['package', 'dependency'], icon: 'package' },
  
  // === UI & UX FEATURES ===
  { keywords: ['category organization', 'category system'], icon: 'tag' },
  { keywords: ['categorization', 'categorize'], icon: 'tag' },
  { keywords: ['voting system', 'voting'], icon: 'thumbs-up' },
  { keywords: ['customizable layout'], icon: 'layout-grid' },
  { keywords: ['no registration'], icon: 'unlock' },
  { keywords: ['template system', 'custom templates'], icon: 'file-text' },
  { keywords: ['kanban board', 'kanban'], icon: 'layout-grid' },
  { keywords: ['rating system'], icon: 'star' },
  { keywords: ['attachments', 'attachment'], icon: 'paperclip' },
  { keywords: ['color coding'], icon: 'palette' },
  { keywords: ['drag and drop', 'drag-and-drop'], icon: 'move' },
  { keywords: ['keyboard shortcuts', 'keyboard shortcut'], icon: 'keyboard' },
  { keywords: ['modern ui'], icon: 'layout-grid' },
  { keywords: ['theme', 'style', 'appearance'], icon: 'palette' },
  { keywords: ['dashboard'], icon: 'layout-grid' },
  
  // === DATA & ANALYTICS ===
  { keywords: ['historical data', 'historical'], icon: 'clock' },
  { keywords: ['session recording', 'session persistence'], icon: 'activity' },
  { keywords: ['deduplication', 'deduplicate'], icon: 'copy' },
  { keywords: ['statistic', 'analytics', 'metric'], icon: 'bar-chart' },
  { keywords: ['chart', 'graph', 'visual'], icon: 'bar-chart' },
  { keywords: ['dashboard', 'overview'], icon: 'layout-grid' },
  { keywords: ['report', 'log'], icon: 'file-text' },
  { keywords: ['trend analysis'], icon: 'trending-up' },
  
  // === SYSTEM & OPERATIONS ===
  { keywords: ['device discovery'], icon: 'search' },
  { keywords: ['modular architecture'], icon: 'layers' },
  { keywords: ['recording'], icon: 'video' },
  { keywords: ['scheduling'], icon: 'calendar' },
  { keywords: ['priority level'], icon: 'flag' },
  { keywords: ['open source'], icon: 'code' },
  { keywords: ['ota updates', 'ota'], icon: 'download' },
  { keywords: ['machine learning', 'ml'], icon: 'cpu' },
  { keywords: ['object detection'], icon: 'scan' },
  { keywords: ['scalable architecture'], icon: 'layers' },
  { keywords: ['status pages', 'status page'], icon: 'activity' },
  { keywords: ['machine translation'], icon: 'languages' },
  { keywords: ['lightweight', 'minimal', 'simple'], icon: 'feather' },
  { keywords: ['extensibility', 'extensible', 'extend'], icon: 'puzzle' },
  { keywords: ['concurrent', 'concurrency'], icon: 'activity' },
  { keywords: ['foreign data', 'fdw', 'wrapper'], icon: 'plug' },
  { keywords: ['optimization', 'optimize'], icon: 'zap' },
  
  // === INTEGRATIONS ===
  { keywords: ['plex integration'], icon: 'tv' },
  { keywords: ['crm integration'], icon: 'users' },

  // COLLABORATION
  { keywords: ['team', 'collaboration'], icon: 'users' },
  { keywords: ['real time'], icon: 'activity' },
  { keywords: ['comment'], icon: 'message-square' },
  
  // === GENERAL FEATURES ===
  { keywords: ['multi-', 'multiple'], icon: 'layers' },
  { keywords: ['community', 'ecosystem'], icon: 'users' },
  { keywords: ['image', 'photo', 'picture'], icon: 'image' },
  { keywords: ['file', 'document'], icon: 'file' },
  { keywords: ['folder', 'directory'], icon: 'folder' },
  { keywords: ['search', 'find'], icon: 'search' },
  { keywords: ['filter'], icon: 'filter' },
  { keywords: ['tag', 'label'], icon: 'tag' },
  { keywords: ['user', 'account', 'profile'], icon: 'user' },
  { keywords: ['team', 'group', 'collaboration'], icon: 'users' },
  { keywords: ['notification', 'alert'], icon: 'bell' },
  { keywords: ['email', 'mail'], icon: 'mail' },
  { keywords: ['message', 'chat'], icon: 'message-square' },
  { keywords: ['calendar', 'schedule', 'event'], icon: 'calendar' },
  { keywords: ['time', 'clock', 'timer'], icon: 'clock' },
  { keywords: ['export', 'download'], icon: 'download' },
  { keywords: ['import', 'upload'], icon: 'upload' },
  { keywords: ['sync', 'synchron'], icon: 'refresh-cw' },
  { keywords: ['server', 'host'], icon: 'server' },
  { keywords: ['cloud'], icon: 'cloud' },
  { keywords: ['terminal', 'command', 'cli'], icon: 'terminal' },
  { keywords: ['plugin', 'extension', 'addon'], icon: 'package' },
  { keywords: ['webhook'], icon: 'webhook' },
  { keywords: ['mobile', 'phone', 'app'], icon: 'smartphone' },
  { keywords: ['web', 'browser', 'interface'], icon: 'globe' },
  { keywords: ['edit', 'modify', 'change'], icon: 'edit' },
  { keywords: ['delete', 'remove', 'trash'], icon: 'trash' },
  { keywords: ['add', 'create', 'new'], icon: 'plus' },
  { keywords: ['share', 'sharing'], icon: 'share' },
  { keywords: ['link', 'url'], icon: 'link' },
  { keywords: ['copy', 'duplicate'], icon: 'copy' },
  { keywords: ['settings', 'config', 'preference'], icon: 'settings' },
  { keywords: ['monitor', 'watch', 'track'], icon: 'activity' },
  { keywords: ['performance', 'speed', 'fast'], icon: 'zap' },
  { keywords: ['automation', 'workflow', 'automat'], icon: 'zap' },
  { keywords: ['network', 'connection'], icon: 'wifi' },
  { keywords: ['location', 'map', 'geo'], icon: 'map-pin' },
  { keywords: ['camera', 'capture'], icon: 'camera' },
  { keywords: ['scan', 'qr'], icon: 'scan' },
  { keywords: ['print'], icon: 'printer' },
  { keywords: ['bookmark', 'favorite'], icon: 'bookmark' },
  { keywords: ['flag', 'mark'], icon: 'flag' },
  { keywords: ['archive'], icon: 'archive' },
  { keywords: ['history', 'version'], icon: 'clock' },
  { keywords: ['activity', 'feed'], icon: 'activity' },
  { keywords: ['home', 'main'], icon: 'home' },
  { keywords: ['build', 'compile'], icon: 'package' },
  { keywords: ['deploy', 'release'], icon: 'upload' },
  { keywords: ['test', 'debug'], icon: 'bug' },
  { keywords: ['error', 'warning'], icon: 'alert-circle' },
  { keywords: ['success', 'complete'], icon: 'check-circle' },
  { keywords: ['progress', 'loading'], icon: 'loader' },
  { keywords: ['battery', 'power'], icon: 'battery' },
  { keywords: ['wifi', 'wireless'], icon: 'wifi' },
  { keywords: ['bluetooth'], icon: 'bluetooth' },
  { keywords: ['volume', 'speaker'], icon: 'volume-2' },
  { keywords: ['mic', 'microphone'], icon: 'mic' },
  { keywords: ['shopping', 'cart', 'store'], icon: 'shopping-cart' },
  { keywords: ['payment', 'billing', 'invoice'], icon: 'credit-card' },
  { keywords: ['money', 'dollar', 'price'], icon: 'dollar-sign' },
  { keywords: ['custom branding'], icon: 'palette' },
  { keywords: ['due dates', 'due date'], icon: 'calendar' },
  { keywords: ['checklists', 'checklist'], icon: 'check' },
  { keywords: ['federation support', 'federation'], icon: 'globe' },
  { keywords: ['ad-free', 'ad free'], icon: 'shield' },
  { keywords: ['quick action', 'quick access'], icon: 'zap' },
  { keywords: ['hash generator'], icon: 'hash' },
  { keywords: ['overlay support'], icon: 'layers' },
  { keywords: ['model support'], icon: 'box' },
  { keywords: ['infinite canvas'], icon: 'maximize' },
  { keywords: ['easy setup'], icon: 'zap' },
  { keywords: ['engineering focus'], icon: 'code' },
  { keywords: ['metadata fetching'], icon: 'download' },
  { keywords: ['smart recommendation'], icon: 'sparkles' },
  { keywords: ['project organization'], icon: 'folder' },
  { keywords: ['low overhead'], icon: 'zap' },
  { keywords: ['small business'], icon: 'building' },
  { keywords: ['personal record'], icon: 'user' },
  { keywords: ['self hosted'], icon: 'server' },
  { keywords: ['open source'], icon: 'code' },
];

/**
 * Suggests an icon based on feature title keywords
 * @param title - The feature title to analyze
 * @param currentIcon - The current icon (optional, will auto-detect if not provided or 'check-circle')
 * @returns The suggested icon name
 */
export function suggestIconFromKeywords(title: string, currentIcon?: string): string {
  // If a specific icon is provided and it's not the default, keep it
  if (currentIcon && currentIcon !== 'check-circle') {
    return currentIcon;
  }
  
  const lower = title.toLowerCase();
  
  // Sort by priority (higher first), then by order
  const sortedMappings = [...keywordMappings].sort((a, b) => {
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    return priorityB - priorityA;
  });
  
  // Check each mapping
  for (const mapping of sortedMappings) {
    for (const keyword of mapping.keywords) {
      if (lower.includes(keyword)) {
        return mapping.icon;
      }
    }
  }
  
  // Default fallback
  return 'check-circle';
}
