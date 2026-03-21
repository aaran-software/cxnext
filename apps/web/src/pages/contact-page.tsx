import { Mail, MapPin, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ContactPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="mesh-panel">
        <CardHeader>
          <Badge>Contact</Badge>
          <CardTitle>Talk to the product and implementation team.</CardTitle>
          <CardDescription>
            This page is a frontend contact surface only. It gives the project a reusable form and information layout for later backend hookup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: 'ops@cxnext.local' },
            { icon: Phone, label: 'Phone', value: '+91 44 4000 2026' },
            { icon: MapPin, label: 'HQ', value: 'Chennai, India' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-[1.25rem] border border-border/70 p-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/15">
                <item.icon className="size-5 text-accent" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request a workflow review</CardTitle>
          <CardDescription>
            Capture the basics now; wire it to CRM or ticketing once those modules exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Operations lead" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="team@company.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Northwind Retail" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scope">Scope</Label>
            <Input id="scope" placeholder="Commerce, finance, warehouse, desktop" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              className="min-h-36 rounded-[1.5rem] border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe the operating model or workflow gap you want reviewed."
            />
          </div>
          <Button className="w-fit">Send request</Button>
        </CardContent>
      </Card>
    </div>
  )
}
