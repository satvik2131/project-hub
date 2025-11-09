import { useProjectStore } from "@/store/projectStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskList } from "./TaskList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProjectDetailPanelProps {
  onEdit: () => void;
}

const statusConfig = {
  todo: {
    label: "To Do",
    icon: Circle,
    className: "bg-muted text-muted-foreground",
  },
  ongoing: {
    label: "In Progress",
    icon: Clock,
    className: "bg-info text-info-foreground",
  },
  done: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-success text-success-foreground",
  },
};

export function ProjectDetailPanel({ onEdit }: ProjectDetailPanelProps) {
  const { selectedProject, selectProject, deleteProject, updateProject } =
    useProjectStore();
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(
    selectedProject?.progress || 0
  );

  if (!selectedProject) return null;

  const config = statusConfig[selectedProject.status];
  const Icon = config.icon;

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(selectedProject.id);
      selectProject(null);
    }
  };

  const handleProgressUpdate = () => {
    const clampedValue = Math.max(0, Math.min(100, progressValue));
    updateProject(selectedProject.id, { progress: clampedValue });
    setIsEditingProgress(false);
  };

  return (
    <Sheet open={!!selectedProject} onOpenChange={() => selectProject(null)}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{selectedProject.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <Badge className={config.className}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h3>
            <p className="text-card-foreground">
              {selectedProject.description}
            </p>
          </div>

          {selectedProject.status === "ongoing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                {isEditingProgress ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(e) => setProgressValue(Number(e.target.value))}
                      className="w-20 h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleProgressUpdate();
                        if (e.key === "Escape") setIsEditingProgress(false);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleProgressUpdate}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setProgressValue(selectedProject.progress);
                      setIsEditingProgress(true);
                    }}
                    className="flex items-center gap-1 font-medium text-card-foreground hover:text-primary transition-colors"
                  >
                    {selectedProject.progress}%
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
              <Progress value={selectedProject.progress} className="h-2" />
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <TaskList
              projectId={selectedProject.id}
              tasks={selectedProject.tasks}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
