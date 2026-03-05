import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { SectionRenderer } from "./SectionRenderer";


const createSectionStyleTarget = (section) => ({
  sectionId: section.id,
  key: "section-root",
  kind: "section",
  label: `${section.name} section`,
  controls: [
    { key: "background", label: "Background", defaultValue: section.styles?.background || "#0B1020" },
    { key: "text", label: "Text", defaultValue: section.styles?.text || "#FAFAFA" },
    { key: "accent", label: "Accent", defaultValue: section.styles?.accent || "#6366F1" },
  ],
});


export const SortableCanvasSection = ({
  section,
  index,
  isSelected,
  selectedStyleTarget,
  showStyleHandles,
  onSelect,
  onSelectStyleTarget,
  onDuplicate,
  onDelete,
  onInlineSectionContentChange,
  onInlineSectionListItemChange,
}) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: {
      kind: "section",
      sectionId: section.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const controlsVisibilityClassName = isSelected
    ? "translate-y-0 opacity-100 pointer-events-auto"
    : "-translate-y-2 opacity-0 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "z-40 opacity-80")}
      data-testid={`canvas-section-shell-${section.id}`}
    >
      <div
        className={cn(
          "section-frame group relative overflow-hidden rounded-[2rem] border bg-white",
          isSelected ? "border-primary" : "border-zinc-200/80"
        )}
        data-selected={isSelected ? "true" : "false"}
        onClick={() => {
          onSelect(section.id);
          onSelectStyleTarget(createSectionStyleTarget(section));
        }}
        data-testid={`canvas-section-${section.id}`}
      >
        <div
          className={cn(
            "absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2 rounded-full border border-white/35 bg-[#0b1223d4] px-2.5 py-2 shadow-[0_16px_34px_rgba(2,6,23,0.36)] backdrop-blur-xl transition-[opacity,transform] duration-200",
            controlsVisibilityClassName
          )}
          data-testid={`canvas-section-controls-${section.id}`}
        >
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="inline-flex h-9 cursor-grab touch-none select-none items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-semibold text-zinc-100 transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/20 hover:text-white active:cursor-grabbing"
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            data-testid={`canvas-section-drag-handle-${section.id}`}
          >
            <GripVertical className="h-3.5 w-3.5" />
            Move
          </button>

          <span
            className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border border-white/70 bg-white px-3 text-xs font-semibold text-zinc-900"
            data-testid={`canvas-section-index-${section.id}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate(section.id);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-zinc-200 transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/20 hover:text-white"
            data-testid={`canvas-section-duplicate-button-${section.id}`}
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(section.id);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-zinc-200 transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-destructive/60 hover:bg-destructive/15 hover:text-red-100"
            data-testid={`canvas-section-delete-button-${section.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <SectionRenderer
          section={section}
          onSelectSection={onSelect}
          onUpdateSectionContent={onInlineSectionContentChange}
          onUpdateSectionListItem={onInlineSectionListItemChange}
          selectedStyleTarget={selectedStyleTarget}
          onSelectStyleTarget={onSelectStyleTarget}
          showStyleHandles={showStyleHandles}
        />
      </div>
    </div>
  );
};