import { useState, useCallback } from 'react';
import { PDFFile } from '@/types/converter';
import { ConversionProgress as ProgressType } from '@/types/image';
import { PDFCompressionLevel, compressPDF, downloadCompressedPDF, getCompressionConfig } from '@/lib/pdfCompressor';
import { PDFUploader } from '@/components/PDFUploader';
import { ConversionProgress } from '@/components/ConversionProgress';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileDown, Minimize2, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const PDFCompressorView = () => {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [level, setLevel] = useState<PDFCompressionLevel>('balanced');
  const [progress, setProgress] = useState<ProgressType>({ current: 0, total: 0, status: 'idle' });
  const [result, setResult] = useState<{ originalSize: number; compressedSize: number; blob: Blob; pageCount: number } | null>(null);

  const isConverting = progress.status === 'processing' || progress.status === 'compressing';

  const handlePDFAdd = useCallback((pdf: PDFFile) => {
    setPdfFile(pdf);
    setResult(null);
    setProgress({ current: 0, total: 0, status: 'idle' });
  }, []);

  const handleCompress = async () => {
    if (!pdfFile) return;

    try {
      setResult(null);
      setProgress({ current: 0, total: 0, status: 'processing' });

      const res = await compressPDF(pdfFile.file, level, (current, total) => {
        setProgress({ current, total, status: 'processing' });
      });

      setResult(res);
      setProgress({ current: res.pageCount, total: res.pageCount, status: 'complete' });

      const savedPercent = Math.round((1 - res.compressedSize / res.originalSize) * 100);
      toast.success('PDF compressed!', {
        description: savedPercent > 0
          ? `Reduced by ${savedPercent}% (${formatBytes(res.originalSize)} → ${formatBytes(res.compressedSize)})`
          : 'File was already well-optimised.',
      });
    } catch (error) {
      console.error('PDF compression failed:', error);
      setProgress({
        current: 0,
        total: 0,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to compress PDF.',
      });
      toast.error('Compression failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleDownload = () => {
    if (!result || !pdfFile) return;
    downloadCompressedPDF(result.blob, pdfFile.name);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-6">
        <PDFUploader pdfFile={pdfFile} onPDFAdd={handlePDFAdd} disabled={isConverting} />

        {result && (
          <div className="p-5 bg-card rounded-xl border border-border shadow-[var(--shadow-md)] space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" aria-hidden="true" />
              Compression Result
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Original</p>
                <p className="text-lg font-semibold text-foreground">{formatBytes(result.originalSize)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Compressed</p>
                <p className="text-lg font-semibold text-foreground">{formatBytes(result.compressedSize)}</p>
              </div>
            </div>
            {result.compressedSize < result.originalSize && (
              <p className="text-sm text-success font-medium">
                Saved {Math.round((1 - result.compressedSize / result.originalSize) * 100)}% •{' '}
                {result.pageCount} page{result.pageCount !== 1 ? 's' : ''}
              </p>
            )}
            <Button onClick={handleDownload} size="lg" className="w-full h-14 text-base font-semibold">
              <FileDown className="w-5 h-5 mr-2" aria-hidden="true" />
              Download Compressed PDF
            </Button>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <div className="p-5 bg-card rounded-xl border border-border shadow-[var(--shadow-md)] space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Minimize2 className="w-5 h-5 text-primary" aria-hidden="true" />
            Compression Level
          </h2>
          <RadioGroup
            value={level}
            onValueChange={(v) => setLevel(v as PDFCompressionLevel)}
            className="space-y-2"
            disabled={isConverting}
          >
            {(['balanced', 'aggressive'] as PDFCompressionLevel[]).map((l) => {
              const config = getCompressionConfig(l);
              return (
                <div key={l} className="flex items-center space-x-2">
                  <RadioGroupItem value={l} id={`compress-${l}`} />
                  <Label htmlFor={`compress-${l}`} className="cursor-pointer">
                    <span className="capitalize">{l}</span>
                    <span className="text-muted-foreground text-xs ml-1">— {config.label.split('–')[1]?.trim()}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground flex items-start gap-2">
          <FileText className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Compression re-encodes embedded images at lower quality. Text and vector graphics are rasterised per page.
            Best results on image-heavy PDFs.
          </span>
        </div>

        <Button
          onClick={handleCompress}
          disabled={isConverting || !pdfFile}
          size="lg"
          className="w-full h-14 text-base font-semibold"
        >
          {isConverting ? 'Compressing…' : (
            <>
              <Minimize2 className="w-5 h-5 mr-2" aria-hidden="true" />
              Compress PDF
            </>
          )}
        </Button>

        <ConversionProgress progress={progress} />
      </div>
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
