

# Image to PDF Conversion - Remaining Features

## Overview

This plan completes the Point 11 implementation by adding the missing features: Quick Export button, PDF layout preview, page layout options (split/combine), and size estimation for direct mode.

---

## What Will Be Added

| Feature | Description |
|---------|-------------|
| Quick Export Button | One-click conversion with default settings |
| PDF Layout Preview | Visual thumbnail showing how images will appear on pages |
| Page Layout Options | Toggle between "One image per page" and "Multiple images per page" |
| Direct Mode Size Estimate | Show estimated file size for direct conversion mode |

---

## User Experience Changes

### Quick Export Button
A secondary button appears next to the main "Convert to PDF" button when images are uploaded. Clicking it immediately converts using default settings (A4, portrait, fit mode, direct conversion).

### PDF Layout Preview
A small visual preview card shows a thumbnail representation of the first page layout with:
- Page orientation indicator
- Image positioning within margins
- Page count indicator

### Page Layout Options
New setting in PDF Settings allowing users to choose:
- **Separate pages**: Each image on its own page (current behavior)
- **Combined**: Multiple images per page (grid layout, future enhancement)

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/image.ts` | Add `PageLayout` type |
| `src/components/ConvertButton.tsx` | Add Quick Export button variant |
| `src/components/SizeEstimate.tsx` | Support direct mode estimation |
| `src/lib/imageCompressor.ts` | Add direct mode size calculation |
| `src/pages/Index.tsx` | Add Quick Export handler, layout preview |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/PDFLayoutPreview.tsx` | Visual preview of PDF layout |
| `src/components/PageLayoutOptions.tsx` | Split/combine toggle component |

---

### Quick Export Flow

```text
User clicks "Quick Export"
         |
         v
Use default settings:
  - A4 page size
  - Portrait orientation
  - Fit to page mode
  - 10mm margins
  - Direct conversion (no compression)
         |
         v
Generate PDF immediately
         |
         v
Download with auto-generated filename
```

---

### PDF Layout Preview Component

The preview shows a miniature representation of the output:

```text
+---------------------------+
|  PDF Preview              |
+---------------------------+
|  +-------+  +-------+     |
|  | [img] |  | [img] |     |
|  |  1    |  |  2    |     |
|  +-------+  +-------+     |
|                           |
|  5 pages total            |
+---------------------------+
```

Features:
- Thumbnail of first image with page frame
- Shows orientation (portrait/landscape)
- Displays margin visualization
- Page count indicator

---

### Page Layout Options

Simple toggle between layout modes:

```text
+----------------------------------+
|  Page Layout                     |
+----------------------------------+
|  ● One image per page            |
|    Each image on separate page   |
|                                  |
|  ○ Grid layout (coming soon)     |
|    Multiple images per page      |
+----------------------------------+
```

Note: Grid layout marked as "coming soon" - only separate pages implemented initially.

---

### Direct Mode Size Estimation

For direct conversion, the size estimate uses:

```text
Estimated Size = Sum of original image sizes 
               + PDF overhead (~50KB base + 2KB per page)
```

This provides a reasonable approximation since images are embedded without re-encoding.

---

### UI Layout Update

```text
+----------------------------------+
|  PDF Settings                    |
|  [existing settings...]          |
+----------------------------------+

+----------------------------------+
|  Page Layout                     |
|  ● One image per page            |
|  ○ Grid layout (coming soon)     |
+----------------------------------+

+----------------------------------+
|  Conversion Mode                 |
|  [existing toggle...]            |
+----------------------------------+

+----------------------------------+
|  PDF Preview                     |
|  [visual preview thumbnail]      |
|  5 pages • ~3.2 MB               |
+----------------------------------+

+----------------------------------+
|  Estimated Size: ~3.2 MB         |
|  Original: 4.1 MB                |
+----------------------------------+

+------------------+---------------+
| Quick Export     | Convert (5)   |
+------------------+---------------+
```

---

### Implementation Sequence

1. **Types** - Add `PageLayout` type to `types/image.ts`
2. **Size Estimation** - Update `imageCompressor.ts` to support direct mode
3. **SizeEstimate** - Modify to accept conversion mode and calculate accordingly
4. **PageLayoutOptions** - Create new component for split/combine toggle
5. **PDFLayoutPreview** - Create visual preview component
6. **ConvertButton** - Add Quick Export variant
7. **Index.tsx** - Wire everything together with new state and handlers

---

### Accessibility Considerations

- Quick Export button has clear accessible label
- PDF Preview includes alt text describing the layout
- Page count announced via `aria-live` region
- All new controls keyboard navigable

---

### Edge Cases

- **No images**: Quick Export and Preview hidden
- **Single image**: Preview shows single page layout
- **Many images**: Preview shows "1 of N pages" with navigation

