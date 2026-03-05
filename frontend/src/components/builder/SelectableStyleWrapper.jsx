import { Palette, Pipette } from "lucide-react";

import { cn } from "@/lib/utils";


export const SelectableStyleWrapper = ({
  children,
  inline = false,
  selected = false,
  showHandle = false,
  onSelect,
  label,
  wrapperClassName,
  selectionClassName,
  handleClassName,
  testId,
}) => {
  const shouldShowHandle = showHandle || selected;

  return (
    <div
      className={cn(
        "group/color-target relative max-w-full",
        inline ? "inline-flex items-start" : "block",
        wrapperClassName
      )}
      data-testid={testId}
    >
      {shouldShowHandle ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelect?.();
          }}
          className={cn(
            "component-color-handle absolute right-1 top-1 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/92 text-zinc-700 shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-[transform,opacity,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.22)]",
            selected
              ? "opacity-100 ring-2 ring-primary/35"
              : "opacity-0 group-hover/color-target:opacity-100 group-focus-within/color-target:opacity-100",
            inline && "right-0 top-0 -translate-y-1/2 translate-x-1/3",
            handleClassName
          )}
          aria-label={`Select ${label} colors`}
          data-testid={testId ? `${testId}-handle` : undefined}
        >
          {selected ? <Pipette className="h-3.5 w-3.5" /> : <Palette className="h-3.5 w-3.5" />}
        </button>
      ) : null}

      <div
        className={cn(
          "rounded-[1rem] transition-[box-shadow,outline,transform] duration-200",
          selected && "ring-2 ring-primary/45 ring-offset-2 ring-offset-transparent",
          selectionClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};