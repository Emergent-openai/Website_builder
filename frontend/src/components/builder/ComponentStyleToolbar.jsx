import { Pipette, X } from "lucide-react";

import { cn } from "@/lib/utils";


const isValidHex = (value) => /^#[0-9A-Fa-f]{6}$/.test(value || "");


const resolveColorValue = (section, target, control) => {
  if (!section || !target) {
    return control.defaultValue;
  }

  if (target.kind === "section") {
    const value = section.styles?.[control.key];
    return isValidHex(value) ? value : control.defaultValue;
  }

  const value = section.styles?.elementStyles?.[target.key]?.[control.key];
  return isValidHex(value) ? value : control.defaultValue;
};


export const ComponentStyleToolbar = ({
  target,
  section,
  onUpdateColor,
  onClear,
}) => {
  if (!target || !section) {
    return null;
  }

  return (
    <div className="mb-6 flex justify-center px-1" data-testid="component-style-toolbar-shell">
      <div
        className="flex w-full max-w-[calc(100%-0.5rem)] flex-wrap items-center justify-center gap-3 rounded-[1.7rem] border border-slate-800/70 bg-[linear-gradient(145deg,rgba(10,16,32,0.95),rgba(4,9,22,0.92))] px-3 py-3 shadow-[0_24px_52px_rgba(2,6,23,0.45)] md:max-w-[calc(100%-1rem)] md:px-4"
        data-testid="component-style-toolbar"
      >
        <div className="flex min-w-0 items-center gap-3 pr-1" data-testid="component-style-toolbar-heading-shell">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6f73ff_0%,#8663ff_42%,#06b6d4_100%)] text-white shadow-[0_14px_30px_rgba(34,211,238,0.22)]">
            <Pipette className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400" data-testid="component-style-toolbar-label">
              Quick color tool
            </p>
            <h3 className="mt-1 truncate font-heading text-lg font-semibold tracking-[-0.03em] text-slate-100 md:text-xl" data-testid="component-style-toolbar-title">
              {target.label}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {target.controls.map((control) => {
            const currentValue = resolveColorValue(section, target, control);

            return (
              <label
                key={`${target.key}-${control.key}`}
                className="flex items-center gap-2 rounded-full border border-slate-700/75 bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(15,23,42,0.6))] px-2.5 py-2"
                data-testid={`component-style-toolbar-control-${control.key}`}
              >
                <input
                  type="color"
                  value={currentValue}
                  onChange={(event) => onUpdateColor(target, control.key, event.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-full border border-slate-500/40 bg-transparent p-0 shadow-[0_0_0_2px_rgba(15,23,42,0.5)]"
                  data-testid={`component-style-toolbar-picker-${control.key}`}
                />
                <div className="pr-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-300">{control.label}</p>
                  <p className="mt-1 font-mono-ui text-xs text-slate-100" data-testid={`component-style-toolbar-value-${control.key}`}>
                    {currentValue}
                  </p>
                </div>
              </label>
            );
          })}

          <button
            type="button"
            onClick={onClear}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border border-slate-600/80 bg-slate-900/70 px-4 text-sm font-semibold text-slate-100 transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-800/90 hover:text-white"
            )}
            data-testid="component-style-toolbar-close-button"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};