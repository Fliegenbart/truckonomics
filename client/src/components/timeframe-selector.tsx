import { Button } from "@/components/ui/button";

interface TimeframeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const timeframeOptions = [3, 5, 7, 10, 15, 20];

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {timeframeOptions.map((years) => (
        <Button
          key={years}
          variant={value === years ? "default" : "outline"}
          onClick={() => onChange(years)}
          className="min-w-16"
          data-testid={`button-timeframe-${years}`}
        >
          {years} {years === 1 ? "Year" : "Years"}
        </Button>
      ))}
    </div>
  );
}
