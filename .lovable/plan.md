
# PDF Compression Feature Implementation Plan

## Overview

This plan adds a dedicated compression feature to minimize PDF file size through client-side image reprocessing before embedding into the PDF. The feature uses HTML Canvas to resize and re-encode images at different quality levels.

---

## What You'll Get

- **4 compression presets** to choose from: High Quality, Balanced, Small Size, and Very Small Size
- **Estimated file size** shown before you download
- **Quality warnings** when aggressive compression might affect image clarity
- **Same privacy guarantees** - all compression happens in your browser

---

## User Experience

When you select images, you'll see a new "Compression" section in the settings panel:

1. **Preset selector** with 4 options, each showing what to expect
2. **Live size estimate** that updates as you change settings
3. **Warning banner** (only for aggressive presets) explaining potential quality loss

---

## Technical Details

### New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/imageCompressor.ts` | Canvas-based image compression pipeline |
| `src/components/CompressionSettings.tsx` | UI for preset selection with warnings |
| `src/components/SizeEstimate.tsx` | Estimated output size display |

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/image.ts` | Add compression types and preset configurations |
| `src/lib/pdfGenerator.ts` | Integrate compression pipeline before PDF generation |
| `src/pages/Index.tsx` | Add compression state and new components |

---

### Compression Presets Configuration

```text
Preset             DPI Limit   JPEG Quality   Max Dimension   Expected Reduction
----------------   ---------   ------------   -------------   ------------------
High Quality       300 DPI     92%            4000px          ~20-30%
Balanced           200 DPI     85%            2500px          ~40-50%
Small Size         150 DPI     75%            1800px          ~60-70%
Very Small         96 DPI      60%            1200px          ~75-85%
```

---

### Compression Pipeline

The compression runs in 3 stages before PDF generation:

1. **Dimension Check** - If image exceeds max pixels for the preset, calculate scale factor
2. **Canvas Resample** - Draw image onto an off-screen canvas at target dimensions
3. **Re-encode** - Export as JPEG at the specified quality level

```text
Original Image (e.g., 4000x3000px, 8MB JPEG)
           |
           v
   [Dimension Limiting]
   Scale to fit within maxDimension
           |
           v
   [Canvas Resampling]
   Draw to canvas at new size
           |
           v
   [JPEG Re-encoding]
   Export at quality level (60-92%)
           |
           v
Compressed Image (e.g., 1200x900px, 150KB JPEG)
```

---

### Size Estimation Algorithm

The size estimate uses empirical compression ratios based on preset and input images:

```text
For each image:
  1. Get original file size
  2. Calculate dimension reduction ratio (original pixels / target pixels)
  3. Apply quality factor multiplier
  4. Sum all estimates + PDF overhead (~50KB base + 2KB per page)
```

This provides a "best effort" estimate that's typically accurate within 20%.

---

### UI Layout

The new compression section fits naturally between existing settings:

```text
+----------------------------------+
|  PDF Settings                    |
+----------------------------------+
|  Page Size: [A4] [Letter]        |
|  Orientation: [Portrait] [Land]  |
|  Image Fit: [Fit] [Fill] [Orig]  |
|  Margins: [====|====] 10mm       |
+----------------------------------+

+----------------------------------+
|  Compression                     |
+----------------------------------+
|  ○ High quality (larger file)    |
|  ● Balanced                      |
|  ○ Small size                    |
|  ○ Very small (aggressive)       |
|                                  |
|  ⚠ May reduce clarity of fine    |
|    details and text in images    |  <- Only shown for aggressive
+----------------------------------+

+----------------------------------+
|  Estimated Size: ~2.4 MB         |
+----------------------------------+

[        Convert to PDF (5)        ]
```

---

### Warning Display Logic

Warnings appear contextually based on preset:

| Preset | Warning Shown |
|--------|---------------|
| High Quality | None |
| Balanced | None |
| Small Size | "May reduce clarity of fine details" |
| Very Small | "May visibly degrade text and detailed graphics" |

---

### Changes to Conversion Flow

The updated conversion process:

```text
User clicks "Convert to PDF"
         |
         v
[Progress: "Compressing image 1 of N..."]
         |
   For each image:
     - Load into canvas
     - Resize if needed
     - Re-encode as JPEG
         |
         v
[Progress: "Generating PDF..."]
         |
     - Create jsPDF document
     - Add compressed images
         |
         v
[Progress: "Complete!"]
         |
     - Download PDF
```

---

### Implementation Sequence

1. **Types** - Add `CompressionPreset` type and `COMPRESSION_PRESETS` config to `types/image.ts`
2. **Compressor** - Create `imageCompressor.ts` with canvas-based compression functions
3. **Estimator** - Add size estimation utility functions
4. **UI Components** - Build `CompressionSettings.tsx` and `SizeEstimate.tsx`
5. **Integration** - Update `pdfGenerator.ts` to use compression pipeline
6. **Main Page** - Wire everything together in `Index.tsx`

---

### Accessibility Considerations

- All presets use proper radio group semantics with labels
- Warning messages include `role="alert"` for screen readers
- Size estimate updates are announced via `aria-live="polite"`
- Keyboard navigation works identically to existing settings

---

### Edge Cases Handled

- **PNG with transparency**: Converted to JPEG with white background
- **Small images**: Skip upscaling; only downscale when beneficial
- **WebP format**: Canvas handles conversion automatically
- **Very large images**: Progressive loading with memory management
- **Estimation accuracy**: Display as "~X MB" to indicate approximation
