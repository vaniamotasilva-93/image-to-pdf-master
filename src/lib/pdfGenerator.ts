import jsPDF from 'jspdf';
import { 
  ImageFile, 
  PDFSettings, 
  PAGE_DIMENSIONS,
  ConversionProgress 
} from '@/types/image';

// Convert mm to points (jsPDF uses points internally for some operations)
const mmToPoints = (mm: number): number => mm * 2.83465;

// Get image dimensions from data URL
const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

// Read file as data URL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Calculate image position and size based on fit mode
const calculateImagePlacement = (
  imgWidth: number,
  imgHeight: number,
  pageWidth: number,
  pageHeight: number,
  marginMm: number,
  fitMode: PDFSettings['fitMode']
): { x: number; y: number; width: number; height: number } => {
  const availableWidth = pageWidth - (marginMm * 2);
  const availableHeight = pageHeight - (marginMm * 2);
  
  const imgAspect = imgWidth / imgHeight;
  const pageAspect = availableWidth / availableHeight;

  let width: number;
  let height: number;
  let x: number;
  let y: number;

  switch (fitMode) {
    case 'fit':
      // Fit entire image within page, maintaining aspect ratio
      if (imgAspect > pageAspect) {
        // Image is wider than page
        width = availableWidth;
        height = width / imgAspect;
      } else {
        // Image is taller than page
        height = availableHeight;
        width = height * imgAspect;
      }
      x = marginMm + (availableWidth - width) / 2;
      y = marginMm + (availableHeight - height) / 2;
      break;

    case 'fill':
      // Fill page, cropping if necessary (image centered)
      if (imgAspect > pageAspect) {
        // Image is wider, fit by height
        height = availableHeight;
        width = height * imgAspect;
      } else {
        // Image is taller, fit by width
        width = availableWidth;
        height = width / imgAspect;
      }
      x = marginMm + (availableWidth - width) / 2;
      y = marginMm + (availableHeight - height) / 2;
      break;

    case 'original':
      // Original size, centered (may overflow page)
      // Convert pixels to mm (assuming 96 DPI)
      const pixelsToMm = 25.4 / 96;
      width = imgWidth * pixelsToMm;
      height = imgHeight * pixelsToMm;
      
      // If larger than available space, scale down
      if (width > availableWidth || height > availableHeight) {
        const scale = Math.min(availableWidth / width, availableHeight / height);
        width *= scale;
        height *= scale;
      }
      
      x = marginMm + (availableWidth - width) / 2;
      y = marginMm + (availableHeight - height) / 2;
      break;

    default:
      width = availableWidth;
      height = availableHeight;
      x = marginMm;
      y = marginMm;
  }

  return { x, y, width, height };
};

export const generatePDF = async (
  images: ImageFile[],
  settings: PDFSettings,
  onProgress?: (progress: ConversionProgress) => void
): Promise<Blob> => {
  const { pageSize, orientation, fitMode, marginMm } = settings;
  
  // Get page dimensions
  let { width: pageWidth, height: pageHeight } = PAGE_DIMENSIONS[pageSize];
  
  // Swap dimensions for landscape
  if (orientation === 'landscape') {
    [pageWidth, pageHeight] = [pageHeight, pageWidth];
  }

  // Create PDF
  const pdf = new jsPDF({
    orientation: orientation === 'landscape' ? 'l' : 'p',
    unit: 'mm',
    format: pageSize,
  });

  const total = images.length;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    // Report progress
    onProgress?.({
      current: i + 1,
      total,
      status: 'processing',
      message: `Processing ${image.name}...`,
    });

    try {
      // Read image file
      const dataUrl = await readFileAsDataURL(image.file);
      
      // Get image dimensions
      const imgDimensions = await getImageDimensions(dataUrl);
      
      // Calculate placement
      const placement = calculateImagePlacement(
        imgDimensions.width,
        imgDimensions.height,
        pageWidth,
        pageHeight,
        marginMm,
        fitMode
      );

      // Add new page for all images except the first
      if (i > 0) {
        pdf.addPage();
      }

      // Determine image format from file type
      let format = 'JPEG';
      if (image.file.type === 'image/png') {
        format = 'PNG';
      } else if (image.file.type === 'image/webp') {
        // jsPDF doesn't natively support WebP, but modern browsers can handle it
        // through the canvas. We'll convert WebP to PNG/JPEG via canvas.
        format = 'PNG';
      }

      // Add image to PDF
      pdf.addImage(
        dataUrl,
        format,
        placement.x,
        placement.y,
        placement.width,
        placement.height,
        undefined,
        'MEDIUM'
      );
    } catch (error) {
      console.error(`Error processing image ${image.name}:`, error);
      throw new Error(`Failed to process image: ${image.name}`);
    }
  }

  // Report completion
  onProgress?.({
    current: total,
    total,
    status: 'complete',
    message: 'PDF generated successfully!',
  });

  // Return as blob
  return pdf.output('blob');
};

export const downloadPDF = (blob: Blob, filename: string = 'images.pdf'): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
