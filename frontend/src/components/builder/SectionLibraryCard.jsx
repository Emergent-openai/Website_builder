import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


const Thumbnail = ({ preset }) => {
  const accent = preset.styles.accent;

  if (preset.type === "header") {
    return (
      <div className="flex h-full flex-col justify-between rounded-[1.3rem] border border-white/10 bg-black/25 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-3 w-16 rounded-full bg-white/85" />
          <div className="flex gap-2">
            <span className="h-2 w-10 rounded-full bg-white/25" />
            <span className="h-2 w-10 rounded-full bg-white/25" />
            <span className="h-2 w-10 rounded-full bg-white/25" />
          </div>
        </div>
        <div className="ml-auto h-7 w-24 rounded-full" style={{ backgroundColor: accent }} />
      </div>
    );
  }

  if (preset.type === "hero") {
    return (
      <div className="grid h-full grid-cols-[1.2fr_0.8fr] gap-3 rounded-[1.3rem] border border-white/10 bg-black/30 p-4">
        <div className="flex flex-col gap-2">
          <span className="h-2 w-16 rounded-full bg-white/25" />
          <span className="h-4 w-4/5 rounded-full bg-white/90" />
          <span className="h-4 w-3/5 rounded-full bg-white/70" />
          <span className="mt-2 h-2 w-full rounded-full bg-white/20" />
          <span className="h-2 w-5/6 rounded-full bg-white/20" />
          <div className="mt-auto flex gap-2">
            <span className="h-8 w-24 rounded-full" style={{ backgroundColor: accent }} />
            <span className="h-8 w-24 rounded-full border border-white/25 bg-white/5" />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/5">
          <div
            className="absolute inset-4 rounded-full opacity-80 blur-xl"
            style={{ backgroundColor: accent }}
          />
          <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full border border-white/15 bg-black/40" />
        </div>
      </div>
    );
  }

  if (preset.type === "features" || preset.type === "blog") {
    return (
      <div className="grid h-full grid-cols-3 gap-2 rounded-[1.3rem] border border-white/10 bg-black/30 p-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span className="h-2 w-10 rounded-full" style={{ backgroundColor: accent }} />
            <span className="h-3 w-full rounded-full bg-white/60" />
            <span className="h-2 w-4/5 rounded-full bg-white/20" />
            <span className="h-2 w-3/5 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
    );
  }

  if (preset.type === "testimonial") {
    return (
      <div className="flex h-full flex-col justify-between rounded-[1.3rem] border border-white/10 bg-black/30 p-4">
        <span className="h-2 w-20 rounded-full" style={{ backgroundColor: accent }} />
        <div className="space-y-2">
          <span className="block h-3 w-full rounded-full bg-white/85" />
          <span className="block h-3 w-11/12 rounded-full bg-white/70" />
          <span className="block h-3 w-4/5 rounded-full bg-white/70" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="block h-3 w-24 rounded-full bg-white/85" />
            <span className="mt-2 block h-2 w-20 rounded-full bg-white/25" />
          </div>
          <div className="flex gap-2">
            <span className="h-8 w-8 rounded-full border border-white/10 bg-white/10" />
            <span className="h-8 w-8 rounded-full border border-white/10 bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-[1.3rem] border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-2">
        <span className="h-10 w-10 rounded-2xl" style={{ backgroundColor: accent }} />
        <div className="flex-1 space-y-2">
          <span className="block h-3 w-2/3 rounded-full bg-white/80" />
          <span className="block h-2 w-1/2 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <span className="h-10 rounded-2xl border border-white/10 bg-white/5" />
        <span className="h-10 rounded-2xl border border-white/10 bg-white/5" />
      </div>
    </div>
  );
};


export const SectionLibraryCard = ({ preset, onAddSection }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id: `preset-${preset.key}`,
    data: {
      kind: "library",
      presetKey: preset.key,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-[1.35rem] border border-white/10 bg-[#0a1224]/78 p-3.5 transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#0d162a]",
        isDragging && "scale-[1.01] border-primary/70 shadow-[0_18px_42px_rgba(2,6,23,0.42)]"
      )}
      data-testid={`library-section-card-${preset.key}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span
          className="inline-flex max-w-[72%] truncate rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-300"
          data-testid={`library-section-category-${preset.key}`}
        >
          {preset.category}
        </span>
        <button
          type="button"
          className="inline-flex h-8 w-8 cursor-grab touch-none select-none items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag section card"
          data-testid={`library-section-drag-handle-${preset.key}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        className="library-preview aspect-[16/9] rounded-[1.05rem] border border-white/10 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{ background: `linear-gradient(135deg, ${preset.styles.background} 0%, rgba(255,255,255,0.08) 100%)` }}
        data-testid={`library-section-preview-${preset.key}`}
      >
        <Thumbnail preset={preset} />
      </div>

      <div className="mt-4 space-y-1.5">
        <h3 className="font-heading text-lg font-semibold tracking-[-0.03em] text-white" data-testid={`library-section-name-${preset.key}`}>
          {preset.name}
        </h3>
        <p className="max-h-12 overflow-hidden text-xs leading-6 text-zinc-400" data-testid={`library-section-description-${preset.key}`}>
          {preset.description}
        </p>
      </div>

      <Button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAddSection(preset.key);
        }}
        className="mt-4 h-10 w-full rounded-xl border border-white/15 bg-white/[0.08] text-zinc-100 hover:bg-white/[0.14]"
        data-testid={`library-section-add-button-${preset.key}`}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add section
      </Button>
    </article>
  );
};