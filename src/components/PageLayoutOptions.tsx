import { PageLayout } from '@/types/image';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LayoutGrid, Rows3 } from 'lucide-react';

interface PageLayoutOptionsProps {
  layout: PageLayout;
  onLayoutChange: (layout: PageLayout) => void;
  disabled?: boolean;
}

export const PageLayoutOptions = ({ layout, onLayoutChange, disabled }: PageLayoutOptionsProps) => {
  return (
    <div className="space-y-3 p-5 bg-card rounded-xl border border-border shadow-card">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Rows3 className="w-5 h-5 text-primary" aria-hidden="true" />
        Page Layout
      </h2>

      <fieldset disabled={disabled} className="space-y-2">
        <RadioGroup
          value={layout}
          onValueChange={(value) => onLayoutChange(value as PageLayout)}
          className="grid gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="separate" id="layout-separate" />
            <Label htmlFor="layout-separate" className="cursor-pointer flex items-center gap-2">
              <Rows3 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>
                One image per page
                <span className="text-muted-foreground text-xs ml-1">(separate pages)</span>
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 opacity-50">
            <RadioGroupItem value="combined" id="layout-combined" disabled />
            <Label htmlFor="layout-combined" className="cursor-not-allowed flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>
                Grid layout
                <span className="text-muted-foreground text-xs ml-1">(coming soon)</span>
              </span>
            </Label>
          </div>
        </RadioGroup>
      </fieldset>
    </div>
  );
};
