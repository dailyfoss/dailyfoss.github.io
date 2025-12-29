interface BrowserMockupProps {
  screenshot: string
  alt: string
  className?: string
}

export function BrowserMockup({ screenshot, alt, className = "" }: BrowserMockupProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden border border-border bg-background shadow-lg ${className}`}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-background border border-border rounded px-3 py-0.5 text-xs text-muted-foreground max-w-[200px] truncate">
            {alt}
          </div>
        </div>
      </div>
      
      {/* Screenshot */}
      <div className="relative aspect-video bg-muted">
        <img
          src={screenshot}
          alt={alt}
          className="w-full h-full object-cover object-top"
        />
      </div>
    </div>
  )
}
