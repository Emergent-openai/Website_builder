import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Loader2,
  LogOut,
  Monitor,
  Save,
  Smartphone,
  Tablet,
  UserRound,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { BuilderSidebar } from "@/components/builder/BuilderSidebar";
import { CanvasArea } from "@/components/builder/CanvasArea";
import { PropertiesPanel } from "@/components/builder/PropertiesPanel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import {
  cloneSection,
  createBlankPage,
  createSectionFromPreset,
  formatTimestamp,
  getSectionPreset,
  sectionCatalog,
  slugify,
} from "@/data/builderCatalog";
import { builderApi } from "@/lib/api";
import { cn } from "@/lib/utils";


const viewportOptions = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "mobile", label: "Mobile", icon: Smartphone },
];


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

const isValidHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test(value || "");

const hexToRgb = (hexColor) => {
  if (!isValidHexColor(hexColor)) {
    return null;
  }

  return {
    red: Number.parseInt(hexColor.slice(1, 3), 16),
    green: Number.parseInt(hexColor.slice(3, 5), 16),
    blue: Number.parseInt(hexColor.slice(5, 7), 16),
  };
};

const normalizeChannel = (channel) => {
  const ratio = channel / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
};

const getRelativeLuminance = (hexColor) => {
  const rgb = hexToRgb(hexColor);

  if (!rgb) {
    return null;
  }

  return (0.2126 * normalizeChannel(rgb.red))
    + (0.7152 * normalizeChannel(rgb.green))
    + (0.0722 * normalizeChannel(rgb.blue));
};

const getContrastRatio = (firstColor, secondColor) => {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);

  if (firstLuminance === null || secondLuminance === null) {
    return 0;
  }

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

const ensureReadableTextColor = (backgroundColor, preferredColor) => {
  if (!isValidHexColor(backgroundColor)) {
    return preferredColor;
  }

  const preferred = isValidHexColor(preferredColor) ? preferredColor : "#F8FAFC";

  if (getContrastRatio(backgroundColor, preferred) >= 3.2) {
    return preferred;
  }

  const lightOption = "#F8FAFC";
  const darkOption = "#09090B";

  return getContrastRatio(backgroundColor, lightOption) >= getContrastRatio(backgroundColor, darkOption)
    ? lightOption
    : darkOption;
};


