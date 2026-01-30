import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConvertButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  imageCount: number;
}

export const ConvertButton = ({ onClick, disabled, loading, imageCount }: ConvertButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading || imageCount === 0}
      size="lg"
      className={cn(
        "w-full h-14 text-base font-semibold",
        "bg-primary hover:bg-primary-hover text-primary-foreground",
        "shadow-card hover:shadow-card-lg transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      aria-label={loading ? 'Converting images to PDF' : `Convert ${imageCount} images to PDF`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
          Converting...
        </>
      ) : (
        <>
          <FileDown className="w-5 h-5 mr-2" aria-hidden="true" />
          Convert to PDF
          {imageCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded-full text-sm">
              {imageCount}
            </span>
          )}
        </>
      )}
    </Button>
  );
};
