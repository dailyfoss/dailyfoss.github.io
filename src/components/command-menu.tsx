import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import React from "react";

import type { Category, Script } from "@/lib/types";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScriptLogo } from "@/app/scripts/_components/script-logo";
import { fetchCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

function getRandomScript(categories: Category[], previouslySelected: Set<string> = new Set()): Script | null {
  const allScripts = categories.flatMap(cat => cat.scripts || []);
  if (allScripts.length === 0)
    return null;

  const availableScripts = allScripts.filter(script => !previouslySelected.has(script.slug));
  if (availableScripts.length === 0) {
    return allScripts[Math.floor(Math.random() * allScripts.length)];
  }
  const idx = Math.floor(Math.random() * availableScripts.length);
  return availableScripts[idx];
}

function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [links, setLinks] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedScripts, setSelectedScripts] = React.useState<Set<string>>(new Set());
  const router = useRouter();

  const fetchSortedCategories = () => {
    setIsLoading(true);
    fetchCategories()
      .then((categories) => {
        setLinks(categories);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error(error);
      });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fetchSortedCategories();
        setOpen(open => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenRandomScript = async () => {
    if (links.length === 0) {
      setIsLoading(true);
      try {
        const categories = await fetchCategories();
        setLinks(categories);
        const randomScript = getRandomScript(categories, selectedScripts);
        if (randomScript) {
          setSelectedScripts(prev => new Set([...prev, randomScript.slug]));
          router.push(`/scripts?id=${randomScript.slug}`);
        }
      }
      finally {
        setIsLoading(false);
      }
    }
    else {
      const randomScript = getRandomScript(links, selectedScripts);
      if (randomScript) {
        setSelectedScripts(prev => new Set([...prev, randomScript.slug]));
        router.push(`/scripts?id=${randomScript.slug}`);
      }
    }
  };

  const getUniqueScriptsMap = React.useCallback(() => {
    const scriptMap = new Map<string, { script: Script; categoryName: string }>();
    for (const category of links) {
      for (const script of category.scripts) {
        if (!scriptMap.has(script.slug)) {
          scriptMap.set(script.slug, { script, categoryName: category.name });
        }
      }
    }
    return scriptMap;
  }, [links]);

  const getUniqueScriptsByCategory = React.useCallback(() => {
    const scriptMap = getUniqueScriptsMap();
    const categoryOrder = links.map(cat => cat.name);
    const grouped: Record<string, Script[]> = {};

    for (const name of categoryOrder) {
      grouped[name] = [];
    }

    for (const { script, categoryName } of scriptMap.values()) {
      if (grouped[categoryName]) {
        grouped[categoryName].push(script);
      }
      else {
        grouped[categoryName] = [script];
      }
    }

    Object.keys(grouped).forEach((cat) => {
      if (grouped[cat].length === 0)
        delete grouped[cat];
    });

    return grouped;
  }, [getUniqueScriptsMap, links]);

  const uniqueScriptsByCategory = getUniqueScriptsByCategory();

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className={cn(
            "relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-32 lg:w-52",
          )}
          onClick={() => {
            fetchSortedCategories();
            setOpen(true);
          }}
        >
          <span className="inline-flex">Search scripts...</span>
          <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>
            K
          </kbd>
        </Button>

        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenRandomScript}
                disabled={isLoading}
                className="hidden lg:flex"
                aria-label="Open Random Script"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleOpenRandomScript();
                  }
                }}
              >
                <Sparkles className="size-4" />
                <span className="sr-only">Open Random Script</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Random Script</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search scripts</DialogTitle>
        <CommandInput placeholder="Search for a script..." />
        <CommandList>
          <CommandEmpty>{isLoading ? "Loading..." : "No scripts found."}</CommandEmpty>
          {Object.entries(uniqueScriptsByCategory).map(([categoryName, scripts]) => (
            <CommandGroup key={`category:${categoryName}`} heading={categoryName}>
              {scripts.map(script => (
                <CommandItem
                  key={`script:${script.slug}`}
                  value={`${script.name}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/scripts?id=${script.slug}`);
                  }}
                  tabIndex={0}
                  aria-label={`Open script ${script.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setOpen(false);
                      router.push(`/scripts?id=${script.slug}`);
                    }
                  }}
                >
                  <div className="flex gap-2 items-center" onClick={() => setOpen(false)}>
                    <ScriptLogo 
                      logo={script.resources?.logo} 
                      logo_light={script.resources?.logo_light}
                      name={script.name} 
                      className="w-5 h-5" 
                    />
                    <span>{script.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default CommandMenu;
