# Static social preview cards

Status: accepted

## Context

The site uses Astro starter artwork for social previews. Articles need distinct title cards, and builds must remain compatible with static GitHub Pages hosting.

## Decision

We will generate PNG cards in Astro static endpoints using Satori for text layout and the existing Sharp dependency for raster output. We will bundle licensed Playfair Display and Inter fonts, reuse the existing portrait, and keep social image overrides separate from hero images.

Generated URLs include a hash of the title, card kind, and template version. We will increment the template version whenever its design, fonts, or portrait changes.

## Consequences

Every article gets a preview without a manual export. Builds need no browser, font download, or external rendering service. Satori adds a build dependency and a small amount of build time. Fonts and template versions need maintenance. Explicit overrides can supply a different design without changing the article body.
