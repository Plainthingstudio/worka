
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Palette, PencilRuler, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { generateIllustrationBriefPDF, generateUIDesignBriefPDF, generateGraphicDesignBriefPDF } from "@/utils/briefPdfGenerator";
import { toast } from "sonner";

// Import new components
import BriefStatCard from "@/components/briefs/BriefStatCard";
import BriefTypeCard from "@/components/briefs/BriefTypeCard";
import BriefsTable from "@/components/briefs/BriefsTable";
import BriefDetailsDialog from "@/components/briefs/BriefDetailsDialog";
import DeleteBriefDialog from "@/components/briefs/DeleteBriefDialog";

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
    const storedBriefs = localStorage.getItem("briefs");
    if (storedBriefs) {
      setBriefs(JSON.parse(storedBriefs));
    }
  }, []);

  const viewBriefDetails = (brief: Brief) => {
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
      const storedBriefs = localStorage.getItem("briefs");
      if (storedBriefs) {
        const briefs = JSON.parse(storedBriefs);
        const fullBrief = briefs.find((b: any) => b.id === brief.id);
        if (fullBrief) {
          if (fullBrief.type === "Illustration Design" || fullBrief.type === "Illustrations") {
            await generateIllustrationBriefPDF(fullBrief);
            toast.success("Illustration brief downloaded successfully");
          } else if (fullBrief.type === "UI Design") {
            await generateUIDesignBriefPDF(fullBrief);
            toast.success("UI Design brief downloaded successfully");
          } else if (fullBrief.type === "Graphic Design") {
            await generateGraphicDesignBriefPDF(fullBrief);
            toast.success("Graphic Design brief downloaded successfully");
          } else {
            toast.error("Download not supported for this brief type");
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
    return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
  });

  const statCounts = {
    total: briefs.length,
    ui: briefs.filter(b => b.type === "UI Design").length,
    graphic: briefs.filter(b => b.type === "Graphic Design").length,
    illustrations: briefs.filter(b => ["Illustrations", "Illustration Design"].includes(b.type)).length
  };
  
  const briefTypeCards = [
    {
      title: "UI Design Brief",
      description: "Get detailed information about your UI design project needs",
      content: "Form for websites, web apps, and other digital interfaces design projects.",
      route: "/briefs/ui-design",
      icon: LayoutDashboard,
      iconColor: "text-blue-500"
    },
    {
      title: "Graphic Design Brief",
      description: "Get detailed information about your graphic design project needs",
      content: "Form for logos, branding, print materials, and other graphic design projects.",
      route: "/briefs/graphic-design",
      icon: Palette,
      iconColor: "text-purple-500"
    },
    {
      title: "Illustrations Brief",
      description: "Get detailed information about your illustration project needs",
      content: "Form for custom illustrations, icons, infographics and other illustration projects.",
      route: "/briefs/illustrations",
      icon: PencilRuler,
      iconColor: "text-amber-500"
    }
  ];

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
                <Button onClick={() => navigate("/briefs/ui-design")} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Brief
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <BriefStatCard title="Total Briefs" count={statCounts.total} />
            <BriefStatCard title="UI Design" count={statCounts.ui} />
            <BriefStatCard title="Graphic Design" count={statCounts.graphic} />
            <BriefStatCard title="Illustrations" count={statCounts.illustrations} />
          </div>

          {/* Filters */}
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

          {/* Briefs Table */}
          <BriefsTable 
            briefs={filteredBriefs} 
            onView={viewBriefDetails}
            onDownload={downloadBrief}
            onDelete={handleDeleteBrief}
          />

          {/* Brief Type Cards */}
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Brief Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {briefTypeCards.map((card, index) => (
                <BriefTypeCard
                  key={index}
                  title={card.title}
                  description={card.description}
                  content={card.content}
                  route={card.route}
                  icon={card.icon}
                  iconColor={card.iconColor}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <DeleteBriefDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />

      <BriefDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        briefDetails={briefDetails}
        onDownload={downloadBrief}
      />
    </div>
  );
};

export default Briefs;
