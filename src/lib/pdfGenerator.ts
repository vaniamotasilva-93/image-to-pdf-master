import jsPDF from 'jspdf';
import { 
  ImageFile, 
  PDFSettings, 
  PAGE_DIMENSIONS,
  ConversionProgress 
} from '@/types/image';
import { compressImage, CompressedImage } from '@/lib/imageCompressor';

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
  const { pageSize, orientation, fitMode, marginMm, compression } = settings;
  
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
  const compressedImages: CompressedImage[] = [];

  // Phase 1: Compress all images
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    onProgress?.({
      current: i + 1,
      total,
      status: 'compressing',
      message: `Compressing ${image.name}...`,
    });

    try {
      const compressed = await compressImage(image, compression);
      compressedImages.push(compressed);
    } catch (error) {
      console.error(`Error compressing image ${image.name}:`, error);
      throw new Error(`Failed to compress image: ${image.name}`);
    }
  }

  // Phase 2: Generate PDF from compressed images
  for (let i = 0; i < compressedImages.length; i++) {
    const compressed = compressedImages[i];
    const originalImage = images[i];
    
    onProgress?.({
      current: i + 1,
      total,
      status: 'processing',
      message: `Adding ${originalImage.name} to PDF...`,
    });

    try {
      const placement = calculateImagePlacement(
        compressed.width,
        compressed.height,
        pageWidth,
        pageHeight,
        marginMm,
        fitMode
      );

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        compressed.dataUrl,
        'JPEG',
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
