"use client";
import { ArrowRightIcon, BookOpen, Code2, Rocket, Shield, Users, Zap } from "lucide-react";
import { FaFacebook, FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiHelm, SiDocker, SiKubernetes, SiTerraform } from "react-icons/si";
import { useEffect, useState } from "react";
import { SiThreads } from "react-icons/si";
import { useTheme } from "next-themes";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { Separator } from "@/components/ui/separator";
import Particles from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import { repoName } from "@/config/site-config";
import { cn } from "@/lib/utils";

function CustomArrowRightIcon() {
  return <ArrowRightIcon className="h-4 w-4" width={1} />;
}

export default function Page() {
  const { theme } = useTheme();

  const [color, setColor] = useState("#000000");

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  return (
    <>
      <div className="w-full mt-16">
        <Particles className="absolute inset-0 -z-40" quantity={100} ease={80} color={color} refresh />
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="flex min-h-[85vh] flex-col items-center justify-center gap-6 py-20 lg:py-32">
            <Dialog>
              <DialogTrigger>
                <div>
                  <AnimatedGradientText>
                    <div
                      className={cn(
                        `absolute inset-0 block size-full animate-gradient bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:var(--bg-size)_100%] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]`,
                        `p-px ![mask-composite:subtract]`,
                      )}
                    />
                    ❤️
                    {" "}
                    <Separator className="mx-2 h-4" orientation="vertical" />
                    <span
                      className={cn(
                        `animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                        `inline`,
                      )}
                    >
                      Your Daily FOSS Discovery
                    </span>
                  </AnimatedGradientText>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About Daily FOSS</DialogTitle>
                  <DialogDescription>
                    Daily FOSS is your go-to platform for discovering and deploying free and open source software.
                    We curate the best FOSS projects with easy deployment options across multiple platforms.
                  </DialogDescription>
                </DialogHeader>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full" asChild>
                    <a
                      href={`https://github.com/dailyfoss/${repoName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <FaGithub className="mr-2 h-4 w-4" />
                      {" "}
                      View on GitHub
                    </a>
                  </Button>
                </CardFooter>
              </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-6 items-center">
              <h1 className="max-w-4xl text-center text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Discover & Deploy
                {" "}
                <span className="bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-clip-text text-transparent">
                  Open Source
                </span>
                {" "}
                Tools Daily
              </h1>
              <p className="max-w-2xl text-center text-lg leading-relaxed text-muted-foreground md:text-xl">
                Your curated platform for exploring and deploying free and open source software.
                From self-hosted apps to cloud solutions, we make FOSS accessible to everyone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/scripts">
                <Button
                  size="lg"
                  variant="expandIcon"
                  Icon={CustomArrowRightIcon}
                  iconPlacement="right"
                  className="text-base"
                >
                  Explore Tools
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild className="text-base">
                <a
                  href={`https://github.com/dailyfoss/${repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="mr-2 h-5 w-5" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="py-16 border-y">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#ffaa40] to-[#9c40ff] bg-clip-text text-transparent">
                  Curated
                </div>
                <div className="text-muted-foreground">FOSS Collection</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#9c40ff] to-[#ffaa40] bg-clip-text text-transparent">
                  Multi-Platform
                </div>
                <div className="text-muted-foreground">Deployment Options</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#ffaa40] to-[#9c40ff] bg-clip-text text-transparent">
                  Daily
                </div>
                <div className="text-muted-foreground">New Discoveries</div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-24" id="features">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter md:text-5xl mb-4">
                What We Offer
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Your complete platform for discovering and deploying free and open source software
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ffaa40]/20 to-[#9c40ff]/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-[#ffaa40]" />
                  </div>
                  <CardTitle>Quick Deployment</CardTitle>
                  <CardDescription>
                    Deploy with scripts, Docker, Kubernetes, or Terraform. Choose the method that works best for you.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9c40ff]/20 to-[#ffaa40]/20 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-[#9c40ff]" />
                  </div>
                  <CardTitle>Trusted & Verified</CardTitle>
                  <CardDescription>
                    Every tool is carefully curated and verified for security, reliability, and active maintenance.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ffaa40]/20 to-[#9c40ff]/20 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-[#ffaa40]" />
                  </div>
                  <CardTitle>Community Powered</CardTitle>
                  <CardDescription>
                    Built by the FOSS community. Contribute, suggest new tools, and help others discover great software.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9c40ff]/20 to-[#ffaa40]/20 flex items-center justify-center mb-4">
                    <Code2 className="h-6 w-6 text-[#9c40ff]" />
                  </div>
                  <CardTitle>Cross-Platform</CardTitle>
                  <CardDescription>
                    Find tools for Linux, Windows, macOS, web, mobile, and more. All in one place.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ffaa40]/20 to-[#9c40ff]/20 flex items-center justify-center mb-4">
                    <Rocket className="h-6 w-6 text-[#ffaa40]" />
                  </div>
                  <CardTitle>Rich Metadata</CardTitle>
                  <CardDescription>
                    Detailed information including platforms, deployment methods, documentation, and default credentials.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9c40ff]/20 to-[#ffaa40]/20 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-[#9c40ff]" />
                  </div>
                  <CardTitle>Always Updated</CardTitle>
                  <CardDescription>
                    Daily updates with new tools, features, and improvements. Never miss out on the latest FOSS.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="py-20 border-t">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                  Join Our Community
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Stay updated with the latest FOSS discoveries and connect with fellow enthusiasts
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <a
                  href="https://linkedin.com/company/dailyfoss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="relative overflow-hidden border-2 hover:border-[#0A66C2]/50 hover:shadow-lg hover:shadow-[#0A66C2]/10 transition-all duration-300 cursor-pointer h-full">
                    <CardHeader className="text-center p-6">
                      <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-[#0A66C2]/10 to-[#0A66C2]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FaLinkedin className="h-8 w-8 text-[#0A66C2]" />
                      </div>
                      <CardTitle className="text-lg mb-2">LinkedIn</CardTitle>
                      <CardDescription className="text-xs">
                        Professional updates
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </a>

                <a
                  href="https://facebook.com/dailyfoss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="relative overflow-hidden border-2 hover:border-[#1877F2]/50 hover:shadow-lg hover:shadow-[#1877F2]/10 transition-all duration-300 cursor-pointer h-full">
                    <CardHeader className="text-center p-6">
                      <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-[#1877F2]/10 to-[#1877F2]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FaFacebook className="h-8 w-8 text-[#1877F2]" />
                      </div>
                      <CardTitle className="text-lg mb-2">Facebook</CardTitle>
                      <CardDescription className="text-xs">
                        Community posts
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </a>

                <a
                  href="https://threads.net/@dailyfoss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer h-full">
                    <CardHeader className="text-center p-6">
                      <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <SiThreads className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-lg mb-2">Threads</CardTitle>
                      <CardDescription className="text-xs">
                        Quick updates
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </a>

                <a
                  href="https://x.com/dailyfoss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="relative overflow-hidden border-2 hover:border-foreground/50 hover:shadow-lg hover:shadow-foreground/10 transition-all duration-300 cursor-pointer h-full">
                    <CardHeader className="text-center p-6">
                      <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FaXTwitter className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-lg mb-2">X (Twitter)</CardTitle>
                      <CardDescription className="text-xs">
                        Daily highlights
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </a>
              </div>
            </div>
          </div>

          {/* Deployment Options Section */}
          <div className="py-20 border-t bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                  Deploy Your Way
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Choose from multiple deployment methods to fit your infrastructure and workflow
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                <Card className="group relative overflow-hidden border-2 hover:border-[#4B8BBE]/50 hover:shadow-lg hover:shadow-[#4B8BBE]/10 transition-all duration-300 cursor-pointer">
                  <CardHeader className="text-center p-6">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-[#4B8BBE]/10 to-[#4B8BBE]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Code2 className="h-8 w-8 text-[#4B8BBE]" />
                    </div>
                    <CardTitle className="text-lg mb-2">Script</CardTitle>
                    <CardDescription className="text-xs">
                      Quick bash scripts
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="group relative overflow-hidden border-2 hover:border-[#0F1689]/50 hover:shadow-lg hover:shadow-[#0F1689]/10 transition-all duration-300 cursor-pointer">
                  <CardHeader className="text-center p-6">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-[#0F1689]/10 to-[#0F1689]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <SiHelm className="h-8 w-8 text-[#0F1689]" />
                    </div>
                    <CardTitle className="text-lg mb-2">Helm</CardTitle>
                    <CardDescription className="text-xs">
                      K8s package manager
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="group relative overflow-hidden border-2 hover:border-[#2496ED]/50 hover:shadow-lg hover:shadow-[#2496ED]/10 transition-all duration-300 cursor-pointer">
                  <CardHeader className="text-center p-6">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-[#2496ED]/10 to-[#2496ED]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <SiDocker className="h-8 w-8 text-[#2496ED]" />
                    </div>
                    <CardTitle className="text-lg mb-2">Docker</CardTitle>
                    <CardDescription className="text-xs">
                      Container platform
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="group relative overflow-hidden border-2 hover:border-[#326CE5]/50 hover:shadow-lg hover:shadow-[#326CE5]/10 transition-all duration-300 cursor-pointer">
                  <CardHeader className="text-center p-6">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-[#326CE5]/10 to-[#326CE5]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <SiKubernetes className="h-8 w-8 text-[#326CE5]" />
                    </div>
                    <CardTitle className="text-lg mb-2">Kubernetes</CardTitle>
                    <CardDescription className="text-xs">
                      Container orchestration
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="group relative overflow-hidden border-2 hover:border-[#7B42BC]/50 hover:shadow-lg hover:shadow-[#7B42BC]/10 transition-all duration-300 cursor-pointer col-span-2 md:col-span-3 lg:col-span-1">
                  <CardHeader className="text-center p-6">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-[#7B42BC]/10 to-[#7B42BC]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <SiTerraform className="h-8 w-8 text-[#7B42BC]" />
                    </div>
                    <CardTitle className="text-lg mb-2">Terraform</CardTitle>
                    <CardDescription className="text-xs">
                      Infrastructure as code
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-24">
            <div className="max-w-4xl mx-auto text-center border rounded-2xl p-12 bg-gradient-to-br from-[#ffaa40]/5 to-[#9c40ff]/5">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                Ready to Explore?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Start discovering amazing free and open source software. Find the perfect tools for your next project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/scripts">
                  <Button
                    size="lg"
                    variant="expandIcon"
                    Icon={CustomArrowRightIcon}
                    iconPlacement="right"
                  >
                    Browse All Tools
                  </Button>
                </Link>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href={`https://github.com/dailyfoss/${repoName}/blob/main/CONTRIBUTING.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contribute
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
