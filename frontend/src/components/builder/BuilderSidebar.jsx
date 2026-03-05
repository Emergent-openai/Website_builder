import { useMemo, useState } from "react";
import { FileText, LayoutGrid, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SectionLibraryCard } from "./SectionLibraryCard";


export const BuilderSidebar = ({
  presets,
  onAddSection,
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [newPageName, setNewPageName] = useState("");

  const totalSections = useMemo(
    () => pages.reduce((count, page) => count + (page.sections?.length || 0), 0),
    [pages]
  );

  const filteredPresets = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return presets;
    }

    return presets.filter((preset) => {
      const haystack = `${preset.name} ${preset.category} ${preset.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [presets, searchValue]);

  const handleCreatePage = () => {
    onCreatePage(newPageName);
    setNewPageName("");
  };

  return (
    <aside
      className="panel-shell flex min-h-[calc(100vh-11.5rem)] flex-col overflow-hidden rounded-[34px] p-5 md:p-6 xl:h-[calc(100vh-2.5rem)] xl:min-h-[calc(100vh-2.5rem)]"
      data-testid="builder-sidebar"
    >
      <div className="mb-5 border-b border-white/10 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-zinc-500" data-testid="builder-sidebar-label">
          Builder controls
        </p>
        <h2 className="mt-3 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-white" data-testid="builder-sidebar-title">
          Library + Pages
        </h2>
        <p className="mt-2 text-sm leading-7 text-zinc-400" data-testid="builder-sidebar-description">
          Add polished sections or move across pages without leaving the workspace.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2" data-testid="builder-sidebar-quick-stats">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500" data-testid="builder-sidebar-sections-stat-label">
              Sections
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-100" data-testid="builder-sidebar-sections-stat-value">
              {totalSections} total
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500" data-testid="builder-sidebar-pages-stat-label">
              Pages
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-100" data-testid="builder-sidebar-pages-stat-value">
              {pages.length} total
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="library" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="grid h-12 w-full grid-cols-2 rounded-[1.05rem] border border-white/10 bg-[#060b17]/85 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <TabsTrigger
            value="library"
            className="h-full rounded-[0.75rem] text-zinc-300 hover:translate-y-0 hover:text-white data-[state=active]:bg-[#202737] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_18px_rgba(2,6,23,0.36)]"
            data-testid="builder-sidebar-library-tab"
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06]">
              <LayoutGrid className="h-3.5 w-3.5" />
            </span>
            Sections
          </TabsTrigger>
          <TabsTrigger
            value="pages"
            className="h-full rounded-[0.75rem] text-zinc-300 hover:translate-y-0 hover:text-white data-[state=active]:bg-[#202737] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_18px_rgba(2,6,23,0.36)]"
            data-testid="builder-sidebar-pages-tab"
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06]">
              <FileText className="h-3.5 w-3.5" />
            </span>
            Pages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-4 min-h-0 flex-1 data-[state=inactive]:hidden">
          <div className="flex h-full min-h-0 flex-col gap-4">
            <div className="rounded-[1.35rem] border border-white/10 bg-[#0a1224]/70 p-4">
              <label
                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500"
                htmlFor="section-search"
              >
                Search sections
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" data-testid="section-library-search-icon" />
                <Input
                  id="section-search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search hero, contact, footer..."
                  className="h-11 rounded-xl border-white/10 bg-[#0a1220] pl-10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-primary/40"
                  data-testid="section-library-search-input"
                />
              </div>
              <p className="mt-3 text-xs text-zinc-400" data-testid="section-library-result-count">
                {filteredPresets.length} section option{filteredPresets.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="min-h-0 flex-1 rounded-[1.35rem] border border-white/10 bg-[#060b17]/55 p-3">
              <ScrollArea className="h-full pr-1">
                <div className="grid gap-3 pb-5">
                  {filteredPresets.map((preset) => (
                    <SectionLibraryCard
                      key={preset.key}
                      preset={preset}
                      onAddSection={onAddSection}
                    />
                  ))}

                  {!filteredPresets.length ? (
                    <div
                      className="rounded-[1.3rem] border border-dashed border-white/20 bg-white/[0.02] px-5 py-10 text-center"
                      data-testid="section-library-empty-state"
                    >
                      <p className="font-heading text-lg text-white">No matching sections yet.</p>
                      <p className="mt-2 text-sm text-zinc-400">Try another keyword or clear the search input.</p>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="mt-4 min-h-0 flex-1 data-[state=inactive]:hidden">
          <div className="flex h-full min-h-0 flex-col gap-4">
            <div className="rounded-[1.35rem] border border-white/10 bg-[#0a1224]/70 p-4">
              <label
                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500"
                htmlFor="new-page-name"
              >
                Create page
              </label>
              <Input
                id="new-page-name"
                value={newPageName}
                onChange={(event) => setNewPageName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleCreatePage();
                  }
                }}
                placeholder="Services"
                className="h-11 rounded-xl border-white/10 bg-[#0a1220] text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-primary/40"
                data-testid="new-page-name-input"
              />
              <Button
                type="button"
                onClick={handleCreatePage}
                className="mt-3 h-11 w-full rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15"
                data-testid="create-page-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add new page
              </Button>
            </div>

            <div className="min-h-0 flex-1 rounded-[1.35rem] border border-white/10 bg-[#060b17]/55 p-3">
              <ScrollArea className="h-full pr-1">
                <div className="space-y-3 pb-4">
                  {pages.map((page, index) => {
                    const isActive = page.id === activePageId;

                    return (
                      <div
                        key={page.id}
                        className={`group flex items-center gap-2 overflow-hidden rounded-[1.15rem] border px-3.5 py-3 transition-[border-color,background-color,transform,box-shadow] duration-200 ${
                          isActive
                            ? "border-primary/60 bg-[linear-gradient(135deg,rgba(99,102,241,0.2),rgba(6,182,212,0.08))] shadow-[0_12px_24px_rgba(2,6,23,0.32)]"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                        data-testid={`page-item-${page.id}`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectPage(page.id)}
                          className="flex min-w-0 flex-1 items-start justify-between gap-2 overflow-hidden text-left"
                          data-testid={`page-select-button-${page.id}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">Page {index + 1}</p>
                            <p className="mt-1 max-w-full truncate font-heading text-base font-semibold tracking-[-0.03em] text-white" data-testid={`page-name-${page.id}`}>
                              {page.name}
                            </p>
                            <p className="mt-0.5 max-w-full truncate text-xs text-zinc-400" data-testid={`page-slug-${page.id}`}>
                              /{page.slug}
                            </p>
                          </div>
                          <span
                            className="ml-1 inline-flex shrink-0 rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-zinc-200"
                            data-testid={`page-section-count-${page.id}`}
                          >
                            {page.sections.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeletePage(page.id);
                          }}
                          disabled={pages.length === 1}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-zinc-300 transition-[opacity,transform,border-color,color,background-color] duration-200 hover:-translate-y-0.5 hover:border-destructive/60 hover:bg-destructive/15 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-35 ${
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                          }`}
                          data-testid={`page-delete-button-${page.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
};