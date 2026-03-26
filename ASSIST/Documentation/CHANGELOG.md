# Changelog

## Unreleased

### Changed

1. rewrote ASSIST guidance around the current `apps/` architecture
2. moved framework runtime infrastructure from `apps/core/api/src/shared` to `apps/framework/src/runtime`
3. moved framework auth and mailbox modules into `apps/framework/src`
4. moved ecommerce backend features into `apps/ecommerce/api/src/features`
5. rewired `apps/core/api` to host framework, core, and ecommerce code through explicit cross-app imports instead of owning all of it directly
6. added `apps/framework/src/manifest.ts` as the framework-owned suite manifest source
7. added the `@ecommerce-api/*` TypeScript path alias for clean backend app boundaries
8. added `apps/docs` as the unified documentation root for the whole suite
9. added `apps/cli` as the suite control CLI for server-side operations
10. improved database restore with incremental and fresh modes plus chunked row processing
11. added nightly automated backup scheduling with retention and external delivery hooks
12. surfaced database error details in the restore and maintenance flow instead of a generic unhandled message
13. refined the storefront mobile header to remove duplicated top actions, move the drawer to the right side, and keep search in the sticky header
14. documented a human-readable implementation style rule in `ASSIST/AI_RULES.md`
15. removed the storefront floating contact action and bottom nav, moving contact access into the drawer menu instead
16. adjusted the storefront hero slider image frame to use padded, top-aligned image fitting instead of aggressive center cropping
17. restored the storefront mobile bottom navigation, then moved the hamburger drawer trigger into the bottom bar and removed the mobile top search strip
18. restored the storefront mobile top search bar with branding above the fold
19. expanded the storefront hero slider to full-bleed mobile width and tightened its mobile padding so the slide fills the screen gap
20. brightened the storefront hero slider image treatment on mobile by reducing overlay density and pulling the image closer to the frame edge
21. placed the storefront mobile logo and search bar in a single row above the fold
22. tightened mobile storefront spacing so the category rail sits closer to the hero content
23. trimmed the remaining mobile-only spacer above the hero slider without affecting tablet or desktop spacing
24. hid the category title and description on mobile while keeping the badge and nudged the Explore CTA upward
25. clamped the hero slider product title and description to tighter mobile line counts
26. expanded the hero slider line clamps on tablet and desktop to three lines for title and five for description
27. switched the hero slider image to cover the frame on mobile while preserving the desktop contain fit
28. hid the hero slider secondary action on mobile, renamed the primary CTA to Buy now, and centered the arrow controls vertically
29. pinned the hero slider mobile nav row to a fixed top line and tightened the mobile image size so the controls stay level with the badge
30. matched the mobile hero image shell to the reference crop with a wider frame and lower image placement
31. nudged the mobile hero image further downward to refine the slider crop
32. aligned the mobile category Explore CTA with the badge and moved it to the right edge
33. hid the storefront designer presentation tab on mobile while keeping it visible on larger screens
34. increased the hero slider bottom padding on tablet and desktop to add more space below the content
35. moved the hero slider nav slightly lower again on tablet and desktop
36. clamped the deal banner title to one line and the description to two lines