export default function BuilderPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedStyleTarget, setSelectedStyleTarget] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [viewport, setViewport] = useState("desktop");
  const [activeDragItem, setActiveDragItem] = useState(null);
  const lastOverIdRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const collisionDetectionStrategy = useCallback((args) => {
    const pointerHits = pointerWithin(args);

    if (pointerHits.length > 0) {
      return pointerHits;
    }

    return closestCorners(args);
  }, []);

  const activePage = useMemo(() => {
    if (!project?.pages?.length) {
      return null;
    }

    return project.pages.find((page) => page.id === selectedPageId) || project.pages[0];
  }, [project, selectedPageId]);

  const selectedSection = useMemo(() => {
    if (!activePage?.sections?.length) {
      return null;
    }

    return activePage.sections.find((section) => section.id === selectedSectionId) || null;
  }, [activePage, selectedSectionId]);

  const selectedStyleSection = useMemo(() => {
    if (!activePage?.sections?.length || !selectedStyleTarget?.sectionId) {
      return null;
    }

    return activePage.sections.find((section) => section.id === selectedStyleTarget.sectionId) || null;
  }, [activePage, selectedStyleTarget]);

  const totalSections = useMemo(
    () => project?.pages?.reduce((total, page) => total + page.sections.length, 0) || 0,
    [project]
  );

  const loadProject = useCallback(async () => {
    setLoading(true);

    try {
      const loadedProject = await builderApi.getProject(projectId);
      setProject(loadedProject);
      setSelectedPageId(loadedProject.pages?.[0]?.id || null);
      setSelectedSectionId(null);
      setSelectedStyleTarget(null);
      setDirty(false);
    } catch (error) {
      console.error(error);
      toast.error("Could not load the builder project.");
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (project?.pages?.length && !project.pages.some((page) => page.id === selectedPageId)) {
      setSelectedPageId(project.pages[0].id);
      setSelectedSectionId(null);
      setSelectedStyleTarget(null);
    }
  }, [project, selectedPageId]);

  useEffect(() => {
    if (selectedSectionId && activePage && !activePage.sections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(null);
    }
  }, [activePage, selectedSectionId]);

  useEffect(() => {
    if (
      selectedStyleTarget?.sectionId
      && activePage
      && !activePage.sections.some((section) => section.id === selectedStyleTarget.sectionId)
    ) {
      setSelectedStyleTarget(null);
    }
  }, [activePage, selectedStyleTarget]);

  const updateProjectPages = useCallback((updater) => {
    setProject((currentProject) => {
      if (!currentProject) {
        return currentProject;
      }

      const nextPages = updater(currentProject.pages);
      return {
        ...currentProject,
        pages: nextPages,
      };
    });
    setDirty(true);
  }, []);

  const updateActivePage = useCallback(
    (pageUpdater) => {
      if (!selectedPageId) {
        return;
      }

      updateProjectPages((pages) =>
        pages.map((page) => (page.id === selectedPageId ? pageUpdater(page) : page))
      );
    },
    [selectedPageId, updateProjectPages]
  );

  const updateSelectedSection = useCallback(
    (sectionUpdater) => {
      if (!selectedSectionId) {
        return;
      }

      updateActivePage((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.id === selectedSectionId ? sectionUpdater(section) : section
        ),
      }));
    },
    [selectedSectionId, updateActivePage]
  );

  const handleAddSection = useCallback(
    (presetKey, insertIndex) => {
      if (!activePage) {
        return;
      }

      const newSection = createSectionFromPreset(presetKey);

      updateActivePage((page) => {
        const nextSections = [...page.sections];

        if (typeof insertIndex === "number") {
          nextSections.splice(insertIndex, 0, newSection);
        } else {
          nextSections.push(newSection);
        }

        return {
          ...page,
          sections: nextSections,
        };
      });

      setSelectedSectionId(newSection.id);
      setSelectedStyleTarget(createSectionStyleTarget(newSection));
      toast.success(`${newSection.name} added to ${activePage.name}.`);
    },
    [activePage, updateActivePage]
  );

  const handleDuplicateSection = useCallback(
    (sectionId) => {
      if (!activePage) {
        return;
      }

      const sourceSection = activePage.sections.find((section) => section.id === sectionId);

      if (!sourceSection) {
        return;
      }

      const duplicatedSection = cloneSection(sourceSection);

      updateActivePage((page) => {
        const sourceIndex = page.sections.findIndex((section) => section.id === sectionId);
        const nextSections = [...page.sections];
        nextSections.splice(sourceIndex + 1, 0, duplicatedSection);

        return {
          ...page,
          sections: nextSections,
        };
      });

      setSelectedSectionId(duplicatedSection.id);
      setSelectedStyleTarget(createSectionStyleTarget(duplicatedSection));
      toast.success("Section duplicated.");
    },
    [activePage, updateActivePage]
  );

  const handleDeleteSection = useCallback(
    (sectionId) => {
      updateActivePage((page) => ({
        ...page,
        sections: page.sections.filter((section) => section.id !== sectionId),
      }));

      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }

      if (selectedStyleTarget?.sectionId === sectionId) {
        setSelectedStyleTarget(null);
      }

      toast.success("Section removed from the page.");
    },
    [selectedSectionId, selectedStyleTarget, updateActivePage]
  );

  const handleCreatePage = useCallback(
    (name) => {
      const nextName = name?.trim() || `Page ${(project?.pages?.length || 0) + 1}`;
      const nextPage = createBlankPage(nextName);

      updateProjectPages((pages) => [...pages, nextPage]);
      setSelectedPageId(nextPage.id);
      setSelectedSectionId(null);
      setSelectedStyleTarget(null);
      toast.success(`${nextPage.name} created.`);
    },
    [project?.pages?.length, updateProjectPages]
  );

  const handleDeletePage = useCallback(
    (pageId) => {
      if ((project?.pages?.length || 0) <= 1) {
        toast.error("Keep at least one page in the project.");
        return;
      }

      const remainingPages = project.pages.filter((page) => page.id !== pageId);
      updateProjectPages(() => remainingPages);

      if (selectedPageId === pageId) {
        setSelectedPageId(remainingPages[0]?.id || null);
        setSelectedSectionId(null);
        setSelectedStyleTarget(null);
      }

      toast.success("Page deleted.");
    },
    [project, selectedPageId, selectedStyleTarget, updateProjectPages]
  );

  const handleUpdatePageField = useCallback(
    (field, value) => {
      updateActivePage((page) => {
        if (field === "name") {
          const shouldUpdateSlug = !page.slug || page.slug === slugify(page.name);
          return {
            ...page,
            name: value,
            slug: shouldUpdateSlug ? slugify(value) : page.slug,
          };
        }

        if (field === "slug") {
          return {
            ...page,
            slug: slugify(value),
          };
        }

        return {
          ...page,
          [field]: value,
        };
      });
    },
    [updateActivePage]
  );

  const handleUpdateSectionContent = useCallback(
    (field, value) => {
      updateSelectedSection((section) => ({
        ...section,
        content: {
          ...section.content,
          [field]: value,
        },
      }));
    },
    [updateSelectedSection]
  );

  const handleUpdateSectionList = useCallback(
    (field, value) => {
      updateSelectedSection((section) => ({
        ...section,
        content: {
          ...section.content,
          [field]: value,
        },
      }));
    },
    [updateSelectedSection]
  );

  const handleUpdateSectionStyle = useCallback(
    (field, value) => {
      updateSelectedSection((section) => {
        const nextStyles = {
          ...section.styles,
          [field]: value,
        };

        if (field === "background") {
          nextStyles.text = ensureReadableTextColor(value, section.styles?.text || "#FAFAFA");
        }

        if (field === "text" && isValidHexColor(section.styles?.background)) {
          nextStyles.text = ensureReadableTextColor(section.styles.background, value);
        }

        return {
          ...section,
          styles: nextStyles,
        };
      });
    },
    [updateSelectedSection]
  );

  const handleInlineSectionContentChange = useCallback(
    (sectionId, field, value) => {
      updateActivePage((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                content: {
                  ...section.content,
                  [field]: value,
                },
              }
            : section
        ),
      }));
    },
    [updateActivePage]
  );

  const handleInlineSectionListItemChange = useCallback(
    (sectionId, field, index, value, fallbackList = []) => {
      updateActivePage((page) => ({
        ...page,
        sections: page.sections.map((section) => {
          if (section.id !== sectionId) {
            return section;
          }

          const sourceList = Array.isArray(section.content?.[field])
            ? [...section.content[field]]
            : [...fallbackList];
          sourceList[index] = value;

          return {
            ...section,
            content: {
              ...section.content,
              [field]: sourceList,
            },
          };
        }),
      }));
    },
    [updateActivePage]
  );

  const handleSelectSection = useCallback(
    (sectionId) => {
      setSelectedSectionId(sectionId);

      if (!sectionId) {
        setSelectedStyleTarget(null);
        return;
      }

      const section = activePage?.sections.find((item) => item.id === sectionId);
      if (section) {
        setSelectedStyleTarget(createSectionStyleTarget(section));
      }
    },
    [activePage]
  );

  const handleSelectStyleTarget = useCallback((target) => {
    setSelectedSectionId(target.sectionId);
    setSelectedStyleTarget(target);
  }, []);

  const handleUpdateStyleTargetColor = useCallback(
    (target, colorKey, value) => {
      updateActivePage((page) => ({
        ...page,
        sections: page.sections.map((section) => {
          if (section.id !== target.sectionId) {
            return section;
          }

          if (target.kind === "section") {
            const nextStyles = {
              ...section.styles,
              [colorKey]: value,
            };

            if (colorKey === "background") {
              nextStyles.text = ensureReadableTextColor(value, section.styles?.text || "#FAFAFA");
            }

            if (colorKey === "text" && isValidHexColor(section.styles?.background)) {
              nextStyles.text = ensureReadableTextColor(section.styles.background, value);
            }

            return {
              ...section,
              styles: nextStyles,
            };
          }

          const currentElementStyles = section.styles?.elementStyles?.[target.key] || {};
          const nextElementStyles = {
            ...currentElementStyles,
            [colorKey]: value,
          };

          if (colorKey === "backgroundColor") {
            const fallbackTextColor = currentElementStyles.color || section.styles?.text || "#111827";
            nextElementStyles.color = ensureReadableTextColor(value, fallbackTextColor);
          }

          if (colorKey === "color") {
            const referenceBackground = currentElementStyles.backgroundColor || section.styles?.background;

            if (isValidHexColor(referenceBackground)) {
              nextElementStyles.color = ensureReadableTextColor(referenceBackground, value);
            }
          }

          return {
            ...section,
            styles: {
              ...section.styles,
              elementStyles: {
                ...(section.styles?.elementStyles || {}),
                [target.key]: {
                  ...nextElementStyles,
                },
              },
            },
          };
        }),
      }));
    },
    [updateActivePage]
  );

  const handleClearStyleTarget = useCallback(() => {
    setSelectedStyleTarget(null);
  }, []);

  const handleSaveProject = useCallback(async () => {
    if (!project) {
      return;
    }

    setSaving(true);

    try {
      const savedProject = await builderApi.updateProject(project.id, {
        name: project.name,
        description: project.description,
        status: project.status || "draft",
        pages: project.pages,
      });

      setProject(savedProject);
      setDirty(false);
      toast.success("Project saved to the dashboard.");
    } catch (error) {
      console.error(error);
      toast.error("Could not save the project.");
    } finally {
      setSaving(false);
    }
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSaveProject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveProject]);

  const handleDragStart = ({ active }) => {
    lastOverIdRef.current = null;

    if (active.data.current) {
      setActiveDragItem(active.data.current);
    }
  };

  const handleDragOver = ({ over }) => {
    if (over?.id) {
      lastOverIdRef.current = over.id;
    }
  };

  const handleDragEnd = ({ active, over }) => {
    const resolvedOver = over || (lastOverIdRef.current ? { id: lastOverIdRef.current } : null);

    setActiveDragItem(null);
    lastOverIdRef.current = null;

    if (!activePage || !resolvedOver) {
      return;
    }

    const activeData = active.data.current;

    if (!activeData) {
      return;
    }

    if (activeData.kind === "section") {
      if (resolvedOver.id === active.id) {
        return;
      }

      const oldIndex = activePage.sections.findIndex((section) => section.id === active.id);
      const newIndex = resolvedOver.id === "canvas-dropzone"
        ? activePage.sections.length - 1
        : activePage.sections.findIndex((section) => section.id === resolvedOver.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      updateActivePage((page) => ({
        ...page,
        sections: arrayMove(page.sections, oldIndex, newIndex),
      }));
      return;
    }

    if (activeData.kind === "library") {
      const insertIndex = resolvedOver.id === "canvas-dropzone"
        ? activePage.sections.length
        : activePage.sections.findIndex((section) => section.id === resolvedOver.id);

      handleAddSection(activeData.presetKey, insertIndex === -1 ? activePage.sections.length : insertIndex);
    }
  };

  const overlayTitle = activeDragItem?.kind === "library"
    ? getSectionPreset(activeDragItem.presetKey)?.name
    : activePage?.sections.find((section) => section.id === activeDragItem?.sectionId)?.name;

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="builder-shell flex min-h-screen items-center justify-center bg-[#09090B] text-white" data-testid="builder-loading-state">
        <div className="panel-shell rounded-[2.2rem] px-7 py-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading the builder workspace…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="builder-shell flex min-h-screen items-center justify-center bg-[#09090B] px-4 text-white" data-testid="builder-missing-state">
        <div className="panel-shell max-w-lg rounded-[2.3rem] p-9 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em]">Project not available.</h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            The project could not be loaded. Return to the dashboard and create or open another project.
          </p>
          <Button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="button-premium-primary mt-7 rounded-full px-5 text-white"
            data-testid="builder-back-to-dashboard-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-shell builder-shell-workspace bg-[#09090B] text-white" data-testid="builder-page">
      <div className="ambient-orb ambient-orb--primary left-10 top-10 h-72 w-72" />
      <div className="ambient-orb ambient-orb--accent right-0 top-24 h-80 w-80" />
      <div className="ambient-orb ambient-orb--lime bottom-10 left-1/3 h-60 w-60" />

      <div className="relative mx-auto flex max-w-[1850px] flex-col gap-5 px-4 py-5 md:px-6 md:py-6">
        <header className="panel-shell rounded-[36px] px-5 py-5 md:px-6 md:py-6" data-testid="builder-topbar">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="button-premium-secondary h-11 rounded-full px-4 text-white"
                data-testid="builder-back-button"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>

              <div className="flex items-start gap-4 md:gap-5" data-testid="builder-brand-and-project-shell">
                <div
                  className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-black/30 px-3 py-2 shadow-[0_14px_30px_rgba(2,6,23,0.32)]"
                  data-testid="builder-brand-logo-shell"
                >
                  <img
                    src="/website-builder-logo.png"
                    alt="Website builder logo"
                    className="h-11 w-auto md:h-12"
                    data-testid="builder-brand-logo-image"
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="font-heading text-3xl font-semibold tracking-[-0.045em] text-white" data-testid="builder-project-name">
                    {project.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-300">
                    <span className="premium-pill rounded-full px-3 py-1.5" data-testid="builder-topbar-page-count">
                      {project.pages.length} pages
                    </span>
                    <span className="premium-pill rounded-full px-3 py-1.5" data-testid="builder-topbar-section-count">
                      {totalSections} sections
                    </span>
                    <span className="premium-pill rounded-full px-3 py-1.5" data-testid="builder-topbar-updated-at">
                      Last save {formatTimestamp(project.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="control-surface flex items-center gap-1 rounded-full p-1.5" data-testid="viewport-toggle-group">
                {viewportOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setViewport(option.value)}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-[transform,background-color,box-shadow,color] duration-200",
                        viewport === option.value
                          ? "bg-[linear-gradient(135deg,#6f73ff_0%,#8663ff_42%,#06b6d4_100%)] text-white shadow-[0_16px_30px_rgba(99,102,241,0.34)]"
                          : "text-zinc-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                      )}
                      data-testid={`viewport-toggle-${option.value}`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="control-surface flex min-h-11 items-center gap-3 rounded-full px-4" data-testid="preview-toggle-group">
                <Eye className="h-4 w-4 text-zinc-300" />
                <span className="text-sm font-semibold text-zinc-200" data-testid="preview-toggle-label">Focus mode</span>
                <Switch
                  checked={previewMode}
                  onCheckedChange={setPreviewMode}
                  data-testid="preview-mode-switch"
                />
              </div>

              <div className="premium-subpanel hidden min-h-11 items-center gap-3 rounded-full px-4 py-1.5 2xl:flex" data-testid="builder-user-pill">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6f73ff_0%,#22d3ee_100%)] text-white shadow-[0_12px_28px_rgba(99,102,241,0.28)]">
                  <UserRound className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white" data-testid="builder-user-name">{user?.name}</p>
                  <p className="text-[11px] text-zinc-400" data-testid="builder-user-email">{user?.email}</p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSaveProject}
                disabled={saving}
                className={cn(
                  "h-11 rounded-full px-5",
                  dirty || saving ? "button-premium-primary text-primary-foreground" : "button-premium-secondary text-zinc-100"
                )}
                data-testid="save-project-button"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {dirty ? "Save changes" : "Saved"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleSignOut}
                className="button-premium-secondary h-11 rounded-full px-4 text-white"
                data-testid="builder-signout-button"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragCancel={() => {
            lastOverIdRef.current = null;
            setActiveDragItem(null);
          }}
          onDragEnd={handleDragEnd}
        >
          <div
            className={cn(
              "grid gap-5",
              previewMode ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)_360px] xl:items-start"
            )}
            data-testid="builder-workspace-grid"
          >
            {!previewMode ? (
              <div className="xl:sticky xl:top-5 xl:self-start" data-testid="builder-left-sticky-sidebar">
                <BuilderSidebar
                  presets={sectionCatalog}
                  onAddSection={handleAddSection}
                  pages={project.pages}
                  activePageId={activePage?.id}
                  onSelectPage={(pageId) => {
                    setSelectedPageId(pageId);
                    setSelectedSectionId(null);
                    setSelectedStyleTarget(null);
                  }}
                  onCreatePage={handleCreatePage}
                  onDeletePage={handleDeletePage}
                />
              </div>
            ) : null}

            <CanvasArea
              page={activePage}
              viewport={viewport}
              selectedSectionId={selectedSectionId}
              selectedStyleTarget={selectedStyleTarget}
              selectedStyleSection={selectedStyleSection}
              onSelectSection={handleSelectSection}
              onSelectStyleTarget={handleSelectStyleTarget}
              onDuplicateSection={handleDuplicateSection}
              onDeleteSection={handleDeleteSection}
              onInlineSectionContentChange={handleInlineSectionContentChange}
              onInlineSectionListItemChange={handleInlineSectionListItemChange}
              onUpdateStyleTargetColor={handleUpdateStyleTargetColor}
              onClearStyleTarget={handleClearStyleTarget}
            />

            {!previewMode ? (
              <div className="xl:sticky xl:top-5 xl:self-start" data-testid="builder-right-sticky-sidebar">
                <PropertiesPanel
                  activePage={activePage}
                  selectedSection={selectedSection}
                  onClearSelection={() => {
                    setSelectedSectionId(null);
                    setSelectedStyleTarget(null);
                  }}
                  onUpdatePageField={handleUpdatePageField}
                  onUpdateSectionContent={handleUpdateSectionContent}
                  onUpdateSectionList={handleUpdateSectionList}
                  onUpdateSectionStyle={handleUpdateSectionStyle}
                />
              </div>
            ) : null}
          </div>

          <DragOverlay>
            {overlayTitle ? (
              <div className="premium-subpanel rounded-[1.9rem] border border-primary/35 bg-zinc-950/95 px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)]" data-testid="drag-overlay-card">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500" data-testid="drag-overlay-kind">
                  {activeDragItem?.kind === "library" ? "Section preset" : "Canvas section"}
                </p>
                <p className="mt-2 font-heading text-xl font-semibold text-white" data-testid="drag-overlay-title">
                  {overlayTitle}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}