import type { LucideIcon } from "lucide-react";
import {
  Shield, ShieldCheck, ShieldAlert,
  Lock, Unlock, LockKeyhole, Key, Fingerprint,
  QrCode, Scan, ScanEye, Camera, Image, FileImage,
  Folder, FolderOpen, Layers, Layers3, Grid, LayoutGrid,
  Server, ServerCog, Database, DatabaseBackup,
  HardDrive, HardDriveDownload, HardDriveUpload,
  Cloud, CloudOff, CloudCog,
  Smartphone, Monitor, Tablet, Laptop, Tv,
  Download, Upload, RefreshCw, RotateCw, Repeat,
  Bell, BellRing, Mail, MessageSquare, Send,
  Settings, Sliders, Wrench, Hammer,
  Users, User, UserPlus, UserCheck, UserX,
  Calendar, Clock, Clock4, Timer, AlarmClock, Watch,
  Search, Filter, SortAsc, SortDesc, List,
  CheckCircle, Check, X, XCircle, AlertCircle,
  Star, Heart, Bookmark, Flag, Tag,
  Share, Link, Copy, Clipboard, ClipboardCheck,
  Plug, Puzzle, Webhook,
  Eye, EyeOff,
  Zap, Sparkles, Flame,
  Globe, Wifi, WifiOff, Signal, Network,
  LogOut, LogIn,
  Package, PackageCheck, PackageX, Box, Archive, Inbox,
  Code, Terminal, SquareTerminal, FileCode, FileJson, Binary,
  Play, Pause,
  Volume2, Mic,
  Video, Film,
  MapPin,
  TrendingUp, BarChart, PieChart,
  ShoppingCart, CreditCard, DollarSign,
  Home, Building,
  FileText, File, Files, FileSearch,
  Trash, Trash2,
  Edit, Edit2,
  Plus,
  ArrowRight,
  ExternalLink,
  Activity, ActivitySquare, Gauge, Radar, ScrollText,
  Bug, BugPlay, Loader,
  Battery, Bluetooth, Printer, Palette, Feather,
  Book, Target, Rss, Shuffle, Radio, Award,
  GitBranch, GitCommit, GitCompare, GitPullRequest, GitFork, GitMerge,
  Glasses, ThumbsUp, Paperclip, Move, Keyboard, Maximize, Cpu, Hash, Languages,
  Workflow, Boxes,
  Bot, Brain,
  TestTube, Beaker,
} from "lucide-react";

/**
 * Centralized Lucide icon map for tool & app features
 * - kebab-case keys
 * - no duplicates
 * - tool-app semantics
 */
