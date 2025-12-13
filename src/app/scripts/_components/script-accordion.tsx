import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import Link from "next/link";

import type { Category } from "@/lib/types";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import { ScriptLogo } from "./script-logo";

function getCategoryIcon(iconName: string) {
  // Convert kebab-case to PascalCase for Lucide icon names
  const pascalCaseName = iconName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const IconComponent = (Icons as any)[pascalCaseName];
  return IconComponent ? <IconComponent className="size-4 text-[#0083c3] mr-2" /> : null;
}

export default function ScriptAccordion({
  items,
  selectedScript,
  setSelectedScript,
  selectedCategory,
  setSelectedCategory,
  onItemSelect,
}: {
  items: Category[];
  selectedScript: string | null;
  setSelectedScript: (script: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  onItemSelect?: () => void;
}) {
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);
  const linkRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const isUserInteractionRef = useRef(false);

  const handleAccordionChange = (value: string | undefined) => {
    isUserInteractionRef.current = true;
    setExpandedItem(value);
  };

  useEffect(() => {
    // Skip if user is manually interacting with accordion
    if (isUserInteractionRef.current) {
      isUserInteractionRef.current = false;
      return;
    }

    if (selectedScript && items.length > 0) {
      let category;

      // If we have a selected category, try to find the script in that specific category
      if (selectedCategory) {
        category = items.find(
          cat => cat.name === selectedCategory && cat.scripts.some(script => script.slug === selectedScript),
        );
      }

      // Fallback: if no category is selected or script not found in selected category,
      // use the first category containing the script (backward compatibility)
      if (!category) {
        category = items.find(category => category.scripts.some(script => script.slug === selectedScript));
      }

      // Update to the category containing the selected script
      if (category) {
        setExpandedItem(category.name);
      }
    }
  }, [selectedScript, selectedCategory, items]);

  // Group categories by their group field
  const groupedCategories = items.reduce((acc, category) => {
    const group = category.group || "Other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  const groupOrder = ["Platform & Infrastructure", "Development", "Networking", "Media & Content", "Business & Productivity", "Security & Monitoring", "Other"];
  const orderedGroups = groupOrder.filter(group => groupedCategories[group]);

  return (
    <Accordion
      type="single"
      value={expandedItem}
      onValueChange={handleAccordionChange}
      collapsible
      className="overflow-y-scroll sm:max-h-[calc(100vh-209px)] overflow-x-hidden p-1"
    >
      {orderedGroups.map((groupName, groupIndex) => (
        <div key={groupName}>
          {groupIndex > 0 && (
            <div className="my-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          )}
          <div className="mb-2 mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {groupName}
          </div>
          {groupedCategories[groupName].map(category => (
            <AccordionItem
              key={`${category.id}:category`}
              value={category.name}
              className={cn("sm:text-sm flex flex-col border-none", {
                "rounded-lg bg-accent/30": expandedItem === category.name,
              })}
            >
              <AccordionTrigger
                className={cn(
                  "duration-250 rounded-lg transition ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-accent",
                )}
              >
                <div className="mr-2 flex w-full items-center justify-between">
                  <div className="flex items-center pl-2 text-left">
                    {getCategoryIcon(category.icon)}
                    <span>
                      {category.name}
                      {" "}
                    </span>
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-blue-500/30 to-blue-600/40 px-2.5 py-1 text-sm font-bold text-blue-800 hover:no-underline dark:from-blue-400/30 dark:to-blue-500/40 dark:text-blue-200 border border-blue-400/40 dark:border-blue-400/50">
                    {category.scripts.length}
                  </span>
                </div>
                {" "}
              </AccordionTrigger>
              <AccordionContent data-state={expandedItem === category.name ? "open" : "closed"} className="pt-0">
                {category.scripts
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((script, index) => (
                    <div key={index}>
                      <Link
                        href={{
                          pathname: "/scripts",
                          query: { id: script.slug, category: category.name },
                        }}
                        prefetch={false}
                        className={`flex cursor-pointer items-center justify-between gap-1 px-1 py-1 text-muted-foreground hover:rounded-lg hover:bg-accent/60 hover:dark:bg-accent/20 ${selectedScript === script.slug
                          ? "rounded-lg bg-accent font-semibold dark:bg-accent/30 dark:text-white"
                          : ""
                          }`}
                        onClick={(e) => {
                          // Prevent default Link behavior
                          e.preventDefault();

                          // Update state directly (no URL params)
                          setSelectedScript(script.slug);
                          setSelectedCategory(category.name);

                          // Call onItemSelect for mobile sidebar closing
                          onItemSelect?.();
                        }}
                        ref={(el) => {
                          linkRefs.current[script.slug] = el;
                        }}
                      >
                        <div className="flex items-center">
                          <ScriptLogo 
                            logo={script.resources?.logo} 
                            logo_light={script.resources?.logo_light}
                            name={script.name} 
                          />
                          <span className="flex items-center gap-2">{script.name}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </div>
      ))}
    </Accordion>
  );
}
