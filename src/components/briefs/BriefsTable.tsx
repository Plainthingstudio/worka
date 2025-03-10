import React from "react";
import { format } from "date-fns";
import { Eye, Download, Trash, LayoutDashboard, Palette, PencilRuler, ImageIcon, Clock, CheckCircle, AlertCircle, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brief } from "@/types/brief";

interface BriefsTableProps {
  briefs: Brief[];
  onView: (brief: Brief) => void;
  onDownload: (brief: Brief) => void;
  onDelete: (brief: Brief) => void;
}

const BriefsTable: React.FC<BriefsTableProps> = ({ briefs, onView, onDownload, onDelete }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "UI Design":
        return <LayoutDashboard className="h-4 w-4 text-blue-500" />;
      case "Graphic Design":
        return <Palette className="h-4 w-4 text-purple-500" />;
      case "Illustration Design":
        return <PencilRuler className="h-4 w-4 text-amber-500" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <CircleDashed className="h-4 w-4 text-blue-500" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CircleDashed className="h-4 w-4" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 ring-blue-700/10 ring-inset";
      case "In Progress":
        return "bg-yellow-50 text-yellow-800 ring-yellow-600/20 ring-inset";
      case "Completed":
        return "bg-green-50 text-green-700 ring-green-600/20 ring-inset";
      case "Cancelled":
        return "bg-red-50 text-red-700 ring-red-600/10 ring-inset";
      default:
        return "bg-gray-50 text-gray-600 ring-gray-500/10 ring-inset";
    }
  };

  const getCompanyName = (brief: Brief) => {
    return brief.companyName || brief.company_name || "";
  };

  const getSubmissionDate = (brief: Brief) => {
    const dateString = brief.submissionDate || brief.submission_date;
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {briefs.length > 0 ? (
            briefs.map((brief) => (
              <TableRow key={brief.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(brief.type)}
                    <span>{brief.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{brief.name}</div>
                    <div className="text-sm text-muted-foreground">{brief.email}</div>
                  </div>
                </TableCell>
                <TableCell>{getCompanyName(brief)}</TableCell>
                <TableCell>
                  {getSubmissionDate(brief)}
                </TableCell>
                <TableCell>
                  <Badge className={`inline-flex items-center gap-1 w-fit ${getStatusBadgeClass(brief.status)}`}>
                    {getStatusIcon(brief.status)}
                    <span>{brief.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onView(brief)} title="View Brief">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onDownload(brief)} title="Download Brief">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => onDelete(brief)} title="Delete Brief">
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No briefs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BriefsTable;
