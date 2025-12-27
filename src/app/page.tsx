"use client";
import { ArrowRight, ChevronRight, ExternalLink, Heart, Sparkles, Star, TrendingUp, Zap } from "lucide-react";
import { FaFacebook, FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiHelm, SiDocker, SiKubernetes, SiTerraform, SiThreads } from "react-icons/si";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import NumberTicker from "@/components/ui/number-ticker";
import Particles from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repoName } from "@/config/site-config";
import { fetchCategories } from "@/lib/data";
import type { Category, Script } from "@/lib/types";

// Featured tools to highlight on homepage
const FEATURED_SLUGS = ["uptime-kuma", "nextcloud", "vaultwarden", "homepage", "immich", "jellyfin"];

export default function Page() {
  const { theme } = useTheme();
  const [color, setColor] = useState("#000000");
  const [featuredTools, setFeaturedTools] = useState<Script[]>([]);
  const [totalTools, setTotalTools] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  useEffect(() => {
    fetchCategories().then((categories: Category[]) => {
      const allScripts = categories.flatMap(cat => cat.scripts);
      const uniqueScripts = [...new Map(allScripts.map(s => [s.slug, s])).values()];
      
      setTotalTools(uniqueScripts.length);
      setTotalCategories(categories.filter(c => c.scripts.length > 0).length);
      
      // Get featured tools
      const featured = FEATURED_SLUGS
        .map(slug => uniqueScripts.find(s => s.slug === slug))
        .filter((s): s is Script => s !== undefined);
      setFeaturedTools(featured);
    });
  }, []);

  return (
    <div className="w-full">
      <Particles className="absolute inset-0 -z-40" quantity={80} ease={80} color={color} refresh />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Announcement Badge */}
            <Link href="/scripts">
              <AnimatedGradientText className="mb-8 cursor-pointer hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4 mr-2 text-[#ffaa40]" />
                <span className="text-sm">Discover new tools daily</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </AnimatedGradientText>
            </Link>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Your Gateway to
              <span className="block mt-2 bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Open Source
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              Curated collection of self-hosted apps and tools. Find, compare, and deploy 
              the best FOSS software with one-click deployment options.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/scripts">
                <Button size="lg" className="text-base px-8 h-12 group">
                  Explore Tools
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
                <a href={`https://github.com/dailyfoss/${repoName}`} target="_blank" rel="noopener noreferrer">
                  <FaGithub className="mr-2 h-5 w-5" />
                  Star on GitHub
                </a>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {totalTools > 0 ? <NumberTicker value={totalTools} /> : "—"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {totalCategories > 0 ? <NumberTicker value={totalCategories} /> : "—"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  Daily
                </div>
                <div className="text-sm text-muted-foreground mt-1">Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      {featuredTools.length > 0 && (
        <section className="py-16 border-t bg-gradient-to-b from-background to-accent/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Featured Tools</h2>
                <p className="text-muted-foreground mt-1">Popular open source software you can self-host</p>
              </div>
              <Link href="/scripts">
                <Button variant="ghost" className="hidden sm:flex">
                  View all <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTools.map((tool) => (
                <Link key={tool.slug} href={`/scripts?id=${tool.slug}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-accent/50 flex-shrink-0 flex items-center justify-center">
                          {tool.resources?.logo ? (
                            <img
                              src={tool.resources.logo}
                              alt={tool.name}
                              className="h-10 w-10 object-contain"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-muted-foreground">
                              {tool.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                            {tool.name}
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {tool.tagline || tool.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t">
                        {tool.metadata?.github_stars && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                            {(tool.metadata.github_stars / 1000).toFixed(1)}k
                          </div>
                        )}
                        {tool.metadata?.license && (
                          <Badge variant="secondary" className="text-xs">
                            {tool.metadata.license}
                          </Badge>
                        )}
                        {tool.deployment_methods?.docker && (
                          <Badge variant="outline" className="text-xs">
                            <SiDocker className="h-3 w-3 mr-1" />
                            Docker
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link href="/scripts">
                <Button variant="outline">
                  View all tools <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Deployment Methods Section */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Deploy Your Way</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every tool comes with multiple deployment options to fit your infrastructure
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { icon: SiDocker, name: "Docker", color: "#2496ED", desc: "Containers" },
              { icon: SiKubernetes, name: "Kubernetes", color: "#326CE5", desc: "Orchestration" },
              { icon: SiHelm, name: "Helm", color: "#0F1689", desc: "K8s Charts" },
              { icon: SiTerraform, name: "Terraform", color: "#7B42BC", desc: "IaC" },
              { icon: Zap, name: "Scripts", color: "#ffaa40", desc: "One-liners" },
            ].map((method) => (
              <div
                key={method.name}
                className="group flex flex-col items-center p-6 rounded-xl border-2 hover:border-primary/30 bg-card hover:bg-accent/30 transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${method.color}15` }}
                >
                  <method.icon className="h-6 w-6" style={{ color: method.color }} />
                </div>
                <span className="font-medium text-sm">{method.name}</span>
                <span className="text-xs text-muted-foreground">{method.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Daily FOSS Section */}
      <section className="py-16 border-t bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Why Daily FOSS?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We make discovering and deploying open source software simple
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: "Curated Collection",
                description: "Hand-picked tools verified for quality, security, and active maintenance",
              },
              {
                icon: Zap,
                title: "One-Click Deploy",
                description: "Ready-to-use deployment configs for Docker, Kubernetes, and more",
              },
              {
                icon: Heart,
                title: "Community Driven",
                description: "Open source project built by and for the FOSS community",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Join the Community</h2>
            <p className="text-muted-foreground">Stay updated with the latest FOSS discoveries</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            {[
              { icon: FaLinkedin, name: "LinkedIn", href: "https://linkedin.com/company/dailyfoss", color: "#0A66C2" },
              { icon: FaFacebook, name: "Facebook", href: "https://facebook.com/dailyfoss", color: "#1877F2" },
              { icon: SiThreads, name: "Threads", href: "https://threads.net/@dailyfoss", color: "currentColor" },
              { icon: FaXTwitter, name: "X", href: "https://x.com/dailyfoss", color: "currentColor" },
              { icon: FaGithub, name: "GitHub", href: `https://github.com/dailyfoss/${repoName}`, color: "currentColor" },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="flex items-center gap-2 px-5 py-3 rounded-full border-2 hover:border-primary/50 bg-card hover:bg-accent/50 transition-all duration-300">
                  <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" style={{ color: social.color }} />
                  <span className="font-medium text-sm">{social.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-2xl border bg-accent/5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to discover your next tool?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Browse our curated collection and find the perfect open source software for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/scripts">
                <Button size="lg" className="px-8">
                  Browse Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild>
                <a
                  href={`https://github.com/dailyfoss/${repoName}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contribute a Tool
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
