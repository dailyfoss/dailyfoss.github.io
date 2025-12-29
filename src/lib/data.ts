import type { Category } from "./types";

// Permanent in-memory cache for categories (persists across navigations)
let categoriesCache: Category[] | null = null;

export async function fetchCategories(): Promise<Category[]> {
  // Return cached data if available
  if (categoriesCache) {
    return categoriesCache;
  }

  const response = await fetch(`/api/categories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  const categories: Category[] = await response.json();
  
  // Cache permanently
  categoriesCache = categories;
  
  return categories;
}

// Force refresh categories (call this if you need fresh data)
export async function refreshCategories(): Promise<Category[]> {
  categoriesCache = null;
  return fetchCategories();
}

export async function fetchVersions() {
  const response = await fetch(`/api/versions`);
  if (!response.ok) {
    throw new Error(`Failed to fetch versions: ${response.statusText}`);
  }
  return response.json();
}
