import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/types";
interface PaymentSummaryProps {
  project: Project;
  onAddPayment: () => void;
}
const PaymentSummary = ({
  project,
  onAddPayment
}: PaymentSummaryProps) => {
  return <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Payment Summary</CardTitle>
        <CardDescription>Track all payments for this project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Total Fee:</span>
            <span className="text-sm font-bold">{project.fee.toLocaleString()} {project.currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Paid Amount:</span>
            <span className="text-sm">
              {project.payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}{" "}
              {project.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Remaining:</span>
            <span className="text-sm">
              {(project.fee - project.payments.reduce((sum, payment) => sum + payment.amount, 0)).toLocaleString()}{" "}
              {project.currency}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm font-medium">Payment Count:</span>
            <span className="text-sm">{project.payments.length}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2" onClick={onAddPayment}>
          <Plus className="h-4 w-4" /> Add Payment
        </Button>
      </CardFooter>
    </Card>;
};
export default PaymentSummary;