import { ConversionDirection } from '@/types/converter';
import { FileImage, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionDirectionToggleProps {
  direction: ConversionDirection;
  onDirectionChange: (direction: ConversionDirection) => void;
  disabled?: boolean;
}

export const ConversionDirectionToggle = ({ 
  direction, 
  onDirectionChange, 
  disabled 
}: ConversionDirectionToggleProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-xl">
      <button
        onClick={() => onDirectionChange('image-to-pdf')}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all",
          direction === 'image-to-pdf'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-card/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-pressed={direction === 'image-to-pdf'}
      >
        <FileImage className="w-4 h-4" aria-hidden="true" />
        <ArrowRight className="w-3 h-3" aria-hidden="true" />
        <FileText className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Image to PDF</span>
      </button>
      
      <button
        onClick={() => onDirectionChange('pdf-to-image')}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all",
          direction === 'pdf-to-image'
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-card/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-pressed={direction === 'pdf-to-image'}
      >
        <FileText className="w-4 h-4" aria-hidden="true" />
        <ArrowRight className="w-3 h-3" aria-hidden="true" />
        <FileImage className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">PDF to Image</span>
      </button>
    </div>
  );
};
