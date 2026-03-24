import { Blocks, BrushCleaning, Component, Workflow } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    icon: Component,
    title: "UI Systems",
    copy: "Reusable components, token-driven theming, and scalable layout composition.",
  },
  {
    icon: Workflow,
    title: "Frontend Architecture",
    copy: "Route design, mode-specific shells, and progressive rollout paths for multi-surface products.",
  },
  {
    icon: BrushCleaning,
    title: "Refactors",
    copy: "Migration of copied UI blocks into maintainable folders, imports, and runtime configuration.",
  },
  {
    icon: Blocks,
    title: "Feature Expansion",
    copy: "Structured foundations for adding future targets beyond app, web, and shop.",
  },
]

export function ServicesPage() {
  return (
    <div className="space-y-8">
      <Card className="mesh-panel">
        <CardHeader className="p-8 sm:p-10">
          <Badge>Services</Badge>
          <CardTitle className="max-w-4xl text-4xl sm:text-5xl">
            Frontend systems built for multiple product surfaces, not single-page shortcuts.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base">
            The current setup supports ERP billing, portfolio websites, and online storefronts through one typed frontend target switch.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {services.map((service) => (
          <Card key={service.title}>
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/15">
                <service.icon className="size-5 text-accent" />
              </div>
              <CardTitle>{service.title}</CardTitle>
              <CardDescription>{service.copy}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              This service area is presented as a reusable portfolio page so it can be extended later with case studies, pricing, or delivery models.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
