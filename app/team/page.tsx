"use client";
import { useProjectStore } from "@/store/projectStore";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Mail } from "lucide-react";
import Link from "next/link";

const Page = () => {
  const { teamMembers, projects } = useProjectStore();

  const getTeamMemberStats = (memberId: string) => {
    const allTasks = projects.flatMap((p) => p.tasks);
    const assignedTasks = allTasks.filter((t) => t.assignedTo === memberId);
    const completedTasks = assignedTasks.filter((t) => t.completed);

    return {
      total: assignedTasks.length,
      completed: completedTasks.length,
      pending: assignedTasks.length - completedTasks.length,
    };
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 70) return "text-warning";
    return "text-success";
  };

  const getCapacityBg = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-card-foreground">
                  Team Overview
                </h1>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg text-muted-foreground">
            {teamMembers.length} team{" "}
            {teamMembers.length === 1 ? "member" : "members"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => {
            const stats = getTeamMemberStats(member.id);
            const capacityPercentage = (stats.total / member.maxCapacity) * 100;

            return (
              <Card
                key={member.id}
                className="p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-card-foreground mb-1">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Assigned Tasks
                      </span>
                      <span
                        className={`text-2xl font-bold ${getCapacityColor(
                          stats.total,
                          member.maxCapacity
                        )}`}
                      >
                        {stats.total}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Workload Capacity
                        </span>
                        <span
                          className={`font-medium ${getCapacityColor(
                            stats.total,
                            member.maxCapacity
                          )}`}
                        >
                          {stats.total}/{member.maxCapacity}
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getCapacityBg(
                            stats.total,
                            member.maxCapacity
                          )} transition-all duration-300`}
                          style={{
                            width: `${Math.min(capacityPercentage, 100)}%`,
                          }}
                        />
                      </div>
                      {capacityPercentage >= 100 && (
                        <p className="text-xs text-destructive font-medium">
                          ⚠️ Over capacity
                        </p>
                      )}
                      {capacityPercentage >= 70 && capacityPercentage < 100 && (
                        <p className="text-xs text-warning font-medium">
                          ⚠️ Near capacity
                        </p>
                      )}
                      {capacityPercentage < 70 && (
                        <p className="text-xs text-success font-medium">
                          ✓ Available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-card-foreground">
                          {stats.completed}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-card-foreground">
                          {stats.pending}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pending
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Page;
