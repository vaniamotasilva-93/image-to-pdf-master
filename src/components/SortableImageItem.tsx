import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '@/types/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SortableImageItemProps {
  image: ImageFile;
  index: number;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const SortableImageItem = ({ image, index, onRemove, disabled }: SortableImageItemProps) => {
  const [imageError, setImageError] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: image.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onRemove(image.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onRemove(image.id);
    }
  };

  const sizeMB = (image.size / (1024 * 1024)).toFixed(2);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-3 p-3 bg-card rounded-lg border border-border",
        "transition-all duration-200",
        isDragging && "shadow-lg z-50 scale-102 opacity-90",
        !isDragging && "hover:shadow-md",
        disabled && "opacity-60"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className={cn(
          "flex-shrink-0 p-1 rounded text-muted-foreground",
          "hover:text-foreground hover:bg-secondary",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-colors cursor-grab active:cursor-grabbing",
          disabled && "cursor-not-allowed opacity-50"
        )}
        aria-label={`Drag to reorder ${image.name}`}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-6 h-6" aria-hidden="true" />
          </div>
        ) : (
          <img
            src={image.preview}
            alt={`Preview of ${image.name}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        {/* Index badge */}
        <span 
          className="absolute top-0.5 left-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-foreground/80 text-background rounded"
          aria-label={`Image ${index + 1}`}
        >
          {index + 1}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate" title={image.name}>
          {image.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {sizeMB} MB
        </p>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={handleRemove}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "flex-shrink-0 p-1.5 rounded-full text-muted-foreground",
          "hover:text-destructive hover:bg-destructive/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100",
          disabled && "cursor-not-allowed opacity-50"
        )}
        aria-label={`Remove ${image.name}`}
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};
