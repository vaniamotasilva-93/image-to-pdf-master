import { ConversionMode } from '@/types/image';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Zap, Settings2 } from 'lucide-react';

interface ConversionModeToggleProps {
  mode: ConversionMode;
  onModeChange: (mode: ConversionMode) => void;
  disabled?: boolean;
}

export const ConversionModeToggle = ({
  mode,
  onModeChange,
  disabled
}: ConversionModeToggleProps) => {
  return (
    <div className="space-y-3 p-5 bg-card rounded-xl border border-border shadow-card">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-primary" aria-hidden="true" />
        Conversion Mode
      </h2>

      <fieldset disabled={disabled} className="space-y-2">
        <legend className="sr-only">Select conversion mode</legend>
        <RadioGroup
          value={mode}
          onValueChange={(value) => onModeChange(value as ConversionMode)}
          className="grid gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="direct" id="mode-direct" />
            <Label htmlFor="mode-direct" className="cursor-pointer flex items-center gap-2 flex-1">
              <Zap className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1">
                Direct conversion
                <span className="text-muted-foreground text-xs ml-1">
                  (preserves original quality)
                </span>
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="optimized" id="mode-optimized" />
            <Label htmlFor="mode-optimized" className="cursor-pointer flex items-center gap-2 flex-1">
              <Settings2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1">
                Optimized conversion
                <span className="text-muted-foreground text-xs ml-1">
                  (smaller file size)
                </span>
              </span>
            </Label>
          </div>
        </RadioGroup>
      </fieldset>
    </div>
  );
};
