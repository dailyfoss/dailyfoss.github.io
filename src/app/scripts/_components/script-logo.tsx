"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

type ScriptLogoProps = {
    logo: string | null | undefined;
    logo_light?: string | null | undefined;
    name: string;
    className?: string;
};

export function ScriptLogo({ logo, logo_light, name, className = "mr-1 w-4 h-4" }: ScriptLogoProps) {
    const [showFallback, setShowFallback] = useState(!logo || logo.trim() === "");
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Detect theme changes
    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };

        checkTheme();
        
        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    // Get the appropriate logo based on theme
    // In dark mode, use light variant if available (for visibility)
    const currentLogo = (theme === 'dark' && logo_light) ? logo_light : logo;

    // Reset fallback state when logo changes
    useEffect(() => {
        setShowFallback(!currentLogo || currentLogo.trim() === "");
    }, [currentLogo]);

    if (showFallback) {
        return (
            <div className={`flex items-center justify-center bg-accent/20 rounded-full ${className}`}>
                <Icons.LayoutGrid className="w-3 h-3 text-muted-foreground" />
            </div>
        );
    }

    return (
        <img
            src={currentLogo || ''}
            width={16}
            height={16}
            loading="lazy"
            alt={name}
            className={`${className} rounded-full object-cover`}
            onError={() => setShowFallback(true)}
        />
    );
}
