"use client";
import { useState } from "react";
import { useProjectStore, ProjectStatus } from "@/store/projectStore";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDialog } from "@/components/ProjectDialog";
import { ProjectDetailPanel } from "@/components/ProjectDetailPanel";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";

const Index = () => {
  const { projects, selectProject, selectedProject } = useProjectStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState<typeof selectedProject>(null);

  const projectsByStatus = {
    todo: projects.filter((p) => p.status === "todo"),
    ongoing: projects.filter((p) => p.status === "ongoing"),
    done: projects.filter((p) => p.status === "done"),
  };

  const handleEditClick = () => {
    setEditingProject(selectedProject);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-card-foreground">
                ProjectHub
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/team">
                <Button variant="outline" className="gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </Button>
              </Link>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(["todo", "ongoing", "done"] as ProjectStatus[]).map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground capitalize">
                  {status === "todo"
                    ? "To Do"
                    : status === "ongoing"
                    ? "In Progress"
                    : "Completed"}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {projectsByStatus[status].length}
                </span>
              </div>
              <div className="space-y-4">
                {projectsByStatus[status].length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card">
                    <p className="text-muted-foreground">No projects</p>
                  </div>
                ) : (
                  projectsByStatus[status].map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => selectProject(project.id)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProject(null);
        }}
        project={editingProject || undefined}
      />

      <ProjectDetailPanel onEdit={handleEditClick} />
    </div>
  );
};

export default Index;
