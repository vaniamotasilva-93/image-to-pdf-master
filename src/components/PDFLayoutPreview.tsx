import { useMemo } from 'react';
import { ImageFile, PDFSettings, PAGE_DIMENSIONS } from '@/types/image';
import { formatFileSize, estimatePDFSize, estimateDirectPDFSize } from '@/lib/imageCompressor';
import { Eye } from 'lucide-react';

interface PDFLayoutPreviewProps {
  images: ImageFile[];
  settings: PDFSettings;
}

export const PDFLayoutPreview = ({ images, settings }: PDFLayoutPreviewProps) => {
  const pageCount = images.length;
  
  const estimatedSize = useMemo(() => {
    if (settings.conversionMode === 'direct') {
      return estimateDirectPDFSize(images);
    }
    return estimatePDFSize(images, settings.compression);
  }, [images, settings.conversionMode, settings.compression]);

  const pageDimensions = PAGE_DIMENSIONS[settings.pageSize];
  const isLandscape = settings.orientation === 'landscape';
  
  // Calculate preview dimensions (scaled down)
  const previewScale = 0.3;
  const pageWidth = isLandscape ? pageDimensions.height : pageDimensions.width;
  const pageHeight = isLandscape ? pageDimensions.width : pageDimensions.height;
  const scaledWidth = pageWidth * previewScale;
  const scaledHeight = pageHeight * previewScale;

  if (images.length === 0) {
    return null;
  }

  const firstImage = images[0];

  return (
    <div 
      className="p-5 bg-card rounded-xl border border-border shadow-card"
      role="region"
      aria-label="PDF layout preview"
    >
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-foreground">PDF Preview</h2>
      </div>

      <div className="flex items-start gap-4">
        {/* Page preview thumbnail */}
        <div 
          className="relative bg-white border border-border rounded shadow-sm flex-shrink-0 overflow-hidden"
          style={{ 
            width: `${scaledWidth}px`, 
            height: `${scaledHeight}px`,
          }}
          aria-hidden="true"
        >
          {/* Margin visualization */}
          <div 
            className="absolute inset-0 border-dashed border-muted-foreground/30"
            style={{
              borderWidth: `${settings.marginMm * previewScale}px`,
            }}
          />
          
          {/* Image thumbnail */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-1"
            style={{
              padding: `${settings.marginMm * previewScale}px`,
            }}
          >
            <img
              src={firstImage.preview}
              alt=""
              className="max-w-full max-h-full object-contain rounded-sm"
            />
          </div>

          {/* Page number badge */}
          <div className="absolute bottom-1 right-1 bg-foreground/80 text-background text-[8px] px-1 rounded">
            1
          </div>
        </div>

        {/* Info panel */}
        <div className="flex-1 min-w-0 space-y-2">
          <div 
            className="text-sm text-foreground font-medium"
            aria-live="polite"
          >
            {pageCount} page{pageCount !== 1 ? 's' : ''}
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-3 h-4 border border-current rounded-sm ${isLandscape ? 'transform rotate-90' : ''}`} />
              <span className="capitalize">{settings.orientation}</span>
            </div>
            
            <div>
              {settings.pageSize.toUpperCase()} • {settings.marginMm}mm margins
            </div>
            
            <div className="pt-1 font-medium text-foreground">
              ~{formatFileSize(estimatedSize)}
            </div>
          </div>
        </div>
      </div>

      {/* Page thumbnails strip for multiple images */}
      {pageCount > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Page thumbnails">
            {images.slice(0, 5).map((img, index) => (
              <div
                key={img.id}
                className="relative w-10 h-14 bg-white border border-border rounded shadow-sm flex-shrink-0 overflow-hidden"
                role="listitem"
              >
                <img
                  src={img.preview}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0.5 right-0.5 bg-foreground/80 text-background text-[6px] px-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
            {pageCount > 5 && (
              <div className="w-10 h-14 bg-muted border border-border rounded flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                +{pageCount - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
