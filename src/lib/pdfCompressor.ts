import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';

// Worker already configured in pdfToImage.ts, but ensure it's set here too
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
}

export type PDFCompressionLevel = 'balanced' | 'aggressive';

const COMPRESSION_CONFIGS: Record<PDFCompressionLevel, { quality: number; scale: number; label: string }> = {
  balanced: { quality: 0.7, scale: 1.5, label: 'Balanced – good quality, moderate reduction' },
  aggressive: { quality: 0.4, scale: 1.0, label: 'Aggressive – smaller file, lower quality' },
};

export const getCompressionConfig = (level: PDFCompressionLevel) => COMPRESSION_CONFIGS[level];

export const compressPDF = async (
  file: File,
  level: PDFCompressionLevel = 'balanced',
  onProgress?: (current: number, total: number) => void
): Promise<CompressionResult> => {
  const config = COMPRESSION_CONFIGS[level];
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;

  // Get first page to determine orientation
  const firstPage = await pdf.getPage(1);
  const firstViewport = firstPage.getViewport({ scale: 1 });

  let doc: jsPDF | null = null;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: config.scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = canvas.toDataURL('image/jpeg', config.quality);

    // Page dimensions in mm (72 DPI base for PDF points → mm)
    const pdfPageWidthMm = (viewport.width / config.scale) * (25.4 / 72);
    const pdfPageHeightMm = (viewport.height / config.scale) * (25.4 / 72);

    if (i === 1) {
      const orientation = pdfPageWidthMm > pdfPageHeightMm ? 'landscape' : 'portrait';
      doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: [pdfPageWidthMm, pdfPageHeightMm],
      });
    } else {
      doc!.addPage([pdfPageWidthMm, pdfPageHeightMm]);
    }

    doc!.addImage(imgData, 'JPEG', 0, 0, pdfPageWidthMm, pdfPageHeightMm);

    // Cleanup
    canvas.width = 0;
    canvas.height = 0;

    onProgress?.(i, pageCount);
  }

  const blob = doc!.output('blob');

  return {
    blob,
    originalSize: file.size,
    compressedSize: blob.size,
    pageCount,
  };
};

export const downloadCompressedPDF = (blob: Blob, originalName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const baseName = originalName.replace(/\.pdf$/i, '');
  a.download = `${baseName}-compressed.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
