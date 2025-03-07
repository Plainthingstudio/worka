
import React from "react";

const ProjectsLoading = () => {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-2 text-muted-foreground">Loading projects...</p>
    </div>
  );
};

export default ProjectsLoading;
