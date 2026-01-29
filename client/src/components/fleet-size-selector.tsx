import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck } from "lucide-react";

interface FleetSizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function FleetSizeSelector({ value, onChange }: FleetSizeSelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 500) {
      onChange(parsed);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      onChange(1);
      setInputValue("1");
    } else if (parsed > 500) {
      onChange(500);
      setInputValue("500");
    }
  };

  // Visual truck indicators
  const truckIndicators = Math.min(value, 10);

  return (
    <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Flottengröße</h3>
          <p className="text-sm text-muted-foreground">
            Berechnung auf Ihre gesamte Flotte hochrechnen
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl">
          <Truck className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold tabular-nums text-primary">{value}</span>
        </div>
      </div>

      {/* Visual Fleet Indicator */}
      <div className="flex items-center gap-1 mb-6 min-h-[28px]">
        {Array.from({ length: truckIndicators }).map((_, i) => (
          <div
            key={i}
            className="relative transition-all duration-300"
            style={{
              animationDelay: `${i * 50}ms`,
            }}
          >
            <Truck
              className="h-6 w-6 text-primary/80 transition-transform hover:scale-110"
              style={{
                opacity: 0.4 + (i / truckIndicators) * 0.6,
              }}
            />
          </div>
        ))}
        {value > 10 && (
          <span className="text-sm text-muted-foreground ml-2">
            +{value - 10} weitere
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <Slider
              value={[Math.min(value, 100)]}
              onValueChange={handleSliderChange}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>1</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100+</span>
            </div>
          </div>
          <div className="w-24">
            <Label htmlFor="fleet-input" className="sr-only">Fahrzeuganzahl</Label>
            <Input
              id="fleet-input"
              type="number"
              min={1}
              max={500}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="text-center text-lg font-semibold h-12"
            />
          </div>
        </div>

        {/* Fleet scale badges */}
        <div className="flex flex-wrap gap-2">
          {[1, 5, 10, 25, 50, 100].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                onChange(preset);
                setInputValue(preset.toString());
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                value === preset
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {preset} {preset === 1 ? "Fahrzeug" : "Fahrzeuge"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
