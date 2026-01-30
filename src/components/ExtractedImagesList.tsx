import { ExtractedImage, ImageOutputFormat } from '@/types/converter';
import { Button } from '@/components/ui/button';
import { Download, Images, Trash2 } from 'lucide-react';
import { downloadImage, downloadAllImages } from '@/lib/pdfToImage';

interface ExtractedImagesListProps {
  images: ExtractedImage[];
  baseName: string;
  format: ImageOutputFormat;
  onClear: () => void;
}

export const ExtractedImagesList = ({ 
  images, 
  baseName, 
  format, 
  onClear 
}: ExtractedImagesListProps) => {
  if (images.length === 0) {
    return null;
  }

  const handleDownloadAll = () => {
    downloadAllImages(images, baseName, format);
  };

  const handleDownloadSingle = (img: ExtractedImage) => {
    const filename = `${baseName}-page-${img.pageNumber}.${format}`;
    downloadImage(img.dataUrl, filename);
  };

  return (
    <div className="space-y-4 p-5 bg-card rounded-xl border border-border shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Images className="w-5 h-5 text-primary" aria-hidden="true" />
          Extracted Images
          <span className="text-sm font-normal text-muted-foreground">
            ({images.length} page{images.length !== 1 ? 's' : ''})
          </span>
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadAll}
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download All
          </Button>
          <Button
            onClick={onClear}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative bg-muted rounded-lg overflow-hidden border border-border"
          >
            <div className="aspect-[3/4] relative">
              <img
                src={img.dataUrl}
                alt={`Page ${img.pageNumber}`}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
            
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-foreground/80 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-xs text-background font-medium">
                  Page {img.pageNumber}
                </span>
                <button
                  onClick={() => handleDownloadSingle(img)}
                  className="p-1 rounded bg-background/20 hover:bg-background/40 transition-colors"
                  aria-label={`Download page ${img.pageNumber}`}
                >
                  <Download className="w-3 h-3 text-background" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
