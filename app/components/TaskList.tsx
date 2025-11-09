import { Task, useProjectStore } from '@/store/projectStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskListProps {
  projectId: string;
  tasks: Task[];
}

function SortableTask({
  task,
  projectId,
  onUpdate,
  onDelete,
  teamMembers,
}: {
  task: Task;
  projectId: string;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  teamMembers: any[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mt-1"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => onUpdate(task.id, { completed: !!checked })}
        className="mt-1"
      />
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <h4
            className={`font-medium text-card-foreground ${
              task.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p
              className={`text-sm text-muted-foreground mt-1 ${
                task.completed ? 'line-through' : ''
              }`}
            >
              {task.description}
            </p>
          )}
        </div>
        <Select
          value={task.assignedTo || 'unassigned'}
          onValueChange={(value) =>
            onUpdate(task.id, { assignedTo: value === 'unassigned' ? undefined : value })
          }
        >
          <SelectTrigger className="w-[200px] h-8">
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(task.id)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function TaskList({ projectId, tasks }: TaskListProps) {
  const { updateTask, deleteTask, addTask, reorderTasks, teamMembers } =
    useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
      const newIndex = sortedTasks.findIndex((t) => t.id === over.id);

      const newOrder = arrayMove(sortedTasks, oldIndex, newIndex);
      reorderTasks(
        projectId,
        newOrder.map((t) => t.id)
      );
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(projectId, {
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Tasks</h3>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 border border-border rounded-lg bg-card space-y-3">
          <Input
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            placeholder="Task description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddTask}>
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No tasks yet. Add your first task to get started!
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  onUpdate={(taskId, updates) => updateTask(projectId, taskId, updates)}
                  onDelete={(taskId) => deleteTask(projectId, taskId)}
                  teamMembers={teamMembers}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
