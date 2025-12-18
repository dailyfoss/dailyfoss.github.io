"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

import { BasicInfoStep } from "./_components/basic-info-step";
import { ResourcesStep } from "./_components/resources-step";
import { FeaturesStep } from "./_components/features-step";
import { PlatformStep } from "./_components/platform-step";
import { ReviewStep } from "./_components/review-step";
import type { AppFormData } from "./_components/types";

const STEPS = [
  { id: 1, name: "Basic Info", description: "Name, description, category" },
  { id: 2, name: "Resources", description: "Links, logo, repository" },
  { id: 3, name: "Features", description: "Key features of your app" },
  { id: 4, name: "Platform", description: "Deployment & hosting options" },
  { id: 5, name: "Review", description: "Review and download JSON" },
];

export default function AddAppPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AppFormData>({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    categories: [],
    resources: {
      website: "",
      documentation: "",
      source_code: "",
      logo: "",
      logo_light: "",
    },
    features: [],
    platform_support: {
      desktop: { linux: false, windows: false, macos: false },
      mobile: { android: false, ios: false },
      web_app: false,
      browser_extension: false,
      cli_only: false,
    },
    hosting_options: {
      self_hosted: false,
      managed_cloud: false,
      saas: false,
    },
    interfaces: {
      cli: false,
      gui: false,
      web_ui: false,
      api: false,
      tui: false,
    },
    deployment_methods: {
      script: false,
      docker: false,
      docker_compose: false,
      helm: false,
      kubernetes: false,
      terraform: false,
    },
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data: Partial<AppFormData>) => {
    setFormData({ ...formData, ...data });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/scripts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scripts
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            Add Your App to
            {" "}
            <span className="bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-clip-text text-transparent">
              Daily FOSS
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Share your open-source project with the community
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  index < STEPS.length - 1 ? "border-r border-border" : ""
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="text-xs font-medium hidden sm:block">{step.name}</div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {STEPS[currentStep - 1].name}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <BasicInfoStep data={formData} onChange={updateFormData} />}
            {currentStep === 2 && <ResourcesStep data={formData} onChange={updateFormData} />}
            {currentStep === 3 && <FeaturesStep data={formData} onChange={updateFormData} />}
            {currentStep === 4 && <PlatformStep data={formData} onChange={updateFormData} />}
            {currentStep === 5 && <ReviewStep data={formData} />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {currentStep < STEPS.length
            ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )
            : null}
        </div>
      </div>
    </div>
  );
}
