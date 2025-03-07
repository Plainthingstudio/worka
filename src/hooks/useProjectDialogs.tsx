
import { useState } from "react";
import { Payment, ProjectStatus } from "@/types";

export const useProjectDialogs = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isDeletePaymentDialogOpen, setIsDeletePaymentDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("In progress");

  const openEditPaymentDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsEditPaymentDialogOpen(true);
  };

  const openDeletePaymentDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsDeletePaymentDialogOpen(true);
  };

  return {
    isEditDialogOpen,
    isDeleteDialogOpen,
    isStatusDialogOpen,
    isPaymentDialogOpen,
    isEditPaymentDialogOpen,
    isDeletePaymentDialogOpen,
    currentPayment,
    selectedStatus,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setIsPaymentDialogOpen,
    setIsEditPaymentDialogOpen,
    setIsDeletePaymentDialogOpen,
    setSelectedStatus,
    setCurrentPayment,
    openEditPaymentDialog,
    openDeletePaymentDialog
  };
};
