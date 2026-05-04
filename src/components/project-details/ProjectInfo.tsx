import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  DollarSign,
  UserCircle,
  Tag,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  UserRound,
  FolderOpen,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Client, Project, TeamMember } from "@/types";
import { databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import SectionCardHeader from "./SectionCardHeader";
import { useServices } from "@/hooks/useServices";

interface ProjectInfoProps {
  project: Project;
  client: Client;
}

const cardStyle: React.CSSProperties = {
  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 24,
  boxSizing: "border-box",
  flex: 1,
  minWidth: 0,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: 14,
  lineHeight: "20px",
};

const valueStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
};

const InfoRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  children: React.ReactNode;
}) => (
  <div style={rowStyle}>
    <Icon
      className="h-4 w-4 flex-shrink-0 text-muted-foreground"
      style={{ marginTop: 4 }}
    />
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
      <span className="text-foreground" style={labelStyle}>{label}</span>
      <div className="text-muted-foreground" style={valueStyle}>{children}</div>
    </div>
  </div>
);

const ProjectInfo = ({ project, client }: ProjectInfoProps) => {
  const [assignedTeamMembers, setAssignedTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);
  const { services } = useServices();
  const serviceQuantityMap = new Map<string, number>();
  (project.serviceIds || []).forEach((id, index) => {
    const qty = project.serviceQuantities?.[index];
    serviceQuantityMap.set(id, typeof qty === "number" && qty > 0 ? qty : 1);
  });
  const subServiceQuantityMap = new Map<string, number>();
  (project.subServiceIds || []).forEach((id, index) => {
    const qty = project.subServiceQuantities?.[index];
    subServiceQuantityMap.set(id, typeof qty === "number" && qty > 0 ? qty : 1);
  });
  const selectedServices = services
    .filter((service) => serviceQuantityMap.has(service.id))
    .map((service) => ({ service, qty: serviceQuantityMap.get(service.id) || 1 }));
  const selectedSubServices = services
    .flatMap((service) => service.subServices || [])
    .filter((subService) => subServiceQuantityMap.has(subService.id))
    .map((subService) => ({ subService, qty: subServiceQuantityMap.get(subService.id) || 1 }));

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (project.teamMembers && project.teamMembers.length > 0) {
        setIsLoadingTeamMembers(true);
        try {
          const response = await databases.listDocuments(DATABASE_ID, "team_members", [
            Query.equal("$id", project.teamMembers),
          ]);
          const transformedMembers: TeamMember[] = (response.documents || []).map(
            (member): TeamMember => ({
              id: member.$id,
              user_id: member.user_id,
              name: member.name,
              position: member.position as any,
              skills: member.skills || [],
              startDate: new Date(member.start_date),
              createdAt: new Date(member.$createdAt),
            })
          );
          setAssignedTeamMembers(transformedMembers);
        } catch (error) {
          console.error("Error loading team members:", error);
        } finally {
          setIsLoadingTeamMembers(false);
        }
      } else {
        setAssignedTeamMembers([]);
      }
    };
    loadTeamMembers();
  }, [project.teamMembers, project.id]);

  return (
    <div className="flex flex-col md:flex-row" style={{ gap: 16, width: "100%" }}>
      {/* Client Information Card */}
      <div className="bg-card border border-border-soft" style={cardStyle}>
        <SectionCardHeader
          icon={UserRound}
          title="Client Information"
          subtitle="Contact and billing details"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <InfoRow icon={UserCircle} label="Name">
            {client.name}
          </InfoRow>
          <InfoRow icon={Mail} label="Email">
            {client.email}
          </InfoRow>
          <InfoRow icon={Phone} label="Phone">
            {client.phone}
          </InfoRow>
          <InfoRow icon={Tag} label="Lead Source">
            {client.leadSource}
          </InfoRow>
          {client.address && (
            <InfoRow icon={MapPin} label="Address">
              {client.address}
            </InfoRow>
          )}
        </div>
      </div>

      {/* Project Details Card */}
      <div className="bg-card border border-border-soft" style={cardStyle}>
        <SectionCardHeader
          icon={FolderOpen}
          title="Project Details"
          subtitle="Deadline, fee, and scope information"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <InfoRow icon={CalendarIcon} label="Deadline">
            {format(new Date(project.deadline), "MMMM d, yyyy")}
          </InfoRow>
          <InfoRow icon={DollarSign} label="Fee">
            {project.fee.toLocaleString()} {project.currency}
          </InfoRow>
          <InfoRow icon={Clock} label="Created At">
            {format(new Date(project.createdAt), "MMMM d, yyyy")}
          </InfoRow>
          <InfoRow icon={Package} label="Services">
            <div className="flex flex-wrap" style={{ gap: 6, marginTop: 4 }}>
              {selectedServices.length === 0 && selectedSubServices.length === 0 ? (
                <span>No services selected</span>
              ) : (
                <>
                  {selectedServices.map(({ service, qty }) => (
                    <Badge key={service.id} variant="secondary">
                      {service.name} ×{qty} - {(service.price * qty).toLocaleString()} {service.currency}
                    </Badge>
                  ))}
                  {selectedSubServices.map(({ subService, qty }) => (
                    <Badge key={subService.id} variant="outline">
                      {subService.name} ×{qty} - {(subService.price * qty).toLocaleString()} {subService.currency}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </InfoRow>
          <InfoRow icon={Users} label="Team Members">
            <div className="flex flex-wrap" style={{ gap: 6, marginTop: 4 }}>
              {isLoadingTeamMembers ? (
                <span>Loading team members...</span>
              ) : assignedTeamMembers.length > 0 ? (
                assignedTeamMembers.map((member) => (
                  <Badge
                    key={member.id}
                    variant="category"
                    className="flex items-center gap-1 py-1 pl-2"
                  >
                    <Users className="h-3 w-3 text-muted-foreground mr-1" />
                    {member.name}{" "}
                    <span className="text-muted-foreground text-xs">
                      - {member.position}
                    </span>
                  </Badge>
                ))
              ) : (
                <span>No team members assigned</span>
              )}
            </div>
          </InfoRow>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
