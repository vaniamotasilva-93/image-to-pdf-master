import { PDFSettings as PDFSettingsType, PageSize, PageOrientation, ImageFitMode } from '@/types/image';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { FileText, Maximize2, Move, Image as ImageIcon } from 'lucide-react';

interface PDFSettingsProps {
  settings: PDFSettingsType;
  onSettingsChange: (settings: PDFSettingsType) => void;
  disabled?: boolean;
}

export const PDFSettings = ({ settings, onSettingsChange, disabled }: PDFSettingsProps) => {
  const updateSetting = <K extends keyof PDFSettingsType>(
    key: K, 
    value: PDFSettingsType[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 p-5 bg-card rounded-xl border border-border shadow-card">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
        PDF Settings
      </h2>

      {/* Page Size */}
      <fieldset disabled={disabled} className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Page Size</legend>
        <RadioGroup
          value={settings.pageSize}
          onValueChange={(value) => updateSetting('pageSize', value as PageSize)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="a4" id="page-a4" />
            <Label htmlFor="page-a4" className="cursor-pointer">
              A4 <span className="text-muted-foreground text-xs">(210×297mm)</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="letter" id="page-letter" />
            <Label htmlFor="page-letter" className="cursor-pointer">
              Letter <span className="text-muted-foreground text-xs">(8.5×11")</span>
            </Label>
          </div>
        </RadioGroup>
      </fieldset>

      {/* Orientation */}
      <fieldset disabled={disabled} className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Orientation</legend>
        <RadioGroup
          value={settings.orientation}
          onValueChange={(value) => updateSetting('orientation', value as PageOrientation)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="portrait" id="orient-portrait" />
            <Label htmlFor="orient-portrait" className="cursor-pointer flex items-center gap-1.5">
              <span className="w-3 h-4 border border-current rounded-sm" aria-hidden="true" />
              Portrait
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="landscape" id="orient-landscape" />
            <Label htmlFor="orient-landscape" className="cursor-pointer flex items-center gap-1.5">
              <span className="w-4 h-3 border border-current rounded-sm" aria-hidden="true" />
              Landscape
            </Label>
          </div>
        </RadioGroup>
      </fieldset>

      {/* Image Fit Mode */}
      <fieldset disabled={disabled} className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Image Fit</legend>
        <RadioGroup
          value={settings.fitMode}
          onValueChange={(value) => updateSetting('fitMode', value as ImageFitMode)}
          className="grid gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fit" id="fit-fit" />
            <Label htmlFor="fit-fit" className="cursor-pointer flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>
                Fit to page
                <span className="text-muted-foreground text-xs ml-1">(no cropping)</span>
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fill" id="fit-fill" />
            <Label htmlFor="fit-fill" className="cursor-pointer flex items-center gap-2">
              <Move className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>
                Fill page
                <span className="text-muted-foreground text-xs ml-1">(may crop edges)</span>
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="original" id="fit-original" />
            <Label htmlFor="fit-original" className="cursor-pointer flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>
                Original size
                <span className="text-muted-foreground text-xs ml-1">(centered)</span>
              </span>
            </Label>
          </div>
        </RadioGroup>
      </fieldset>

      {/* Margins */}
      <fieldset disabled={disabled} className="space-y-3">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium text-foreground">
            Margins
          </legend>
          <span className="text-sm text-muted-foreground">
            {settings.marginMm}mm
          </span>
        </div>
        <Slider
          value={[settings.marginMm]}
          onValueChange={([value]) => updateSetting('marginMm', value)}
          min={0}
          max={30}
          step={1}
          aria-label="Margin size in millimeters"
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0mm</span>
          <span>30mm</span>
        </div>
      </fieldset>
    </div>
  );
};
