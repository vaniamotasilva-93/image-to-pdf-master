import { useState, useCallback } from 'react';
import { ImageFile } from '@/types/image';
import { ConversionProgress as ProgressType } from '@/types/image';
import {
  ResolutionProfile,
  RESOLUTION_PROFILES,
  BgRemovalResult,
  removeImageBackground,
  getImageDimensions,
} from '@/lib/backgroundRemoval';
import { isValidImageFile } from '@/lib/fileValidation';
import { ImageUploader } from '@/components/ImageUploader';
import { ConversionProgress } from '@/components/ConversionProgress';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eraser, AlertTriangle, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MAX_BATCH = 5;
const MAX_FILE_SIZE_MB = 10;

export const BackgroundRemovalView = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [resolution, setResolution] = useState<ResolutionProfile>('medium');
  const [progress, setProgress] = useState<ProgressType>({ current: 0, total: 0, status: 'idle' });
  const [results, setResults] = useState<BgRemovalResult[]>([]);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const isProcessing = progress.status === 'processing';

  const handleImagesAdd = useCallback((newImages: ImageFile[]) => {
    setImages((prev) => {
      const combined = [...prev, ...newImages];
      if (combined.length > MAX_BATCH) {
        toast.warning(`Maximum ${MAX_BATCH} images allowed per batch.`);
        return combined.slice(0, MAX_BATCH);
      }
      return combined;
    });
    setResults([]);
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    results.forEach((r) => {
      URL.revokeObjectURL(r.originalUrl);
      URL.revokeObjectURL(r.resultUrl);
    });
    setImages([]);
    setResults([]);
    setPreviewIdx(null);
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, [images, results]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
    setResults([]);
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, []);

  const handleProcess = async () => {
    if (images.length === 0) return;

    try {
      setResults([]);
      setPreviewIdx(null);
      setProgress({ current: 0, total: images.length, status: 'processing', message: 'Loading AI model…' });

      const newResults: BgRemovalResult[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        setProgress({
          current: i,
          total: images.length,
          status: 'processing',
          message: `Removing background from image ${i + 1} of ${images.length}…`,
        });

        const resultBlob = await removeImageBackground(img.file, resolution);
        const resultUrl = URL.createObjectURL(resultBlob);
        const dims = await getImageDimensions(resultUrl);

        newResults.push({
          id: img.id,
          originalName: img.name,
          originalUrl: img.preview,
          resultUrl,
          originalSize: img.size,
          resultSize: resultBlob.size,
          width: dims.width,
          height: dims.height,
        });
      }

      setResults(newResults);
      setProgress({
        current: images.length,
        total: images.length,
        status: 'complete',
        message: `Background removed from ${images.length} image${images.length !== 1 ? 's' : ''}!`,
      });
      toast.success('Background removal complete!');
    } catch (error) {
      console.error('Background removal failed:', error);
      setProgress({
        current: 0,
        total: images.length,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to remove background.',
      });
      toast.error('Background removal failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleDownload = (result: BgRemovalResult) => {
    const a = document.createElement('a');
    a.href = result.resultUrl;
    const baseName = result.originalName.replace(/\.[^.]+$/, '');
    a.download = `${baseName}-no-bg.png`;
    a.click();
  };

  const handleDownloadAll = () => {
    results.forEach((r) => handleDownload(r));
  };

  const profile = RESOLUTION_PROFILES[resolution];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-6">
        <ImageUploader
          images={images}
          onImagesAdd={handleImagesAdd}
          disabled={isProcessing}
        />

        {images.length > 0 && !results.length && (
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border">
                <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveImage(img.id)}
                  disabled={isProcessing}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${img.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length > 1 && (
              <button
                onClick={handleClearAll}
                disabled={isProcessing}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors underline self-end"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Results</h3>
              {results.length > 1 && (
                <Button onClick={handleDownloadAll} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((r, idx) => (
                <Card key={r.id} className="overflow-hidden">
                  <div
                    className="relative aspect-square bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,hsl(var(--background))_0%_50%)] bg-[length:20px_20px] cursor-pointer"
                    onClick={() => setPreviewIdx(previewIdx === idx ? null : idx)}
                  >
                    <img
                      src={previewIdx === idx ? r.originalUrl : r.resultUrl}
                      alt={previewIdx === idx ? 'Original' : 'Background removed'}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium bg-background/80 text-foreground backdrop-blur-sm">
                      {previewIdx === idx ? 'Original' : 'Processed'}
                    </div>
                    <button
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 text-foreground backdrop-blur-sm hover:bg-background transition-colors"
                      aria-label="Toggle preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.originalName}</p>
                      <p className="text-xs text-muted-foreground">{r.width} × {r.height}px</p>
                    </div>
                    <Button onClick={() => handleDownload(r)} size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <div className="p-5 bg-card rounded-xl border border-border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Eraser className="w-5 h-5 text-primary" aria-hidden="true" />
            Output Resolution
          </h2>
          <RadioGroup
            value={resolution}
            onValueChange={(v) => setResolution(v as ResolutionProfile)}
            className="space-y-3"
            disabled={isProcessing}
          >
            {(['high', 'medium', 'low'] as ResolutionProfile[]).map((r) => {
              const p = RESOLUTION_PROFILES[r];
              return (
                <div key={r} className="flex items-start space-x-2">
                  <RadioGroupItem value={r} id={`res-${r}`} className="mt-0.5" />
                  <Label htmlFor={`res-${r}`} className="cursor-pointer space-y-0.5">
                    <span className="font-medium">{p.label}</span>
                    <span className="block text-xs text-muted-foreground">{p.description}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {profile.warning && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 text-warning text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{profile.warning}</span>
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
          All processing is performed locally in your browser. Images are never uploaded to any server.
        </div>

        <Button
          onClick={handleProcess}
          disabled={isProcessing || images.length === 0}
          size="lg"
          className="w-full h-14 text-base font-semibold"
        >
          {isProcessing ? 'Processing…' : (
            <>
              <Eraser className="w-5 h-5 mr-2" aria-hidden="true" />
              Remove Background{images.length > 1 ? 's' : ''}
            </>
          )}
        </Button>

        <ConversionProgress progress={progress} />
      </div>
    </div>
  );
};
