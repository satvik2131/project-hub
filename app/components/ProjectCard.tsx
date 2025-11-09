import { Project } from '@/store/projectStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const statusConfig = {
  todo: {
    label: 'To Do',
    icon: Circle,
    className: 'bg-muted text-muted-foreground',
  },
  ongoing: {
    label: 'In Progress',
    icon: Clock,
    className: 'bg-info text-info-foreground',
  },
  done: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-success text-success-foreground',
  },
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const config = statusConfig[project.status];
  const Icon = config.icon;

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/50"
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </div>
          <Badge className={config.className}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {project.status === 'ongoing' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-card-foreground">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {project.tasks.length} {project.tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          {project.status !== 'todo' && (
            <span className="text-sm text-muted-foreground">
              {project.tasks.filter((t) => t.completed).length} completed
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
