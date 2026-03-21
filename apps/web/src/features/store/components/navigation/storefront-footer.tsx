import { FacebookIcon, InstagramIcon, MailIcon, MapPinIcon, PhoneIcon, TwitterIcon, YoutubeIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { BrandMark } from "@/shared/branding/brand-mark"

export function StorefrontFooter() {
  return (
    <footer className="w-full border-t border-border/70 bg-card/60 pt-16 pb-8">
      <div className="mx-auto w-full px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8">
          <div className="space-y-6 lg:col-span-2 lg:pr-8">
            <Link to="/" className="inline-block">
              <BrandMark />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your premier destination for multi-vendor commerce. Discover curated products from trusted sellers around the world, all in one unified shopping experience with faster checkout flows.
            </p>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="size-4 shrink-0" />
                <a href="tel:+918000000000" className="transition-colors hover:text-foreground">+91 80000 00000</a>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="size-4 shrink-0" />
                <a href="mailto:support@cxnext.app" className="transition-colors hover:text-foreground">support@cxnext.app</a>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Top Categories</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/category/electronics" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Electronics & Gadgets</Link></li>
              <li><Link to="/category/fashion" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Fashion & Apparel</Link></li>
              <li><Link to="/category/home-decor" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Home & Furniture</Link></li>
              <li><Link to="/category/beauty" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Beauty & Personal Care</Link></li>
              <li><Link to="/category/sports" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Sports & Outdoors</Link></li>
              <li><Link to="/search" className="inline-block font-medium text-foreground transition-transform hover:-translate-y-0.5 hover:text-primary">View All Categories {"->"}</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Help & Support</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/help" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Help Center / FAQ</Link></li>
              <li><Link to="/account/orders" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Track Your Order</Link></li>
              <li><Link to="/returns" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Returns & Exchanges</Link></li>
              <li><Link to="/shipping" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Shipping Information</Link></li>
              <li><Link to="/contact" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">About Us</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Our Story</Link></li>
              <li><Link to="/careers" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Careers</Link></li>
              <li><Link to="/vendor" className="inline-block font-medium text-primary transition-transform hover:-translate-y-0.5 hover:text-primary/80">Become a Seller</Link></li>
              <li><Link to="/press" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Press & News</Link></li>
              <li><Link to="/investors" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Investor Relations</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Legal & Policies</h3>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li><Link to="/terms" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Accessibility</Link></li>
              <li><Link to="/shipping-carriers" className="inline-block transition-transform hover:-translate-y-0.5 hover:text-primary">Shipping Carriers</Link></li>
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
            {"©"} {new Date().getFullYear()} CODEXSUN. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

