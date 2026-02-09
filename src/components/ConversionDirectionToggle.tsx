import { ConversionDirection } from '@/types/converter';
import { FileImage, FileText, ArrowRight, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionDirectionToggleProps {
  direction: ConversionDirection;
  onDirectionChange: (direction: ConversionDirection) => void;
  disabled?: boolean;
}

const tabs: { value: ConversionDirection; label: string; icons: 'img-to-pdf' | 'pdf-to-img' | 'compress' }[] = [
  { value: 'image-to-pdf', label: 'Image to PDF', icons: 'img-to-pdf' },
  { value: 'pdf-to-image', label: 'PDF to Image', icons: 'pdf-to-img' },
  { value: 'compress-pdf', label: 'Compress PDF', icons: 'compress' },
];

export const ConversionDirectionToggle = ({ 
  direction, 
  onDirectionChange, 
  disabled 
}: ConversionDirectionToggleProps) => {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-xl" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          onClick={() => onDirectionChange(tab.value)}
          disabled={disabled}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-lg text-sm font-medium transition-all",
            direction === tab.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-selected={direction === tab.value}
        >
          {tab.icons === 'img-to-pdf' && (
            <>
              <FileImage className="w-4 h-4" aria-hidden="true" />
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
              <FileText className="w-4 h-4" aria-hidden="true" />
            </>
          )}
          {tab.icons === 'pdf-to-img' && (
            <>
              <FileText className="w-4 h-4" aria-hidden="true" />
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
              <FileImage className="w-4 h-4" aria-hidden="true" />
            </>
          )}
          {tab.icons === 'compress' && (
            <Minimize2 className="w-4 h-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
