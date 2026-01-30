import { useCallback, useRef, useState } from 'react';
import { Upload, ImagePlus, AlertCircle } from 'lucide-react';
import { 
  SUPPORTED_FORMATS, 
  SUPPORTED_EXTENSIONS, 
  MAX_FILE_SIZE_MB, 
  MAX_FILES,
  MAX_TOTAL_SIZE_MB,
  ImageFile 
} from '@/types/image';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: ImageFile[];
  onImagesAdd: (newImages: ImageFile[]) => void;
  disabled?: boolean;
}

export const ImageUploader = ({ images, onImagesAdd, disabled }: ImageUploaderProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    
    // Check total file count
    const totalCount = images.length + fileArray.length;
    if (totalCount > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed. You have ${images.length}, trying to add ${fileArray.length}.`);
      return;
    }

    const validFiles: ImageFile[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      // Check format
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        errors.push(`${file.name}: Unsupported format. Use JPG, PNG, or WebP.`);
        continue;
      }

      // Check size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        errors.push(`${file.name}: File too large (${sizeMB.toFixed(1)}MB). Maximum is ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        name: file.name,
        size: file.size,
      });
    }

    // Check total size
    const currentTotalSize = images.reduce((sum, img) => sum + img.size, 0);
    const newTotalSize = validFiles.reduce((sum, img) => sum + img.size, 0);
    const totalSizeMB = (currentTotalSize + newTotalSize) / (1024 * 1024);
    
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      setError(`Total size (${totalSizeMB.toFixed(1)}MB) exceeds ${MAX_TOTAL_SIZE_MB}MB limit. Browser may become slow.`);
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
    }

    if (validFiles.length > 0) {
      onImagesAdd(validFiles);
    }
  }, [images, onImagesAdd]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFiles(files);
    }
  }, [disabled, validateAndProcessFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFiles(files);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [validateAndProcessFiles]);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload images. Drag and drop or click to browse."
        aria-disabled={disabled}
        className={cn(
          "dropzone relative flex flex-col items-center justify-center p-8 md:p-12 cursor-pointer",
          "min-h-[200px] transition-all duration-200",
          isDragActive && "dropzone-active scale-[1.01]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={SUPPORTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
          disabled={disabled}
        />
        
        <div className={cn(
          "flex flex-col items-center gap-4 text-center transition-transform duration-200",
          isDragActive && "scale-105"
        )}>
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragActive 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          )}>
            {isDragActive ? (
              <ImagePlus className="w-8 h-8" aria-hidden="true" />
            ) : (
              <Upload className="w-8 h-8" aria-hidden="true" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-foreground">
              {isDragActive ? 'Drop images here' : 'Drag & drop images'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or <span className="text-primary font-medium">browse files</span>
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP • Max {MAX_FILE_SIZE_MB}MB each • Up to {MAX_FILES} images
          </p>
        </div>
      </div>

      {error && (
        <div 
          role="alert" 
          className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {images.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {images.length} image{images.length !== 1 ? 's' : ''} selected
          {' • '}
          {(images.reduce((sum, img) => sum + img.size, 0) / (1024 * 1024)).toFixed(1)}MB total
        </p>
      )}
    </div>
  );
};
