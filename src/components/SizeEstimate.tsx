import { useMemo } from 'react';
import { ImageFile, CompressionPreset, ConversionMode } from '@/types/image';
import { estimatePDFSize, estimateDirectPDFSize, formatFileSize } from '@/lib/imageCompressor';
import { FileOutput } from 'lucide-react';

interface SizeEstimateProps {
  images: ImageFile[];
  preset: CompressionPreset;
  conversionMode: ConversionMode;
}

export const SizeEstimate = ({ images, preset, conversionMode }: SizeEstimateProps) => {
  const estimatedSize = useMemo(
    () => conversionMode === 'direct' 
      ? estimateDirectPDFSize(images)
      : estimatePDFSize(images, preset),
    [images, preset, conversionMode]
  );

  const originalSize = useMemo(
    () => images.reduce((sum, img) => sum + img.size, 0),
    [images]
  );

  if (images.length === 0) {
    return null;
  }

  // Only show savings for optimized mode
  const savings = conversionMode === 'optimized' && originalSize > 0 
    ? Math.round((1 - estimatedSize / originalSize) * 100)
    : 0;

  return (
    <div 
      className="p-4 bg-muted/50 rounded-lg border border-border"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileOutput className="w-4 h-4" aria-hidden="true" />
          <span>Estimated size</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-foreground">
            ~{formatFileSize(estimatedSize)}
          </span>
          {savings > 0 && (
            <span className="ml-2 text-xs text-success">
              ({savings}% smaller)
            </span>
          )}
        </div>
      </div>
      <div className="mt-1 text-xs text-muted-foreground text-right">
        Original: {formatFileSize(originalSize)}
      </div>
    </div>
  );
};
