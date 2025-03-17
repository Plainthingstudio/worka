
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lead } from '@/types';
import LeadForm from './LeadForm';

interface LeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  lead?: Lead;
  title: string;
  isLoading?: boolean;
}

const LeadDialog: React.FC<LeadDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lead,
  title,
  isLoading = false,
}) => {
  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <LeadForm
          onSubmit={handleSubmit}
          initialValues={lead}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LeadDialog;
