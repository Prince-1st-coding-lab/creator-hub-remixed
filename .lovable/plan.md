# Upgrade product image popup

## Goal
Refine only the existing product image popup using the selected **Vertical stack gallery** direction. Keep the website’s current warm G Modern Creativity styling and all existing gallery behavior.

## Changes
- Replace the large-screen side-by-side popup with a single-column, image-first layout.
- Make the active photo large and clear while preserving its full proportions without cropping.
- Keep the existing close control, previous/next navigation, keyboard controls, and thumbnail selection.
- Place thumbnails directly below the active image when an item has multiple photos.
- Show the item’s name, price, description, size, type, best-for, availability, and full-page link in a compact section below the image, but only for fields that contain data.
- When an image has no details, omit the details section entirely so the popup contains only the image and relevant gallery controls, with no blank column or unused space.
- Keep the popup scrollable on short mobile screens and comfortably sized on desktop.

## Scope
- Update the existing popup component only.
- Do not alter gallery data, admin editing, ordering, product pages, navigation, or other site sections.
- Reuse the current semantic colors, typography, and interaction patterns; add no dependencies.

## Verification
- Check a gallery image with no details: image fills the popup and no empty details area appears.
- Check an image with details: every populated field appears below the image and empty fields stay hidden.
- Check multiple images: arrows, thumbnails, keyboard navigation, and active thumbnail state still work.
- Verify close behavior, body scrolling restoration, mobile layout, desktop layout, and a clean build.
