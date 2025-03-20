
import React from 'react';

interface EmptyLeadsStateProps {
  isLoading: boolean;
}

const EmptyLeadsState: React.FC<EmptyLeadsStateProps> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-muted-foreground mb-4">No leads found</p>
    </div>
  );
};

export default EmptyLeadsState;
