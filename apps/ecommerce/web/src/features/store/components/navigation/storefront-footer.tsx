import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import { BrandMark } from "@/shared/branding/brand-mark"
import { useBranding } from "@/shared/branding/branding-provider"

export function StorefrontFooter() {
  const branding = useBranding()

  return (
    <footer className="w-full border-t border-border/70 bg-card/60 pb-8 pt-16">
      <div className="mx-auto w-full px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8">
          <div className="space-y-6 lg:col-span-2 lg:pr-8">
            <Link to="/" className="inline-block">
              <BrandMark />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">{branding.summary}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Direct-from-factory knitwear, hosiery basics, and export-style garment programs built for Tiruppur textile selling.
            </p>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                <span>{branding.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="size-4 shrink-0" />
                <a
                  href={`tel:${branding.phone.replace(/\D/g, "")}`}
                  className="transition-colors hover:text-foreground"
                >
                  {branding.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="size-4 shrink-0" />
                <a
                  href={`mailto:${branding.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {branding.email}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Top Categories</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/search" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Men's Knitwear</Link></li>
              <li><Link to="/search" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Women's Knitwear</Link></li>
              <li><Link to="/search" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Kids and Infantwear</Link></li>
              <li><Link to="/search" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Inner Wears</Link></li>
              <li><Link to="/search" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Corporate and Festival Tees</Link></li>
              <li><Link to="/search" className="inline-block font-medium text-foreground transition-transform hover:-translate-y-0.5 hover:text-primary">View All Categories {"->"}</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Order Support</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/account/orders" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Track Factory Dispatch</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Bulk Order Enquiry</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Sampling and Sourcing</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Size and Fit Assistance</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Contact Textile Desk</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">About The Brand</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Tiruppur Story</Link></li>
              <li><Link to="/about" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Factory-Direct Promise</Link></li>
              <li><Link to="/services" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Private Label Support</Link></li>
              <li><Link to="/services" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Retail and Wholesale Supply</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Join as Buying Partner</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Trade Information</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Terms & Conditions</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Shipping Information</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Returns & Exchanges</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Compliance and Documentation</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-border/60">
        <div className="mx-auto flex w-full flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row md:px-12 lg:px-16">
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" className="flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-md dark:hover:bg-white dark:hover:text-black">
              <FacebookIcon className="size-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-md dark:hover:bg-white dark:hover:text-black">
              <TwitterIcon className="size-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-md dark:hover:bg-white dark:hover:text-black">
              <InstagramIcon className="size-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-md dark:hover:bg-white dark:hover:text-black">
              <YoutubeIcon className="size-5" />
              <span className="sr-only">YouTube</span>
            </a>
          </div>

          <div className="text-center text-sm text-muted-foreground md:text-right">
            {"©"} {new Date().getFullYear()} {branding.brandName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
