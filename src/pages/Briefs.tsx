
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  LayoutDashboard,
  Palette, 
  PencilRuler, 
  ImageIcon, 
  Plus, 
  ArrowUpRight,
  Clock, 
  CheckCircle, 
  AlertCircle,
  CircleDashed,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

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

  const filteredBriefs = briefs
    .filter(brief => {
      if (filter === "all") return true;
      return brief.type === filter;
    })
    .filter(brief => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        brief.name.toLowerCase().includes(searchLower) ||
        brief.email.toLowerCase().includes(searchLower) ||
        brief.companyName?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
    });

  const statCounts = {
    total: briefs.length,
    ui: briefs.filter(b => b.type === "UI Design").length,
    graphic: briefs.filter(b => b.type === "Graphic Design").length,
    illustrations: briefs.filter(b => b.type === "Illustrations").length
  };

  return (
    <div className="min-h-screen bg-background">
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
                <Button
                  onClick={() => navigate("/briefs/ui-design")}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Brief
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
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

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select 
                value={filter} 
                onValueChange={setFilter}
              >
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
              <Input
                placeholder="Search briefs..."
                className="w-full pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Briefs Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBriefs.length > 0 ? (
                  filteredBriefs.map((brief) => (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {/* View detail functionality */}}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
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

          {/* Brief Form Cards */}
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Brief Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/briefs/ui-design")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Brief
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/briefs/graphic-design")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Brief
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/briefs/illustrations")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Brief
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Briefs;
