import jsPDF from 'jspdf';
import { 
  ImageFile, 
  PDFSettings, 
  PAGE_DIMENSIONS,
  ConversionProgress 
} from '@/types/image';
import { compressImage } from '@/lib/imageCompressor';

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
        width = availableWidth;
        height = width / imgAspect;
      } else {
        height = availableHeight;
        width = height * imgAspect;
      }
      x = marginMm + (availableWidth - width) / 2;
      y = marginMm + (availableHeight - height) / 2;
      break;

    case 'fill':
      // Fill page, cropping if necessary (image centered)
      if (imgAspect > pageAspect) {
        height = availableHeight;
        width = height * imgAspect;
      } else {
        width = availableWidth;
        height = width / imgAspect;
      }
      x = marginMm + (availableWidth - width) / 2;
      y = marginMm + (availableHeight - height) / 2;
      break;

    case 'original':
      // Original size, centered (may overflow page)
      const pixelsToMm = 25.4 / 96;
      width = imgWidth * pixelsToMm;
      height = imgHeight * pixelsToMm;
      
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
  const { pageSize, orientation, fitMode, marginMm, conversionMode, compression } = settings;
  
  // Get page dimensions
  let { width: pageWidth, height: pageHeight } = PAGE_DIMENSIONS[pageSize];
  
  if (orientation === 'landscape') {
    [pageWidth, pageHeight] = [pageHeight, pageWidth];
  }

  const pdf = new jsPDF({
    orientation: orientation === 'landscape' ? 'l' : 'p',
    unit: 'mm',
    format: pageSize,
  });

  const total = images.length;
  const processedImages: { dataUrl: string; width: number; height: number }[] = [];

  // Phase 1: Process images (compress if optimized mode, otherwise load directly)
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    if (conversionMode === 'optimized') {
      onProgress?.({
        current: i + 1,
        total,
        status: 'compressing',
        message: `Compressing ${image.name}...`,
      });

      try {
        const compressed = await compressImage(image, compression);
        processedImages.push(compressed);
      } catch (error) {
        console.error(`Error compressing image ${image.name}:`, error);
        throw new Error(`Failed to compress image: ${image.name}`);
      }
    } else {
      // Direct mode: load image without compression
      onProgress?.({
        current: i + 1,
        total,
        status: 'processing',
        message: `Loading ${image.name}...`,
      });

      try {
        const imgData = await loadImageAsDataUrl(image);
        processedImages.push(imgData);
      } catch (error) {
        console.error(`Error loading image ${image.name}:`, error);
        throw new Error(`Failed to load image: ${image.name}`);
      }
    }
  }

  // Phase 2: Generate PDF from processed images
  for (let i = 0; i < processedImages.length; i++) {
    const processed = processedImages[i];
    const originalImage = images[i];
    
    onProgress?.({
      current: i + 1,
      total,
      status: 'processing',
      message: `Adding ${originalImage.name} to PDF...`,
    });

    try {
      const placement = calculateImagePlacement(
        processed.width,
        processed.height,
        pageWidth,
        pageHeight,
        marginMm,
        fitMode
      );

      if (i > 0) {
        pdf.addPage();
      }

      // Determine format based on conversion mode
      const format = conversionMode === 'direct' ? getImageFormat(originalImage.file.type) : 'JPEG';

      pdf.addImage(
        processed.dataUrl,
        format,
        placement.x,
        placement.y,
        placement.width,
        placement.height,
        undefined,
        'MEDIUM'
      );
    } catch (error) {
      console.error(`Error adding image ${originalImage.name} to PDF:`, error);
      throw new Error(`Failed to add image to PDF: ${originalImage.name}`);
    }
  }

  onProgress?.({
    current: total,
    total,
    status: 'complete',
    message: 'PDF generated successfully!',
  });

  return pdf.output('blob');
};

// Load image directly without compression
const loadImageAsDataUrl = (image: ImageFile): Promise<{ dataUrl: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Use original format if possible
      const format = image.file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = format === 'image/jpeg' ? 0.95 : undefined;
      
      resolve({
        dataUrl: canvas.toDataURL(format, quality),
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = image.preview;
  });
};

// Get jsPDF format from MIME type
const getImageFormat = (mimeType: string): 'JPEG' | 'PNG' | 'WEBP' => {
  if (mimeType === 'image/png') return 'PNG';
  if (mimeType === 'image/webp') return 'WEBP';
  return 'JPEG';
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
