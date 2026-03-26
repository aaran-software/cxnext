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
- [x] remove floating contact and bottom nav from the storefront shell
- [x] update the hero slider image framing
- [x] run typecheck
- [x] run `npm run build:web`

### Validation Status

1. `npm run typecheck` passed.
2. `npm run build:web` passed.
