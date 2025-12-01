interface TimeframeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const timeframeOptions = [3, 5, 7, 10, 15, 20];

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="inline-flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-2xl">
      {timeframeOptions.map((years) => (
        <button
          key={years}
          onClick={() => onChange(years)}
          className={`
            px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
            ${value === years 
              ? 'bg-card text-foreground shadow-md ring-1 ring-border/50' 
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }
          `}
          data-testid={`button-timeframe-${years}`}
        >
          {years} {years === 1 ? "Jahr" : "Jahre"}
        </button>
      ))}
    </div>
  );
}
