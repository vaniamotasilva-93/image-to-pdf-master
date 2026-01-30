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

export type ConversionMode = 'direct' | 'optimized';
export type CompressionPreset = 'high' | 'balanced' | 'small' | 'verySmall';
export type PageLayout = 'separate' | 'combined';

export interface CompressionConfig {
  maxDimension: number;
  quality: number;
  label: string;
  description: string;
  warning?: string;
}

export const COMPRESSION_PRESETS: Record<CompressionPreset, CompressionConfig> = {
  high: {
    maxDimension: 4000,
    quality: 0.92,
    label: 'High quality',
    description: 'Larger file size',
  },
  balanced: {
    maxDimension: 2500,
    quality: 0.85,
    label: 'Balanced',
    description: 'Good quality, smaller file',
  },
  small: {
    maxDimension: 1800,
    quality: 0.75,
    label: 'Small size',
    description: 'Reduced quality',
    warning: 'May reduce clarity of fine details and text in images',
  },
  verySmall: {
    maxDimension: 1200,
    quality: 0.60,
    label: 'Very small',
    description: 'Aggressive compression',
    warning: 'May visibly degrade text and detailed graphics',
  },
};

export interface PDFSettings {
  pageSize: PageSize;
  orientation: PageOrientation;
  fitMode: ImageFitMode;
  marginMm: number;
  conversionMode: ConversionMode;
  compression: CompressionPreset;
}

export interface ConversionProgress {
  current: number;
  total: number;
  status: 'idle' | 'processing' | 'compressing' | 'complete' | 'error';
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