export const iconMap: Record<string, LucideIcon> = {
  /* =====================
   * Security
   * ===================== */
  "shield": Shield,
  "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert,
  "lock": Lock,
  "unlock": Unlock,
  "lock-keyhole": LockKeyhole,
  "key": Key,
  "fingerprint": Fingerprint,

  /* =====================
   * Media & Scan
   * ===================== */
  "qr-code": QrCode,
  "scan": Scan,
  "scan-eye": ScanEye,
  "camera": Camera,
  "image": Image,
  "file-image": FileImage,

  /* =====================
   * Files & Layout
   * ===================== */
  "folder": Folder,
  "folder-open": FolderOpen,
  "layers": Layers,
  "layers-3": Layers3,
  "grid": Grid,
  "layout-grid": LayoutGrid,

  /* =====================
   * Infrastructure
   * ===================== */
  "server": Server,
  "server-cog": ServerCog,
  "database": Database,
  "database-backup": DatabaseBackup,
  "hard-drive": HardDrive,
  "hard-drive-download": HardDriveDownload,
  "hard-drive-upload": HardDriveUpload,
  "cloud": Cloud,
  "cloud-off": CloudOff,
  "cloud-cog": CloudCog,
  "network": Network,
  "boxes": Boxes,

  /* =====================
   * Devices
   * ===================== */
  "smartphone": Smartphone,
  "monitor": Monitor,
  "tablet": Tablet,
  "laptop": Laptop,
  "tv": Tv,

  /* =====================
   * Actions
   * ===================== */
  "download": Download,
  "upload": Upload,
  "refresh": RefreshCw,
  "rotate": RotateCw,
  "repeat": Repeat,

  /* =====================
   * Communication
   * ===================== */
  "bell": Bell,
  "bell-ring": BellRing,
  "mail": Mail,
  "message": MessageSquare,
  "message-square": MessageSquare,
  "send": Send,

  /* =====================
   * Settings & Tools
   * ===================== */
  "settings": Settings,
  "sliders": Sliders,
  "wrench": Wrench,
  "tools": Hammer,
  "workflow": Workflow,
  "plug": Plug,
  "puzzle": Puzzle,
  "webhook": Webhook,

  /* =====================
   * Users
   * ===================== */
  "users": Users,
  "user": User,
  "user-plus": UserPlus,
  "user-check": UserCheck,
  "user-x": UserX,

  /* =====================
   * Time
   * ===================== */
  "calendar": Calendar,
  "clock": Clock,
  "clock-4": Clock4,
  "timer": Timer,
  "alarm": AlarmClock,
  "watch": Watch,

  /* =====================
   * Search & Sort
   * ===================== */
  "search": Search,
  "filter": Filter,
  "sort-asc": SortAsc,
  "sort-desc": SortDesc,
  "list": List,
  "file-search": FileSearch,

  /* =====================
   * Status
   * ===================== */
  "check-circle": CheckCircle,
  "check": Check,
  "x": X,
  "x-circle": XCircle,
  "alert": AlertCircle,
  "alert-circle": AlertCircle,

  /* =====================
   * Favorites & Bookmarks
   * ===================== */
  "star": Star,
  "heart": Heart,
  "bookmark": Bookmark,
  "flag": Flag,
  "tag": Tag,

  /* =====================
   * Sharing & Clipboard
   * ===================== */
  "share": Share,
  "link": Link,
  "copy": Copy,
  "clipboard": Clipboard,
  "clipboard-check": ClipboardCheck,

  /* =====================
   * Visibility
   * ===================== */
  "eye": Eye,
  "eye-off": EyeOff,

  /* =====================
   * Power & Network
   * ===================== */
  "zap": Zap,
  "sparkles": Sparkles,
  "flame": Flame,
  "globe": Globe,
  "wifi": Wifi,
  "wifi-off": WifiOff,
  "signal": Signal,

  /* =====================
   * Auth
   * ===================== */
  "log-in": LogIn,
  "log-out": LogOut,

  /* =====================
   * Packages
   * ===================== */
  "package": Package,
  "package-check": PackageCheck,
  "package-x": PackageX,
  "box": Box,
  "archive": Archive,
  "inbox": Inbox,

  /* =====================
   * CLI & Dev
   * ===================== */
  "terminal": Terminal,
  "cli": SquareTerminal,
  "code": Code,
  "file-code": FileCode,
  "file-json": FileJson,
  "binary": Binary,

  /* =====================
   * Git / CI
   * ===================== */
  "git-branch": GitBranch,
  "git-commit": GitCommit,
  "git-compare": GitCompare,
  "git-pull-request": GitPullRequest,
  "git-fork": GitFork,
  "git-merge": GitMerge,

  /* =====================
   * Observability
   * ===================== */
  "activity": Activity,
  "activity-square": ActivitySquare,
  "metrics": Gauge,
  "radar": Radar,
  "logs": ScrollText,

  /* =====================
   * AI & Data
   * ===================== */
  "ai": Bot,
  "brain": Brain,
  "cpu": Cpu,

  /* =====================
   * Testing & Debugging
   * ===================== */
  "test": TestTube,
  "beaker": Beaker,
  "bug": Bug,
  "bug-play": BugPlay,

  /* =====================
   * Media
   * ===================== */
  "play": Play,
  "pause": Pause,
  "volume": Volume2,
  "volume-2": Volume2,
  "mic": Mic,
  "video": Video,
  "film": Film,

  /* =====================
   * Charts & Commerce
   * ===================== */
  "trending-up": TrendingUp,
  "bar-chart": BarChart,
  "pie-chart": PieChart,
  "cart": ShoppingCart,
  "credit-card": CreditCard,
  "dollar": DollarSign,
  "dollar-sign": DollarSign,

  /* =====================
   * Misc
   * ===================== */
  "home": Home,
  "building": Building,
  "file": File,
  "file-text": FileText,
  "files": Files,
  "trash": Trash,
  "trash-2": Trash2,
  "edit": Edit,
  "edit-2": Edit2,
  "plus": Plus,
  "arrow-right": ArrowRight,
  "external-link": ExternalLink,
  "loader": Loader,
  "battery": Battery,
  "bluetooth": Bluetooth,
  "printer": Printer,
  "palette": Palette,
  "feather": Feather,
  "map-pin": MapPin,
  "book": Book,
  "target": Target,
  "rss": Rss,
  "shuffle": Shuffle,
  "radio": Radio,
  "award": Award,
  "glasses": Glasses,
  "thumbs-up": ThumbsUp,
  "paperclip": Paperclip,
  "move": Move,
  "keyboard": Keyboard,
  "maximize": Maximize,
  "hash": Hash,
  "languages": Languages,
};
