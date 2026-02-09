import { pipeline, env, RawImage } from '@huggingface/transformers';

// Disable local model check – always fetch from HF Hub
env.allowLocalModels = false;

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

// Lazy-loaded singleton segmentation pipeline
let segmentatorPromise: Promise<any> | null = null;

function getSegmentator() {
  if (!segmentatorPromise) {
    segmentatorPromise = pipeline('image-segmentation', 'briaai/RMBG-1.4', {
      device: 'webgpu' in navigator ? 'webgpu' : 'wasm',
    }).catch((err) => {
      // Reset so next call retries
      segmentatorPromise = null;
      throw err;
    });
  }
  return segmentatorPromise;
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
 * Remove background from a single image using briaai/RMBG-1.4 via Transformers.js.
 */
export async function removeImageBackground(
  file: File,
  resolution: ResolutionProfile,
): Promise<Blob> {
  const profile = RESOLUTION_PROFILES[resolution];
  const resized = await resizeImage(file, profile.maxDimension);

  // Load segmentation pipeline (cached after first call)
  const segmentator = await getSegmentator();

  // Create a data URL from the resized blob for the pipeline
  const resizedUrl = URL.createObjectURL(resized);

  try {
    // Run segmentation – returns array with mask info
    const output = await segmentator(resizedUrl, {
      threshold: 0.5,
      mask_threshold: 0.5,
    });

    // The pipeline returns an array; the first element has the mask as a RawImage
    const maskData = output[0]?.mask;
    if (!maskData) {
      throw new Error('Segmentation returned no mask');
    }

    // Draw original image on canvas, then apply mask as alpha
    const origImg = await createImageBitmap(resized);
    const { width, height } = origImg;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Draw original
    ctx.drawImage(origImg, 0, 0);

    // Get image data to apply alpha mask
    const imageData = ctx.getImageData(0, 0, width, height);

    // Resize mask to match canvas dimensions
    const maskResized = await maskData.resize(width, height);
    const maskPixels = maskResized.data; // Uint8Array, 1 channel per pixel

    // Apply mask as alpha channel
    for (let i = 0; i < maskPixels.length; i++) {
      imageData.data[i * 4 + 3] = maskPixels[i]; // set alpha
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(resizedUrl);
  }
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
