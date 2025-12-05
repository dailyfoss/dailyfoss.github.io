"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

type ScriptLogoProps = {
    logo: string | null | undefined;
    name: string;
    className?: string;
};

export function ScriptLogo({ logo, name, className = "mr-1 w-4 h-4" }: ScriptLogoProps) {
    const [showFallback, setShowFallback] = useState(!logo || logo.trim() === "");

    // Reset fallback state when logo changes
    useEffect(() => {
        setShowFallback(!logo || logo.trim() === "");
    }, [logo]);

    if (showFallback) {
        return (
            <div className={`flex items-center justify-center bg-accent/20 rounded-full ${className}`}>
                <Icons.LayoutGrid className="w-3 h-3 text-muted-foreground" />
            </div>
        );
    }

    return (
        <img
            src={logo!}
            width={16}
            height={16}
            loading="lazy"
            alt={name}
            className={`${className} rounded-full object-cover`}
            onError={() => setShowFallback(true)}
        />
    );
}
