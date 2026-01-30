import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { ImageFile } from '@/types/image';
import { SortableImageItem } from './SortableImageItem';
import { Trash2 } from 'lucide-react';

interface ImageListProps {
  images: ImageFile[];
  onReorder: (images: ImageFile[]) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export const ImageList = ({ images, onReorder, onRemove, onClearAll, disabled }: ImageListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      
      onReorder(arrayMove(images, oldIndex, newIndex));
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">
          Images to convert ({images.length})
        </h2>
        <button
          type="button"
          onClick={onClearAll}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove all images"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          Clear all
        </button>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        Drag to reorder. Images will appear in this order in the PDF.
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2" role="list" aria-label="Selected images">
            {images.map((image, index) => (
              <li key={image.id}>
                <SortableImageItem
                  image={image}
                  index={index}
                  onRemove={onRemove}
                  disabled={disabled}
                />
              </li>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};
