import { ConversionProgress as ProgressType } from '@/types/image';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionProgressProps {
  progress: ProgressType;
}

export const ConversionProgress = ({ progress }: ConversionProgressProps) => {
  const percentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  if (progress.status === 'idle') {
    return null;
  }

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border animate-fade-in",
        progress.status === 'complete' && "bg-success/10 border-success/30",
        progress.status === 'processing' && "bg-primary/5 border-primary/20",
        progress.status === 'error' && "bg-destructive/10 border-destructive/30"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {progress.status === 'processing' && (
          <Loader2 className="w-5 h-5 text-primary animate-spin" aria-hidden="true" />
        )}
        {progress.status === 'complete' && (
          <CheckCircle2 className="w-5 h-5 text-success" aria-hidden="true" />
        )}
        {progress.status === 'error' && (
          <AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
        )}
        
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            progress.status === 'complete' && "text-success",
            progress.status === 'processing' && "text-foreground",
            progress.status === 'error' && "text-destructive"
          )}>
            {progress.message || `Processing image ${progress.current} of ${progress.total}`}
          </p>
          
          {progress.status === 'processing' && (
            <div className="mt-2 relative">
              <Progress value={percentage} className="h-2" />
              <span className="sr-only">{percentage}% complete</span>
            </div>
          )}
        </div>

        {progress.status === 'processing' && (
          <span className="text-sm text-muted-foreground">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
};
