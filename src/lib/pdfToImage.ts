import * as pdfjsLib from 'pdfjs-dist';
import { PDFFile, ExtractedImage, PDFToImageSettings, ImageOutputFormat } from '@/types/converter';

// Self-hosted worker for security (avoids CDN supply chain risk)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export const loadPDF = async (file: File): Promise<{ pageCount: number; pdf: pdfjsLib.PDFDocumentProxy }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return { pageCount: pdf.numPages, pdf };
};

export const renderPageToImage = async (
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  settings: PDFToImageSettings
): Promise<ExtractedImage> => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: settings.scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
  
  const mimeType = getMimeType(settings.format);
  const dataUrl = canvas.toDataURL(mimeType, settings.quality);
  
  return {
    id: `page-${pageNumber}-${Date.now()}`,
    dataUrl,
    pageNumber,
    width: viewport.width,
    height: viewport.height,
  };
};

export const convertPDFToImages = async (
  pdfFile: PDFFile,
  settings: PDFToImageSettings,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedImage[]> => {
  const { pageCount, pdf } = await loadPDF(pdfFile.file);
  const images: ExtractedImage[] = [];
  
  for (let i = 1; i <= pageCount; i++) {
    onProgress?.(i, pageCount);
    const image = await renderPageToImage(pdf, i, settings);
    images.push(image);
  }
  
  return images;
};

const getMimeType = (format: ImageOutputFormat): string => {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'png':
    default:
      return 'image/png';
  }
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAllImages = (images: ExtractedImage[], baseName: string, format: ImageOutputFormat) => {
  images.forEach((img, index) => {
    const filename = `${baseName}-page-${img.pageNumber}.${format}`;
    downloadImage(img.dataUrl, filename);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
};
