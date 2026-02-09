import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { PDFFile } from '@/types/converter';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { isValidPDFFile } from '@/lib/fileValidation';

interface PDFUploaderProps {
  pdfFile: PDFFile | null;
  onPDFAdd: (pdf: PDFFile) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 50;

export const PDFUploader = ({ pdfFile, onPDFAdd, disabled }: PDFUploaderProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large`, {
        description: `Maximum size is ${MAX_FILE_SIZE_MB}MB`,
      });
      return;
    }

    // Validate actual file content via magic bytes
    const validContent = await isValidPDFFile(file);
    if (!validContent) {
      toast.error('Invalid file', {
        description: 'File content does not match PDF format.',
      });
      return;
    }
    
    const pdf: PDFFile = {
      id: `pdf-${Date.now()}`,
      file,
      name: file.name,
      size: file.size,
    };
    
    onPDFAdd(pdf);
  }, [onPDFAdd]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled,
  });
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
        isDragActive && !isDragReject && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        !isDragActive && !isDragReject && "border-border hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      <input {...getInputProps()} aria-label="Upload PDF file" />
      
      <div className="flex flex-col items-center gap-4">
        {isDragReject ? (
          <>
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-medium text-destructive">Invalid file type</p>
              <p className="text-sm text-muted-foreground mt-1">Only PDF files are accepted</p>
            </div>
          </>
        ) : pdfFile ? (
          <>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">{pdfFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                {pdfFile.pageCount && ` • ${pdfFile.pageCount} pages`}
              </p>
              <p className="text-xs text-primary mt-2">Click or drop to replace</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Upload className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? 'Drop your PDF here' : 'Drop PDF here or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Maximum file size: {MAX_FILE_SIZE_MB}MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
