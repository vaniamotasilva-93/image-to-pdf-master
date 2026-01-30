export type ConversionDirection = 'image-to-pdf' | 'pdf-to-image';

export type ImageOutputFormat = 'png' | 'jpeg' | 'webp';

export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

export interface ExtractedImage {
  id: string;
  dataUrl: string;
  pageNumber: number;
  width: number;
  height: number;
}

export interface PDFToImageSettings {
  format: ImageOutputFormat;
  quality: number; // 0.1 to 1.0
  scale: number; // 1 to 3 (resolution multiplier)
}

export const DEFAULT_PDF_TO_IMAGE_SETTINGS: PDFToImageSettings = {
  format: 'png',
  quality: 0.92,
  scale: 2,
};
