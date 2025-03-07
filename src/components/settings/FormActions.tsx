
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";

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
    <div className="flex justify-end pt-6 mt-8 border-t">
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
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="gap-2"
          >
            <X size={16} />
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
