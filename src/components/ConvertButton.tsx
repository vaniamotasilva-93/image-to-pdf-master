import { FileDown, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConvertButtonProps {
  onClick: () => void;
  onQuickExport?: () => void;
  disabled?: boolean;
  loading?: boolean;
  imageCount: number;
}

export const ConvertButton = ({ onClick, onQuickExport, disabled, loading, imageCount }: ConvertButtonProps) => {
  return (
    <div className="space-y-2">
      <Button
        onClick={onClick}
        disabled={disabled || loading || imageCount === 0}
        size="lg"
        className={cn(
          "w-full h-14 text-base font-semibold",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "shadow-card hover:shadow-lg transition-all duration-200",
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

      {/* Quick Export Button */}
      {onQuickExport && imageCount > 0 && !loading && (
        <Button
          onClick={onQuickExport}
          disabled={disabled || loading}
          variant="outline"
          size="sm"
          className={cn(
            "w-full h-10 text-sm",
            "border-border hover:bg-accent hover:text-accent-foreground",
            "transition-all duration-200"
          )}
          aria-label={`Quick export ${imageCount} images to PDF with default settings`}
        >
          <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
          Quick Export
          <span className="ml-1 text-xs text-muted-foreground">(A4, Portrait, Direct)</span>
        </Button>
      )}
    </div>
  );
};
