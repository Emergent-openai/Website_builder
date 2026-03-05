import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";

import { ComponentStyleToolbar } from "./ComponentStyleToolbar";
import { SortableCanvasSection } from "./SortableCanvasSection";


const viewportClassMap = {
  desktop: "max-w-6xl",
  tablet: "max-w-3xl",
  mobile: "max-w-[420px]",
};


export const CanvasArea = ({
  page,
  viewport,
  selectedSectionId,
  selectedStyleTarget,
  selectedStyleSection,
  onSelectSection,
  onSelectStyleTarget,
  onDuplicateSection,
  onDeleteSection,
  onInlineSectionContentChange,
  onInlineSectionListItemChange,
  onUpdateStyleTargetColor,
  onClearStyleTarget,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-dropzone",
    data: {
      kind: "canvas",
    },
  });

  if (!page) {
    return (
      <section
        className="canvas-grid flex min-h-[calc(100vh-11.5rem)] items-center justify-center rounded-[36px] border border-white/10 p-6"
        data-testid="builder-canvas-empty-state"
      >
        <div className="surface-card rounded-[2.2rem] border border-dashed border-zinc-300 px-8 py-12 text-center shadow-xl">
          <p className="font-heading text-2xl font-semibold text-zinc-950">No page selected yet.</p>
          <p className="mt-2 text-sm text-zinc-500">Create a page from the sidebar to begin assembling the site.</p>
        </div>
      </section>
    );
  }

  const sectionIds = page.sections.map((section) => section.id);

  return (
    <section className="canvas-grid min-h-[calc(100vh-11.5rem)] overflow-hidden rounded-[36px] border border-white/10 p-5 md:p-7" data-testid="builder-canvas-area">
      <div className="mx-auto flex h-full min-h-[70vh] w-full items-start justify-center overflow-auto">
        <div className={cn("w-full transition-all duration-300", viewportClassMap[viewport])}>
          <ComponentStyleToolbar
            target={selectedStyleTarget}
            section={selectedStyleSection}
            onUpdateColor={onUpdateStyleTargetColor}
            onClear={onClearStyleTarget}
          />

          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500" data-testid="active-page-label">
                Active page
              </p>
              <h2 className="mt-2 font-heading text-[2rem] font-semibold tracking-[-0.04em] text-zinc-950" data-testid="active-page-name">
                {page.name}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="surface-pill rounded-full px-4 py-2 text-sm font-semibold text-zinc-700" data-testid="active-page-slug">
                /{page.slug}
              </span>
              <span className="surface-pill rounded-full px-4 py-2 text-sm font-semibold text-zinc-700" data-testid="active-page-section-count">
                {page.sections.length} sections
              </span>
            </div>
          </div>

          <div
            ref={setNodeRef}
            className={cn(
              "surface-card min-h-[65vh] rounded-[36px] border border-zinc-200 transition-all duration-200",
              isOver && "ring-2 ring-primary/60 ring-offset-4 ring-offset-zinc-100"
            )}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onSelectSection(null);
                onClearStyleTarget();
              }
            }}
            data-testid="canvas-page-dropzone"
          >
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              {page.sections.length ? (
                <div className="flex flex-col gap-5 p-5 md:p-6">
                  {page.sections.map((section, index) => (
                    <SortableCanvasSection
                      key={section.id}
                      section={section}
                      index={index}
                      isSelected={selectedSectionId === section.id}
                      selectedStyleTarget={selectedStyleTarget}
                      showStyleHandles={selectedSectionId === section.id}
                      onSelect={onSelectSection}
                      onSelectStyleTarget={onSelectStyleTarget}
                      onDuplicate={onDuplicateSection}
                      onDelete={onDeleteSection}
                      onInlineSectionContentChange={onInlineSectionContentChange}
                      onInlineSectionListItemChange={onInlineSectionListItemChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4 p-10 text-center" data-testid="empty-page-state">
                  <div className="h-20 w-20 rounded-[2rem] border border-dashed border-zinc-300 bg-zinc-50" />
                  <div>
                    <h3 className="font-heading text-2xl font-semibold text-zinc-950">Drop the first section here.</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                      Drag a section from the library or click “Add section” to start building this page instantly.
                    </p>
                  </div>
                </div>
              )}
            </SortableContext>
          </div>
        </div>
      </div>
    </section>
  );
};