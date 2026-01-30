import { useState, useCallback, useEffect } from 'react';
import { ImageFile, PDFSettings as PDFSettingsType, ConversionProgress as ProgressType, CompressionPreset } from '@/types/image';
import { generatePDF, downloadPDF } from '@/lib/pdfGenerator';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageList } from '@/components/ImageList';
import { PDFSettings } from '@/components/PDFSettings';
import { CompressionSettings } from '@/components/CompressionSettings';
import { SizeEstimate } from '@/components/SizeEstimate';
import { ConversionProgress } from '@/components/ConversionProgress';
import { ConvertButton } from '@/components/ConvertButton';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { FileImage, Shield } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: PDFSettingsType = {
  pageSize: 'a4',
  orientation: 'portrait',
  fitMode: 'fit',
  marginMm: 10,
  compression: 'balanced',
};

const Index = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<PDFSettingsType>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<ProgressType>({
    current: 0,
    total: 0,
    status: 'idle',
  });

  // Cleanup preview URLs on unmount or when images change
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const handleImagesAdd = useCallback((newImages: ImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, []);

  const handleImagesReorder = useCallback((reorderedImages: ImageFile[]) => {
    setImages(reorderedImages);
  }, []);

  const handleImageRemove = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, [images]);

  const handleCompressionChange = useCallback((preset: CompressionPreset) => {
    setSettings((prev) => ({ ...prev, compression: preset }));
  }, []);

  const handleConvert = async () => {
    if (images.length === 0) return;

    try {
      setProgress({ current: 0, total: images.length, status: 'compressing' });
      
      const blob = await generatePDF(images, settings, setProgress);
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `images-${timestamp}.pdf`;
      
      downloadPDF(blob, filename);
      
      toast.success('PDF generated successfully!', {
        description: `${images.length} image${images.length !== 1 ? 's' : ''} converted to ${filename}`,
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      setProgress({
        current: 0,
        total: images.length,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.',
      });
      toast.error('Conversion failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const isConverting = progress.status === 'processing' || progress.status === 'compressing';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <FileImage className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Image to PDF</h1>
                <p className="text-xs text-muted-foreground">Free • Private • No upload</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero section */}
          <section className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Convert Images to PDF
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Drag & drop your images, arrange them in order, and download a single PDF. 
              All processing happens in your browser.
            </p>
            <div className="flex justify-center">
              <PrivacyNotice />
            </div>
          </section>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column - Upload and images */}
            <div className="lg:col-span-2 space-y-6">
              <ImageUploader
                images={images}
                onImagesAdd={handleImagesAdd}
                disabled={isConverting}
              />

              {images.length > 0 && (
                <ImageList
                  images={images}
                  onReorder={handleImagesReorder}
                  onRemove={handleImageRemove}
                  onClearAll={handleClearAll}
                  disabled={isConverting}
                />
              )}
            </div>

            {/* Right column - Settings and convert */}
            <div className="space-y-6">
              <PDFSettings
                settings={settings}
                onSettingsChange={setSettings}
                disabled={isConverting}
              />

              <CompressionSettings
                preset={settings.compression}
                onPresetChange={handleCompressionChange}
                disabled={isConverting}
              />

              {images.length > 0 && (
                <SizeEstimate
                  images={images}
                  preset={settings.compression}
                />
              )}

              <ConvertButton
                onClick={handleConvert}
                disabled={isConverting || images.length === 0}
                loading={isConverting}
                imageCount={images.length}
              />

              <ConversionProgress progress={progress} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>GDPR & Portuguese DPA compliant. No data stored or transmitted.</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Made with privacy in mind</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
