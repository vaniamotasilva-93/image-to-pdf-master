import { removeBackground, Config } from '@imgly/background-removal';

export type ResolutionProfile = 'high' | 'medium' | 'low';

export interface ResolutionConfig {
  maxDimension: number;
  label: string;
  description: string;
  warning?: string;
}

export const RESOLUTION_PROFILES: Record<ResolutionProfile, ResolutionConfig> = {
  high: {
    maxDimension: 4096,
    label: 'High',
    description: 'Preserve original resolution (up to 4096px)',
    warning: 'Processing may take significantly longer for large images.',
  },
  medium: {
    maxDimension: 2048,
    label: 'Medium',
    description: 'Balanced resolution for web & documents',
  },
  low: {
    maxDimension: 1024,
    label: 'Low',
    description: 'Small file size, faster processing',
  },
};

export interface BgRemovalResult {
  id: string;
  originalName: string;
  originalUrl: string;
  resultUrl: string;
  originalSize: number;
  resultSize: number;
  width: number;
  height: number;
}

/**
 * Resize an image to fit within maxDimension while preserving aspect ratio.
 * Returns a Blob (PNG).
 */
function resizeImage(file: File, maxDimension: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width <= maxDimension && height <= maxDimension) {
        // No resize needed – convert to blob via canvas to normalise format
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/png');
        return;
      }

      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Remove background from a single image.
 */
export async function removeImageBackground(
  file: File,
  resolution: ResolutionProfile,
): Promise<Blob> {
  const profile = RESOLUTION_PROFILES[resolution];
  const resized = await resizeImage(file, profile.maxDimension);

  const config: Config = {
    publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
    device: 'cpu',
    output: {
      format: 'image/png',
      quality: 1,
    },
  };

  const resultBlob = await removeBackground(resized, config);
  return resultBlob;
}

/**
 * Get dimensions from a blob URL.
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}
