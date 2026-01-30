import { useState, useCallback, useEffect } from 'react';
import { ImageFile, PDFSettings as PDFSettingsType, ConversionProgress as ProgressType, CompressionPreset, ConversionMode, PageLayout } from '@/types/image';
import { ConversionDirection, PDFFile, ExtractedImage, PDFToImageSettings, DEFAULT_PDF_TO_IMAGE_SETTINGS } from '@/types/converter';
import { generatePDF, downloadPDF } from '@/lib/pdfGenerator';
import { convertPDFToImages } from '@/lib/pdfToImage';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageList } from '@/components/ImageList';
import { PDFSettings } from '@/components/PDFSettings';
import { ConversionModeToggle } from '@/components/ConversionModeToggle';
import { CompressionSettings } from '@/components/CompressionSettings';
import { PageLayoutOptions } from '@/components/PageLayoutOptions';
import { PDFLayoutPreview } from '@/components/PDFLayoutPreview';
import { SizeEstimate } from '@/components/SizeEstimate';
import { ConversionProgress } from '@/components/ConversionProgress';
import { ConvertButton } from '@/components/ConvertButton';
import { ConversionDirectionToggle } from '@/components/ConversionDirectionToggle';
import { PDFUploader } from '@/components/PDFUploader';
import { PDFToImageSettings as PDFToImageSettingsComponent } from '@/components/PDFToImageSettings';
import { ExtractedImagesList } from '@/components/ExtractedImagesList';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { FileImage, Shield, FileText, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const DEFAULT_SETTINGS: PDFSettingsType = {
  pageSize: 'a4',
  orientation: 'portrait',
  fitMode: 'fit',
  marginMm: 10,
  conversionMode: 'optimized',
  compression: 'balanced',
};

const Index = () => {
  // Conversion direction state
  const [conversionDirection, setConversionDirection] = useState<ConversionDirection>('image-to-pdf');
  
  // Image to PDF state
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<PDFSettingsType>(DEFAULT_SETTINGS);
  const [pageLayout, setPageLayout] = useState<PageLayout>('separate');
  
  // PDF to Image state
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [pdfToImageSettings, setPdfToImageSettings] = useState<PDFToImageSettings>(DEFAULT_PDF_TO_IMAGE_SETTINGS);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  
  // Shared state
  const [progress, setProgress] = useState<ProgressType>({
    current: 0,
    total: 0,
    status: 'idle',
  });

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  // Image to PDF handlers
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

  const handleConversionModeChange = useCallback((mode: ConversionMode) => {
    setSettings((prev) => ({ ...prev, conversionMode: mode }));
  }, []);

  const handlePageLayoutChange = useCallback((layout: PageLayout) => {
    setPageLayout(layout);
  }, []);

  const handleConvertImagesToPDF = async (useQuickExport = false) => {
    if (images.length === 0) return;

    const convertSettings = useQuickExport ? {
      ...DEFAULT_SETTINGS,
      conversionMode: 'direct' as ConversionMode,
    } : settings;

    try {
      setProgress({ current: 0, total: images.length, status: 'compressing' });
      
      const blob = await generatePDF(images, convertSettings, setProgress);
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `images-${timestamp}.pdf`;
      
      downloadPDF(blob, filename);
      
      toast.success(useQuickExport ? 'Quick export complete!' : 'PDF generated successfully!', {
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

  const handleQuickExport = useCallback(() => {
    handleConvertImagesToPDF(true);
  }, [images]);

  // PDF to Image handlers
  const handlePDFAdd = useCallback((pdf: PDFFile) => {
    setPdfFile(pdf);
    setExtractedImages([]);
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, []);

  const handleConvertPDFToImages = async () => {
    if (!pdfFile) return;

    try {
      setProgress({ current: 0, total: 0, status: 'processing' });
      
      const images = await convertPDFToImages(
        pdfFile,
        pdfToImageSettings,
        (current, total) => {
          setProgress({ current, total, status: 'processing' });
        }
      );
      
      setExtractedImages(images);
      setProgress({ current: images.length, total: images.length, status: 'complete' });
      
      toast.success('Conversion complete!', {
        description: `${images.length} page${images.length !== 1 ? 's' : ''} extracted as images`,
      });
    } catch (error) {
      console.error('PDF to image conversion failed:', error);
      setProgress({
        current: 0,
        total: 0,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to convert PDF. Please try again.',
      });
      toast.error('Conversion failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleClearExtractedImages = useCallback(() => {
    setExtractedImages([]);
    setPdfFile(null);
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, []);

  const isConverting = progress.status === 'processing' || progress.status === 'compressing';

  const getHeroContent = () => {
    if (conversionDirection === 'image-to-pdf') {
      return {
        title: 'Convert Images to PDF',
        description: 'Drag & drop your images, arrange them in order, and download a single PDF.',
      };
    }
    return {
      title: 'Convert PDF to Images',
      description: 'Upload a PDF file and extract each page as a high-quality image.',
    };
  };

  const heroContent = getHeroContent();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PDF & Images</h1>
                <p className="text-xs text-muted-foreground">Free • Private • No upload</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Conversion Direction Toggle */}
          <ConversionDirectionToggle
            direction={conversionDirection}
            onDirectionChange={setConversionDirection}
            disabled={isConverting}
          />

          {/* Hero section */}
          <section className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {heroContent.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {heroContent.description}
              {' '}All processing happens in your browser.
            </p>
            <div className="flex justify-center">
              <PrivacyNotice />
            </div>
          </section>

          {/* Image to PDF Mode */}
          {conversionDirection === 'image-to-pdf' && (
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

                <PageLayoutOptions
                  layout={pageLayout}
                  onLayoutChange={handlePageLayoutChange}
                  disabled={isConverting}
                />

                <ConversionModeToggle
                  mode={settings.conversionMode}
                  onModeChange={handleConversionModeChange}
                  disabled={isConverting}
                />

                {settings.conversionMode === 'optimized' && (
                  <CompressionSettings
                    preset={settings.compression}
                    onPresetChange={handleCompressionChange}
                    disabled={isConverting}
                  />
                )}

                {images.length > 0 && (
                  <PDFLayoutPreview
                    images={images}
                    settings={settings}
                  />
                )}

                {images.length > 0 && (
                  <SizeEstimate
                    images={images}
                    preset={settings.compression}
                    conversionMode={settings.conversionMode}
                  />
                )}

                <ConvertButton
                  onClick={() => handleConvertImagesToPDF(false)}
                  onQuickExport={handleQuickExport}
                  disabled={isConverting || images.length === 0}
                  loading={isConverting}
                  imageCount={images.length}
                />

                <ConversionProgress progress={progress} />
              </div>
            </div>
          )}

          {/* PDF to Image Mode */}
          {conversionDirection === 'pdf-to-image' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left column - PDF upload and extracted images */}
              <div className="lg:col-span-2 space-y-6">
                <PDFUploader
                  pdfFile={pdfFile}
                  onPDFAdd={handlePDFAdd}
                  disabled={isConverting}
                />

                {extractedImages.length > 0 && (
                  <ExtractedImagesList
                    images={extractedImages}
                    baseName={pdfFile?.name.replace('.pdf', '') || 'page'}
                    format={pdfToImageSettings.format}
                    onClear={handleClearExtractedImages}
                  />
                )}
              </div>

              {/* Right column - Settings and convert */}
              <div className="space-y-6">
                <PDFToImageSettingsComponent
                  settings={pdfToImageSettings}
                  onSettingsChange={setPdfToImageSettings}
                  disabled={isConverting}
                />

                <Button
                  onClick={handleConvertPDFToImages}
                  disabled={isConverting || !pdfFile}
                  size="lg"
                  className="w-full h-14 text-base font-semibold"
                >
                  {isConverting ? (
                    <>Converting...</>
                  ) : (
                    <>
                      <FileImage className="w-5 h-5 mr-2" aria-hidden="true" />
                      Extract Images
                    </>
                  )}
                </Button>

                <ConversionProgress progress={progress} />
              </div>
            </div>
          )}
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
