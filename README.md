# Image to PDF Converter

A secure, privacy-focused web application that converts multiple images into a single PDF file. All processing happens entirely in your browser—no images are ever uploaded to any server.

## Features

- **Multi-image upload**: Drag & drop or file picker
- **Image management**: Reorder via drag & drop, remove individual images, preview thumbnails
- **PDF configuration**:
  - Page size: A4 or Letter
  - Orientation: Portrait or Landscape
  - Image fit mode: Fit to page, Fill page, or Original size centered
  - Adjustable margins (0-30mm)
- **Performance**: Handles up to 20 images, 10MB each
- **Accessibility**: Keyboard navigable, WCAG 2.1 AA compliant, proper ARIA labels

## How It Works

1. **Upload**: Images are loaded into browser memory using the File API
2. **Preview**: Object URLs are created for thumbnail previews (never leaves browser)
3. **Reorder**: Drag & drop uses @dnd-kit for smooth, accessible reordering
4. **Convert**: jsPDF library generates the PDF entirely in JavaScript
5. **Download**: The PDF blob is offered as a download via a temporary link

No server communication occurs at any point.

## Libraries Used

- **jsPDF** (v2.x) - Client-side PDF generation
- **@dnd-kit** - Accessible drag & drop toolkit
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Privacy & Data Handling

### What we DO:
- Process images entirely in your browser
- Generate PDFs using client-side JavaScript
- Offer direct download of generated files

### What we DON'T do:
- Upload images to any server
- Store any user data
- Use cookies for tracking
- Include analytics or advertising
- Log or monitor image content

### Compliance

This application is designed to comply with:
- **GDPR** (EU Regulation 2016/679) - No personal data processing occurs
- **Portuguese Data Protection Law** (Lei n.º 58/2019) - No data leaves your device

Since no data is collected, stored, or transmitted, there is no data controller or processor relationship established.

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled.

## License

Free to use. No watermarks, no login required, no tracking.
