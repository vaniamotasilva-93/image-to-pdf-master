import { PDFToImageSettings as SettingsType, ImageOutputFormat } from '@/types/converter';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Settings2 } from 'lucide-react';

interface PDFToImageSettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  disabled?: boolean;
}

export const PDFToImageSettings = ({ settings, onSettingsChange, disabled }: PDFToImageSettingsProps) => {
  const updateSetting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 p-5 bg-card rounded-xl border border-border shadow-card">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-primary" aria-hidden="true" />
        Output Settings
      </h2>

      {/* Output Format */}
      <fieldset disabled={disabled} className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Image Format</legend>
        <RadioGroup
          value={settings.format}
          onValueChange={(value) => updateSetting('format', value as ImageOutputFormat)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="png" id="format-png" />
            <Label htmlFor="format-png" className="cursor-pointer">
              PNG <span className="text-muted-foreground text-xs">(lossless)</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="jpeg" id="format-jpeg" />
            <Label htmlFor="format-jpeg" className="cursor-pointer">
              JPEG <span className="text-muted-foreground text-xs">(smaller)</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="webp" id="format-webp" />
            <Label htmlFor="format-webp" className="cursor-pointer">
              WebP <span className="text-muted-foreground text-xs">(modern)</span>
            </Label>
          </div>
        </RadioGroup>
      </fieldset>

      {/* Quality (for JPEG/WebP) */}
      {settings.format !== 'png' && (
        <fieldset disabled={disabled} className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-medium text-foreground">Quality</legend>
            <span className="text-sm text-muted-foreground">
              {Math.round(settings.quality * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.quality]}
            onValueChange={([value]) => updateSetting('quality', value)}
            min={0.5}
            max={1}
            step={0.05}
            aria-label="Image quality"
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Smaller</span>
            <span>Higher quality</span>
          </div>
        </fieldset>
      )}

      {/* Scale/Resolution */}
      <fieldset disabled={disabled} className="space-y-3">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium text-foreground">Resolution</legend>
          <span className="text-sm text-muted-foreground">{settings.scale}x</span>
        </div>
        <Slider
          value={[settings.scale]}
          onValueChange={([value]) => updateSetting('scale', value)}
          min={1}
          max={3}
          step={0.5}
          aria-label="Image resolution scale"
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1x (faster)</span>
          <span>3x (sharper)</span>
        </div>
      </fieldset>
    </div>
  );
};
