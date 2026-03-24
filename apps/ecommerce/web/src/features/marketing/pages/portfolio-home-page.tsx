import { ArrowRight, Globe2, LayoutTemplate, MonitorSmartphone, PenTool } from "lucide-react"
import { Link } from "react-router-dom"

import { frontendLabels } from "@/config/frontend"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    icon: LayoutTemplate,
    title: "Site Design Systems",
    copy: "Reusable layouts, content modules, and UI primitives for branded website rollouts.",
  },
  {
    icon: MonitorSmartphone,
    title: "Responsive Frontends",
    copy: "Single-source experiences tuned for desktop, tablet, and mobile delivery.",
  },
  {
    icon: PenTool,
    title: "Content-Ready Pages",
    copy: "Structured marketing pages that can be extended into portfolios, landing pages, and case studies.",
  },
]

export function PortfolioHomePage() {
  return (
    <div className="space-y-8 pb-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="mesh-panel overflow-hidden">
          <CardHeader className="gap-4 p-8 sm:p-10">
            <Badge>{frontendLabels.web}</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold leading-none tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Portfolio-ready websites on the same frontend foundation as the rest of the platform.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                This mode focuses on public-facing sites: branded homepages, service sections, contact flows, and clean login handoff into the application.
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 border-t border-border/60 bg-background/30 p-8">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent-light">
              <Link to="/services">
                Explore services
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-accent/20 hover:bg-accent hover:text-accent-foreground"
            >
              <Link to="/login">Open login</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline">Why this mode</Badge>
            <CardTitle>Built for portfolio surfaces</CardTitle>
            <CardDescription>
              When `VITE_FRONTEND_TARGET=web`, the app opens directly into a portfolio-style shell instead of the store or ERP login-first flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Shared design tokens across public and authenticated surfaces",
              "A clean top-level menu for home, about, services, and contact",
              "Direct login CTA without exposing store-specific navigation",
            ].map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title}>
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/15">
                <service.icon className="size-5 text-accent" />
              </div>
              <CardTitle>{service.title}</CardTitle>
              <CardDescription>{service.copy}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section>
        <Card className="mesh-panel">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe2 className="size-5 text-accent" />
              <CardTitle>One repo, multiple frontend targets</CardTitle>
            </div>
            <CardDescription>
              Switch the target in Vite and the same app can boot as ERP billing, a portfolio website, or an online store.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  )
}
