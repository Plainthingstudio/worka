
import React from "react";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, UserCircle, Tag, Clock, ArrowRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, Project } from "@/types";
import { mockTeamMembers } from "@/pages/Team";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectInfoProps {
  project: Project;
  client: Client;
}

const ProjectInfo = ({ project, client }: ProjectInfoProps) => {
  // Get assigned team members
  const assignedTeamMembers = project.teamMembers ? 
    mockTeamMembers.filter(member => project.teamMembers?.includes(member.id)) : 
    [];

  return (
    <div className="col-span-7 md:col-span-5 space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Project Name</p>
                  <p className="text-sm">{project.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <UserCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Status</p>
                  <div>
                    <Badge variant="outline" className="bg-background">
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Created & Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(project.createdAt), "MMM dd, yyyy")}
                    <ArrowRight className="h-3 w-3 inline mx-1" />
                    {format(new Date(project.deadline), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Project Fee</p>
                  <p className="text-sm">
                    {project.fee.toLocaleString()} {project.currency}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Project Type</p>
                  <Badge variant="secondary">{project.projectType}</Badge>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="bg-background">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Team Members</p>
                  {mockTeamMembers.length > 0 ? (
                    <Select defaultValue={assignedTeamMembers.length > 0 ? assignedTeamMembers[0].id : undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignedTeamMembers.length > 0 ? (
                          assignedTeamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.position})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No team members assigned</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">No team members assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectInfo;
