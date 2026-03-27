import { ShieldCheck, SplitSquareVertical, SwatchBook } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AboutPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card className="mesh-panel">
        <CardHeader className="p-8 sm:p-10">
          <Badge>About codexsun</Badge>
          <CardTitle className="text-4xl sm:text-5xl">
            A shared TypeScript platform for commerce, ERP, and desktop operations.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base">
            The repository architecture keeps domain contracts in shared packages and uses the web client as a presentation surface. This UI increment respects that split while creating a stronger frontend base.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {[
          {
            icon: SplitSquareVertical,
            title: 'Layer discipline',
            body: 'Layouts and pages only compose presentation. Business rules remain in shared or backend modules.',
          },
          {
            icon: ShieldCheck,
            title: 'Safe messaging',
            body: 'Auth and dashboard surfaces are clearly framed as UI scaffolding until real workflows exist.',
          },
          {
            icon: SwatchBook,
            title: 'Reusable direction',
            body: 'Theme tokens, spacing, and component patterns are set up for future feature expansion instead of page-by-page styling drift.',
          },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/15">
                <item.icon className="size-5 text-accent" />
              </div>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
