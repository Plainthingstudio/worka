
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getValue, formatDate } from "./ui-design/UIHelperFunctions";

interface UIDesignBriefDetailsProps {
  briefDetails: any;
}

const UIDesignBriefDetails: React.FC<UIDesignBriefDetailsProps> = ({ briefDetails }) => {
  console.log("UI design brief details:", briefDetails);

  return (
    <div className="space-y-6">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Name:</span>
              <p>{getValue(briefDetails, "name", "name")}</p>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <p>{getValue(briefDetails, "email", "email")}</p>
            </div>
            <div>
              <span className="font-medium">Company:</span>
              <p>{getValue(briefDetails, "companyName", "company_name")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">Project Description:</span>
            <p className="whitespace-pre-wrap">{getValue(briefDetails, "projectDescription", "project_description")}</p>
          </div>
          <div>
            <span className="font-medium">Deadline:</span>
            <p>{formatDate(getValue(briefDetails, "completionDeadline", "completion_deadline"))}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Project Type:</span>
              <p>{getValue(briefDetails, "projectType", "project_type")}</p>
            </div>
            <div>
              <span className="font-medium">Project Size:</span>
              <p>{getValue(briefDetails, "projectSize", "project_size")}</p>
            </div>
            <div>
              <span className="font-medium">Website Type:</span>
              <p>{getValue(briefDetails, "websiteType", "website_type_interest")}</p>
            </div>
          </div>
          <div>
            <span className="font-medium">Current Website:</span>
            <p>{getValue(briefDetails, "currentWebsite", "current_website") || "Not provided"}</p>
          </div>
          <div>
            <span className="font-medium">Website Purpose:</span>
            <p className="whitespace-pre-wrap">{getValue(briefDetails, "websitePurpose", "website_purpose")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Company & Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle>Company & Target Audience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">About Company:</span>
            <p className="whitespace-pre-wrap">{getValue(briefDetails, "aboutCompany", "about_company")}</p>
          </div>
          <div>
            <span className="font-medium">Target Audience:</span>
            <p className="whitespace-pre-wrap">{getValue(briefDetails, "targetAudience", "target_audience")}</p>
          </div>
          <div>
            <span className="font-medium">Industry:</span>
            <p>{getValue(briefDetails, "industry", "industry")}</p>
          </div>
          <div>
            <span className="font-medium">Competitors:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {[1, 2, 3, 4].map(i => {
                const competitor = getValue(briefDetails, `competitor${i}`, `competitor${i}`, "");
                return competitor !== "Not provided" && competitor ? (
                  <p key={i} className="text-sm">• {competitor}</p>
                ) : null;
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Design Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">General Style:</span>
            <p className="whitespace-pre-wrap">{getValue(briefDetails, "generalStyle", "general_style")}</p>
          </div>
          <div>
            <span className="font-medium">Color Preferences:</span>
            <p>{getValue(briefDetails, "colorPreferences", "color_preferences")}</p>
          </div>
          <div>
            <span className="font-medium">References:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {[1, 2, 3, 4].map(i => {
                const reference = getValue(briefDetails, `reference${i}`, `reference${i}`, "");
                return reference !== "Not provided" && reference ? (
                  <p key={i} className="text-sm">• {reference}</p>
                ) : null;
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand & Design */}
      <Card>
        <CardHeader>
          <CardTitle>Brand & Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">Existing Brand Assets:</span>
            <p>{getValue(briefDetails, "existingBrandAssets", "existing_brand_assets")}</p>
            {getValue(briefDetails, "brandAssetsDetails", "brand_guidelines_details") !== "Not provided" && (
              <p className="mt-2 text-sm text-muted-foreground">
                {getValue(briefDetails, "brandAssetsDetails", "brand_guidelines_details")}
              </p>
            )}
          </div>
          <div>
            <span className="font-medium">Wireframe:</span>
            <p>{getValue(briefDetails, "hasWireframe", "has_wireframe")}</p>
            {getValue(briefDetails, "wireframeDetails", "wireframe_details") !== "Not provided" && (
              <p className="mt-2 text-sm text-muted-foreground">
                {getValue(briefDetails, "wireframeDetails", "wireframe_details")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Details */}
      <Card>
        <CardHeader>
          <CardTitle>Final Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">Website Content:</span>
            <p>{getValue(briefDetails, "websiteContent", "website_content")}</p>
          </div>
          <div>
            <span className="font-medium">Development Service:</span>
            <p>{getValue(briefDetails, "developmentService", "development_service")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UIDesignBriefDetails;
