import { ImageFile, CompressionPreset, COMPRESSION_PRESETS } from '@/types/image';

export interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

// Load image from file and return dimensions
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    img.src = URL.createObjectURL(file);
  });
};

// Compress a single image using canvas
export const compressImage = async (
  imageFile: ImageFile,
  preset: CompressionPreset
): Promise<CompressedImage> => {
  const config = COMPRESSION_PRESETS[preset];
  const img = await loadImage(imageFile.file);
  
  try {
    let { naturalWidth: width, naturalHeight: height } = img;
    
    // Calculate scale factor if image exceeds max dimension
    const maxDim = Math.max(width, height);
    let scale = 1;
    
    if (maxDim > config.maxDimension) {
      scale = config.maxDimension / maxDim;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    
    // Create canvas at target dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Fill with white background (for PNG transparency)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Draw image at new dimensions
    ctx.drawImage(img, 0, 0, width, height);
    
    // Export as JPEG with quality setting
    const dataUrl = canvas.toDataURL('image/jpeg', config.quality);
    
    // Estimate compressed size from base64 length
    const base64Length = dataUrl.split(',')[1]?.length || 0;
    const compressedSize = Math.round((base64Length * 3) / 4);
    
    return {
      dataUrl,
      width,
      height,
      originalSize: imageFile.size,
      compressedSize,
    };
  } finally {
    // Cleanup object URL
    URL.revokeObjectURL(img.src);
  }
};

// Compress multiple images with progress callback
export const compressImages = async (
  images: ImageFile[],
  preset: CompressionPreset,
  onProgress?: (current: number, total: number) => void
): Promise<CompressedImage[]> => {
  const results: CompressedImage[] = [];
  
  for (let i = 0; i < images.length; i++) {
    onProgress?.(i + 1, images.length);
    const compressed = await compressImage(images[i], preset);
    results.push(compressed);
  }
  
  return results;
};

// Estimate final PDF size based on images and compression preset
export const estimatePDFSize = (
  images: ImageFile[],
  preset: CompressionPreset
): number => {
  if (images.length === 0) return 0;
  
  // Empirical compression ratios based on preset
  const compressionRatios: Record<CompressionPreset, number> = {
    high: 0.75,      // ~25% reduction
    balanced: 0.50,  // ~50% reduction
    small: 0.35,     // ~65% reduction
    verySmall: 0.20, // ~80% reduction
  };
  
  const ratio = compressionRatios[preset];
  
  // Sum original sizes and apply compression ratio
  const totalOriginalSize = images.reduce((sum, img) => sum + img.size, 0);
  const estimatedImageSize = totalOriginalSize * ratio;
  
  // Add PDF overhead: ~50KB base + 2KB per page
  const pdfOverhead = 50 * 1024 + images.length * 2 * 1024;
  
  return Math.round(estimatedImageSize + pdfOverhead);
};

// Estimate PDF size for direct mode (no compression)
export const estimateDirectPDFSize = (images: ImageFile[]): number => {
  if (images.length === 0) return 0;
  
  // For direct mode, images are embedded as-is
  const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);
  
  // Add PDF overhead: ~50KB base + 2KB per page
  const pdfOverhead = 50 * 1024 + images.length * 2 * 1024;
  
  return Math.round(totalImageSize + pdfOverhead);
};

// Format bytes to human-readable string
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
};
