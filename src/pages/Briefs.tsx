import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { LayoutDashboard, Palette, PencilRuler, ImageIcon, Plus, ArrowUpRight, Clock, CheckCircle, AlertCircle, CircleDashed, Search, Download, Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { generateIllustrationBriefPDF } from "@/utils/briefPdfGenerator";
import { toast } from "sonner";
interface Brief {
  id: number;
  name: string;
  email: string;
  companyName: string;
  type: string;
  status: string;
  submissionDate: string;
}
const Briefs = () => {
  const navigate = useNavigate();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [briefDetails, setBriefDetails] = useState<any>(null);
  useEffect(() => {
    // Fetch briefs from localStorage
    const storedBriefs = localStorage.getItem("briefs");
    if (storedBriefs) {
      setBriefs(JSON.parse(storedBriefs));
    }
  }, []);
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "UI Design":
        return <LayoutDashboard className="h-4 w-4 text-blue-500" />;
      case "Graphic Design":
        return <Palette className="h-4 w-4 text-purple-500" />;
      case "Illustrations":
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
  const viewBriefDetails = (brief: Brief) => {
    // Fetch full brief data from localStorage
    const storedBriefs = localStorage.getItem("briefs");
    if (storedBriefs) {
      const briefs = JSON.parse(storedBriefs);
      const fullBrief = briefs.find((b: any) => b.id === brief.id);
      if (fullBrief) {
        setBriefDetails(fullBrief);
        setIsViewDialogOpen(true);
      }
    }
  };
  const handleDeleteBrief = (brief: Brief) => {
    setSelectedBrief(brief);
    setIsDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (selectedBrief) {
      const updatedBriefs = briefs.filter(brief => brief.id !== selectedBrief.id);
      localStorage.setItem("briefs", JSON.stringify(updatedBriefs));
      setBriefs(updatedBriefs);
      setIsDeleteDialogOpen(false);
      setSelectedBrief(null);
      toast.success("Brief deleted successfully!");
    }
  };
  const downloadBrief = async (brief: Brief) => {
    try {
      // Fetch full brief data from localStorage
      const storedBriefs = localStorage.getItem("briefs");
      if (storedBriefs) {
        const briefs = JSON.parse(storedBriefs);
        const fullBrief = briefs.find((b: any) => b.id === brief.id);
        if (fullBrief) {
          // Generate PDF with the full brief data
          if (fullBrief.type === "Illustration Design" || fullBrief.type === "Illustrations") {
            await generateIllustrationBriefPDF(fullBrief);
            toast.success("Illustration brief downloaded successfully");
          } else {
            toast.error("Download not supported for this brief type yet");
          }
        }
      }
    } catch (error) {
      console.error("Error downloading brief:", error);
      toast.error("Failed to download brief. Please try again.");
    }
  };
  const filteredBriefs = briefs.filter(brief => {
    if (filter === "all") return true;
    return brief.type === filter;
  }).filter(brief => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return brief.name.toLowerCase().includes(searchLower) || brief.email.toLowerCase().includes(searchLower) || brief.companyName?.toLowerCase().includes(searchLower);
  }).sort((a, b) => {
    // Sort by date (newest first)
    return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
  });
  const statCounts = {
    total: briefs.length,
    ui: briefs.filter(b => b.type === "UI Design").length,
    graphic: briefs.filter(b => b.type === "Graphic Design").length,
    illustrations: briefs.filter(b => ["Illustrations", "Illustration Design"].includes(b.type)).length
  };
  return <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-14 md:pl-56">
        <Navbar title="Briefs" />
        <main className="container py-6">
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-1">Client Briefs</h1>
                <p className="text-muted-foreground">Manage and review client brief submissions</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => navigate("/briefs/ui-design")} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Brief
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Briefs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statCounts.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  UI Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statCounts.ui}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Graphic Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statCounts.graphic}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Illustrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statCounts.illustrations}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="UI Design">UI Design</SelectItem>
                  <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                  <SelectItem value="Illustrations">Illustrations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search briefs..." className="w-full pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

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
                {filteredBriefs.length > 0 ? filteredBriefs.map(brief => <TableRow key={brief.id}>
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
                      <TableCell>{brief.companyName}</TableCell>
                      <TableCell>
                        {format(new Date(brief.submissionDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge className={`inline-flex items-center gap-1 w-fit ${getStatusBadgeClass(brief.status)}`}>
                          {getStatusIcon(brief.status)}
                          <span>{brief.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => viewBriefDetails(brief)} title="View Brief">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => downloadBrief(brief)} title="Download Brief">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteBrief(brief)} title="Delete Brief">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>) : <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No briefs found
                    </TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Brief Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                    <LayoutDashboard className="h-5 w-5 text-blue-500" />
                    UI Design Brief
                  </CardTitle>
                  <CardDescription>
                    Get detailed information about your UI design project needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Form for websites, web apps, and other digital interfaces design projects.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/briefs/ui-design")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Brief
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="h-5 w-5 text-purple-500" />
                    Graphic Design Brief
                  </CardTitle>
                  <CardDescription>
                    Get detailed information about your graphic design project needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Form for logos, branding, print materials, and other graphic design projects.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/briefs/graphic-design")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Brief
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PencilRuler className="h-5 w-5 text-amber-500" />
                    Illustrations Brief
                  </CardTitle>
                  <CardDescription>
                    Get detailed information about your illustration project needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Form for custom illustrations, icons, infographics and other illustration projects.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/briefs/illustrations")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Brief
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Brief</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this brief? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Brief Details</DialogTitle>
          </DialogHeader>
          
          {briefDetails && <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Client Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {briefDetails.name}</p>
                    <p><span className="font-medium">Email:</span> {briefDetails.email}</p>
                    <p><span className="font-medium">Company:</span> {briefDetails.companyName}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Brief Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Type:</span> {briefDetails.type}</p>
                    <p><span className="font-medium">Status:</span> {briefDetails.status}</p>
                    <p>
                      <span className="font-medium">Submitted:</span>{" "}
                      {format(new Date(briefDetails.submissionDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Project Details</h3>
                
                {briefDetails.type === "Illustration Design" && <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">About Company</h4>
                      <p className="mt-1">{briefDetails.aboutCompany || "Not provided"}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Illustrations Purpose</h4>
                      <p className="mt-1">{briefDetails.illustrationsPurpose || "Not provided"}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Illustrations For</h4>
                        <p className="mt-1">{briefDetails.illustrationsFor || "Not provided"}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Illustrations Style</h4>
                        <p className="mt-1">{briefDetails.illustrationsStyle || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Target Audience</h4>
                      <p className="mt-1">{briefDetails.targetAudience || "Not provided"}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Illustrations Details</h4>
                      <p><span className="font-medium">Count:</span> {briefDetails.illustrationsCount || "Not provided"}</p>
                      
                      {briefDetails.illustrationDetails && briefDetails.illustrationDetails.length > 0 && <div className="space-y-2 mt-2">
                          {briefDetails.illustrationDetails.map((detail: string, index: number) => detail && <div key={index} className="border p-3 rounded-md">
                                <p className="font-medium">Illustration {index + 1}</p>
                                <p>{detail}</p>
                              </div>)}
                        </div>}
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Deliverables</h4>
                      <p className="mt-1">
                        {briefDetails.deliverables && briefDetails.deliverables.length ? briefDetails.deliverables.join(", ") : "Not provided"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Completion Deadline</h4>
                      <p className="mt-1">
                        {briefDetails.completionDeadline ? format(new Date(briefDetails.completionDeadline), "MMMM d, yyyy") : "Not provided"}
                      </p>
                    </div>
                  </div>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => downloadBrief(briefDetails)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default Briefs;