export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

export type PageSize = 'a4' | 'letter';
export type PageOrientation = 'portrait' | 'landscape';
export type ImageFitMode = 'fit' | 'fill' | 'original';

export interface PDFSettings {
  pageSize: PageSize;
  orientation: PageOrientation;
  fitMode: ImageFitMode;
  marginMm: number;
}

export interface ConversionProgress {
  current: number;
  total: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
  message?: string;
}

// Page dimensions in mm
export const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
};

// File size limits
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILES = 20;
export const MAX_TOTAL_SIZE_MB = 100;

// Supported formats
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const SUPPORTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp';
