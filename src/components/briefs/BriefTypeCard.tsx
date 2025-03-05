
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BriefTypeCardProps {
  title: string;
  description: string;
  content: string;
  route: string;
  icon: LucideIcon;
  iconColor: string;
}

const BriefTypeCard: React.FC<BriefTypeCardProps> = ({
  title,
  description,
  content,
  route,
  icon: Icon,
  iconColor,
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{content}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => navigate(route)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Brief
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BriefTypeCard;
