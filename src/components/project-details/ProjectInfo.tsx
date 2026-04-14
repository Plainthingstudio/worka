import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, UserCircle, Tag, Clock, Users, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Client, Project, TeamMember } from "@/types";
import { databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { getStatusBadgeVariant, getProjectTypeBadgeVariant } from "@/components/projects/utils/projectItemUtils";

interface ProjectInfoProps {
  project: Project;
  client: Client;
}

const ProjectInfo = ({
  project,
  client
}: ProjectInfoProps) => {
  const [assignedTeamMembers, setAssignedTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (project.teamMembers && project.teamMembers.length > 0) {
        setIsLoadingTeamMembers(true);
        console.log("Loading team members for project:", project.id, "Team member IDs:", project.teamMembers);
        try {
          const response = await databases.listDocuments(DATABASE_ID, 'team_members', [
            Query.equal('$id', project.teamMembers)
          ]);
          const teamMembersData = response.documents;

          console.log("Fetched team members data:", teamMembersData);
          const transformedMembers: TeamMember[] = (teamMembersData || []).map((member): TeamMember => ({
            id: member.$id,
            user_id: member.user_id,
            name: member.name,
            position: member.position as any,
            skills: member.skills || [],
            startDate: new Date(member.start_date),
            createdAt: new Date(member.$createdAt)
          }));
          setAssignedTeamMembers(transformedMembers);
        } catch (error) {
          console.error("Error loading team members:", error);
        } finally {
          setIsLoadingTeamMembers(false);
        }
      } else {
        console.log("No team members assigned to project:", project.id);
        setAssignedTeamMembers([]);
      }
    };
    loadTeamMembers();
  }, [project.teamMembers, project.id]);

  return <div className="col-span-7 md:col-span-5">
      <Card className="border rounded-xl shadow-sm overflow-hidden">
        {/* Project Header */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="tracking-tight text-xl font-semibold">{project.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusBadgeVariant(project.status as any)}>
                  {project.status}
                </Badge>
                <Badge variant={getProjectTypeBadgeVariant(project.projectType as any)}>
                  <Tag className="h-3.5 w-3.5" />
                  {project.projectType}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* Client Information */}
            <div className="p-6">
              <h2 className="font-semibold text-lg mb-4">Client Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <UserCircle className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{client.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Lead Source</p>
                    <p className="text-sm text-muted-foreground">{client.leadSource}</p>
                  </div>
                </div>

                {client.address && <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{client.address}</p>
                    </div>
                  </div>}
              </div>
            </div>

            {/* Project Details */}
            <div className="p-6">
              <h2 className="font-semibold text-lg mb-4">Project Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CalendarIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(project.deadline), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fee</p>
                    <p className="text-sm text-muted-foreground">
                      {project.fee.toLocaleString()} {project.currency}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(project.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Categories</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.categories.map((category, index) => <Badge key={index} variant="category">
                          {category}
                        </Badge>)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Team Members</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {isLoadingTeamMembers ? <p className="text-sm text-muted-foreground">Loading team members...</p> : assignedTeamMembers.length > 0 ? assignedTeamMembers.map(member => <Badge key={member.id} variant="category" className="flex items-center gap-1 py-1 pl-2">
                            <Users className="h-3 w-3 text-muted-foreground mr-1" />
                            {member.name} - <span className="text-muted-foreground text-xs">{member.position}</span>
                          </Badge>) : <p className="text-sm text-muted-foreground">No team members assigned</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};

export default ProjectInfo;
