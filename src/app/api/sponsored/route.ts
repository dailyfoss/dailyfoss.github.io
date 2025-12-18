import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { Script } from "@/lib/types";

export const dynamic = "force-static";

const metadataFileName = "metadata.json";
const versionFileName = "version.json";
const encoding = "utf-8";

async function getSponsoredSlugs() {
  const jsonDir = path.join(process.cwd(), "public", "json");
  const filePaths = (await fs.readdir(jsonDir))
    .filter(fileName =>
      fileName.endsWith(".json")
      && fileName !== metadataFileName
      && fileName !== versionFileName,
    )
    .map(fileName => path.join(jsonDir, fileName));

  const sponsoredSlugs: string[] = [];

  for (const filePath of filePaths) {
    const fileContent = await fs.readFile(filePath, encoding);
    const script: Script = JSON.parse(fileContent);
    
    // Only include slug if sponsored
    if (script.metadata?.sponsored === true && script.slug) {
      sponsoredSlugs.push(script.slug);
    }
  }

  return sponsoredSlugs;
}

export async function GET() {
  try {
    const sponsoredSlugs = await getSponsoredSlugs();

    return NextResponse.json({
      success: true,
      count: sponsoredSlugs.length,
      slugs: sponsoredSlugs,
    });
  }
  catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch sponsored slugs" 
      },
      { status: 500 },
    );
  }
}
