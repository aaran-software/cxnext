# Planning

## Current Batch

### Goal

Refine the ecommerce storefront mobile navigation:

1. remove duplicated mobile navigation actions from the sticky top header
2. add a right-side hamburger drawer for secondary storefront shortcuts
3. keep the mobile search bar at the top inside the sticky header
4. keep account access readable in the bottom nav without the filled icon state
5. remove floating overlay actions that compete with storefront content
6. make hero slider imagery fit inside the frame without center-cropping the product

### Execution Checklist

- [x] patch `ASSIST/AI_RULES.md` with the requested coding style guidance
- [x] add a dedicated storefront mobile header component
- [x] update the storefront drawer and bottom nav behavior
- [x] restore the storefront mobile bottom nav in the storefront shell
- [x] remove the storefront mobile search and top hamburger from the header
- [x] move the hamburger trigger into the bottom navigation
- [x] add safe-area spacing so the bottom navigation stays usable with mobile gestures
- [x] restore the mobile search bar with storefront branding at the top
- [x] place the mobile logo and search bar in a single row
- [x] expand the hero slider to full-bleed mobile width and tighten its padding
- [x] update the hero slider image framing
- [x] make the hero slider image larger, brighter, and closer to the edge on mobile
- [x] reduce the mobile gap between the category rail and hero content
- [x] trim the remaining mobile-only spacer above the hero slider
- [x] hide the category title and description on mobile while keeping the badge
- [x] clamp hero slider product title to two mobile lines and description to three
- [x] expand hero slider clamps to three lines for title and five for description on tablet and desktop
- [x] make the hero slider image cover the frame on mobile only
- [x] hide the hero slider secondary action on mobile, rename the primary CTA to Buy now, and center the arrows vertically
- [x] pin the hero slider mobile nav row so it stays level with the badge and does not jump between slides
- [x] match the mobile hero image shell to the reference crop with a wider frame and lower image placement
- [x] nudge the mobile hero image down another two steps for the slider crop
- [x] move the category Explore CTA to the right and align it with the badge on mobile
- [x] hide the presentation tab on mobile in the storefront designer
- [x] increase tablet and desktop bottom padding under the hero slider
- [x] move the tablet and desktop hero slider nav a little lower again
- [x] clamp the deal banner title to one line and the description to two lines
- [x] sync ERPNext item codes into product SKUs and regenerate slugs from item names
- [x] sort the Frappe item sync list by ERPNext item id
- [x] show category, brand, product group, and type on two compact lines in the product list
- [x] run typecheck
- [x] run `npm run build:web`

### Validation Status

1. `npm run typecheck` passed.
2. `npm run build:web` passed.
