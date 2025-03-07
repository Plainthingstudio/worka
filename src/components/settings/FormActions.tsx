
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface FormActionsProps {
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export function FormActions({ 
  isEditing, 
  isSaving, 
  onEdit, 
  onCancel 
}: FormActionsProps) {
  return (
    <div className="flex justify-end pt-6 border-t mt-6">
      {!isEditing ? (
        <Button 
          type="button" 
          onClick={onEdit}
          className="gap-2"
        >
          <Pencil size={16} />
          Edit
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
