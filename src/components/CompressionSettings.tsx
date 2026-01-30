import { CompressionPreset, COMPRESSION_PRESETS } from '@/types/image';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Minimize2, AlertTriangle } from 'lucide-react';

interface CompressionSettingsProps {
  preset: CompressionPreset;
  onPresetChange: (preset: CompressionPreset) => void;
  disabled?: boolean;
}

const presetOrder: CompressionPreset[] = ['high', 'balanced', 'small', 'verySmall'];

export const CompressionSettings = ({
  preset,
  onPresetChange,
  disabled,
}: CompressionSettingsProps) => {
  const currentConfig = COMPRESSION_PRESETS[preset];

  return (
    <div className="space-y-4 p-5 bg-card rounded-xl border border-border shadow-card">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Minimize2 className="w-5 h-5 text-primary" aria-hidden="true" />
        Compression
      </h2>

      <fieldset disabled={disabled} className="space-y-3">
        <legend className="sr-only">Compression preset</legend>
        <RadioGroup
          value={preset}
          onValueChange={(value) => onPresetChange(value as CompressionPreset)}
          className="grid gap-2"
        >
          {presetOrder.map((presetKey) => {
            const config = COMPRESSION_PRESETS[presetKey];
            return (
              <div key={presetKey} className="flex items-center space-x-2">
                <RadioGroupItem value={presetKey} id={`compression-${presetKey}`} />
                <Label
                  htmlFor={`compression-${presetKey}`}
                  className="cursor-pointer flex items-center gap-2 flex-1"
                >
                  <span className="flex-1">
                    {config.label}
                    <span className="text-muted-foreground text-xs ml-1">
                      ({config.description})
                    </span>
                  </span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </fieldset>

      {/* Warning for aggressive compression */}
      {currentConfig.warning && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm"
        >
          <AlertTriangle
            className="w-4 h-4 text-warning shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span className="text-warning-foreground">{currentConfig.warning}</span>
        </div>
      )}
    </div>
  );
};
