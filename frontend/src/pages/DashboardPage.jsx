import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  FolderOpenDot,
  Loader2,
  LogOut,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { createStarterProjectPayload, formatTimestamp } from "@/data/builderCatalog";
import { builderApi } from "@/lib/api";
import { toast } from "@/components/ui/sonner";


const DashboardStatCard = ({ label, value, dataTestId }) => (
  <div
    className="rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] px-4 py-4"
    data-testid={dataTestId}
  >
    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500" data-testid={`${dataTestId}-label`}>{label}</p>
    <p className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-white" data-testid={`${dataTestId}-value`}>{value}</p>
  </div>
);


const ProjectListItem = ({ project, onOpen, onDelete }) => (
  <Card
    className="overflow-hidden rounded-[1.55rem] border-white/10 bg-white/[0.02] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_24px_44px_rgba(2,6,23,0.28)]"
    data-testid={`project-list-item-${project.id}`}
  >
    <CardContent className="p-5 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-200"
              data-testid={`project-list-status-${project.id}`}
            >
              {(project.status || "draft").toUpperCase()}
            </span>
            <span className="text-xs text-zinc-400" data-testid={`project-list-updated-${project.id}`}>
              Updated {formatTimestamp(project.updated_at)}
            </span>
          </div>

          <h3 className="mt-3 truncate font-heading text-2xl font-semibold tracking-[-0.03em] text-white" data-testid={`project-list-name-${project.id}`}>
            {project.name}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400" data-testid={`project-list-description-${project.id}`}>
            {project.description || "Multi-page project ready for section editing and launch prep."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:min-w-[260px]" data-testid={`project-list-metrics-${project.id}`}>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center" data-testid={`project-list-pages-${project.id}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500" data-testid={`project-list-pages-label-${project.id}`}>Pages</p>
            <p className="mt-1 text-lg font-semibold text-white" data-testid={`project-list-pages-value-${project.id}`}>{project.page_count}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center" data-testid={`project-list-sections-${project.id}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500" data-testid={`project-list-sections-label-${project.id}`}>Sections</p>
            <p className="mt-1 text-lg font-semibold text-white" data-testid={`project-list-sections-value-${project.id}`}>{project.section_count}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center" data-testid={`project-list-last-edit-${project.id}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500" data-testid={`project-list-last-edit-label-${project.id}`}>Edited</p>
            <p className="mt-1 text-xs font-semibold text-zinc-200" data-testid={`project-list-last-edit-value-${project.id}`}>{formatTimestamp(project.updated_at)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 xl:justify-end" data-testid={`project-list-actions-${project.id}`}>
          <Button
            type="button"
            onClick={() => onOpen(project.id)}
            className="h-10 rounded-full px-4 text-primary-foreground"
            data-testid={`open-project-button-${project.id}`}
          >
            <FolderOpenDot className="mr-2 h-4 w-4" />
            Open
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="button-premium-secondary h-10 rounded-full px-4 text-white"
                data-testid={`delete-project-trigger-${project.id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2rem] border-white/10 bg-zinc-950 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle data-testid={`delete-project-title-${project.id}`}>Delete this project?</AlertDialogTitle>
                <AlertDialogDescription data-testid={`delete-project-description-${project.id}`}>
                  This removes the project and its saved pages from your dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid={`delete-project-cancel-${project.id}`}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(project.id)}
                  data-testid={`delete-project-confirm-${project.id}`}
                >
                  Delete project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </CardContent>
  </Card>
);


export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("Launch Site Builder");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const items = await builderApi.listProjects();
        setProjects(items);
      } catch (error) {
        console.error(error);
        toast.error("Could not load your saved projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const summary = useMemo(
    () => ({
      projectCount: projects.length,
      pageCount: projects.reduce((total, project) => total + project.page_count, 0),
      sectionCount: projects.reduce((total, project) => total + project.section_count, 0),
    }),
    [projects]
  );

  const handleCreateProject = async (event) => {
    event.preventDefault();

    if (!projectName.trim()) {
      toast.error("Give the project a name first.");
      return;
    }

    setCreating(true);

    try {
      const createdProject = await builderApi.createProject(createStarterProjectPayload(projectName));
      toast.success("Project created. Opening the builder now.");
      navigate(`/builder/${createdProject.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Could not create the project. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await builderApi.deleteProject(projectId);
      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
      toast.success("Project removed from the dashboard.");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete the project.");
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="builder-shell dashboard-shell bg-[#09090B] text-zinc-50" data-testid="dashboard-page">
      <main className="relative mx-auto flex max-w-7xl flex-col gap-7 px-5 py-8 md:px-8 md:py-10">
        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" data-testid="dashboard-session-bar">
          <div className="flex flex-wrap items-center gap-3">
            <span className="premium-pill inline-flex rounded-full px-4 py-2 text-sm text-zinc-200" data-testid="dashboard-session-status">
              Signed in
            </span>
            <div className="premium-subpanel flex items-center gap-3 rounded-full px-4 py-2" data-testid="dashboard-user-badge">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6f73ff_0%,#22d3ee_100%)] text-white shadow-[0_12px_28px_rgba(99,102,241,0.28)]">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white" data-testid="dashboard-user-name">{user?.name}</p>
                <p className="text-xs text-zinc-400" data-testid="dashboard-user-email">{user?.email}</p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={handleSignOut}
            className="button-premium-secondary h-11 rounded-full px-5 text-white"
            data-testid="dashboard-signout-button"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </section>

        <section className="panel-shell rounded-[2.5rem] p-6 md:p-8" data-testid="dashboard-hero-panel">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2" data-testid="dashboard-brand-chip">
                <img src="/website-builder-logo.png" alt="Website builder logo" className="h-8 w-auto" data-testid="dashboard-brand-logo-image" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-300" data-testid="dashboard-brand-name">Website builder</span>
              </div>

              <h1 className="mt-5 max-w-4xl font-heading text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white md:text-6xl" data-testid="dashboard-hero-title">
                Build, organize, and reopen every website project in one clean dashboard.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg" data-testid="dashboard-hero-description">
                Create a new starter project, then manage all pages and sections from a focused list-first workspace.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5" data-testid="create-project-form">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500" data-testid="create-project-label">
                Create project
              </p>
              <p className="mt-2 text-sm leading-7 text-zinc-400" data-testid="create-project-description">
                Name your new project and jump straight into the builder.
              </p>
              <label className="mt-4 mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500" htmlFor="project-name-input">
                Project name
              </label>
              <div className="flex flex-col gap-3">
                <Input
                  id="project-name-input"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  className="premium-input h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                  placeholder="Northstar Launch Site"
                  data-testid="project-name-input"
                />
                <Button
                  type="submit"
                  className="h-12 rounded-xl text-primary-foreground"
                  disabled={creating}
                  data-testid="create-project-button"
                >
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Create starter project
                </Button>
              </div>
            </form>
          </div>
        </section>

        <section className="panel-shell rounded-[2rem] p-5 md:p-6" data-testid="dashboard-stats-strip-panel">
          <div className="flex flex-wrap items-center justify-between gap-3" data-testid="dashboard-stats-strip-header">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500" data-testid="dashboard-summary-label">Workspace numbers</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.03em] text-white" data-testid="dashboard-summary-title">
                Snapshot above your project list
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3" data-testid="dashboard-stats-strip-grid">
            <DashboardStatCard label="Projects" value={summary.projectCount} dataTestId="dashboard-stat-projects" />
            <DashboardStatCard label="Saved pages" value={summary.pageCount} dataTestId="dashboard-stat-pages" />
            <DashboardStatCard label="Saved sections" value={summary.sectionCount} dataTestId="dashboard-stat-sections" />
          </div>
        </section>

        <section className="panel-shell rounded-[2.2rem] p-6 md:p-7" data-testid="dashboard-projects-panel">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500" data-testid="dashboard-projects-label">
                Saved projects
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold text-white" data-testid="dashboard-projects-title">
                Project list
              </h2>
            </div>
            <div className="premium-pill rounded-full px-4 py-2 text-sm text-zinc-200" data-testid="dashboard-projects-count">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </div>
          </div>

          {loading ? (
            <div className="premium-subpanel mt-8 flex items-center gap-3 rounded-[1.9rem] px-5 py-6" data-testid="dashboard-loading-state">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-zinc-300">Loading saved projects…</span>
            </div>
          ) : projects.length ? (
            <div className="mt-6 space-y-4" data-testid="dashboard-projects-list">
              {projects.map((project) => (
                <ProjectListItem
                  key={project.id}
                  project={project}
                  onOpen={(projectId) => navigate(`/builder/${projectId}`)}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div className="premium-subpanel mt-8 rounded-[2.1rem] border-dashed p-8 text-center" data-testid="dashboard-empty-state">
              <Clock3 className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-4 font-heading text-2xl font-semibold text-white">No saved projects yet.</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-400">
                Create your first starter project above and the builder will open with a ready-made multi-page structure.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}