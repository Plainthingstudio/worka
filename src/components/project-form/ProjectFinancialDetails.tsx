
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues, currencies, projectTypes } from "./projectFormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectFinancialDetailsProps {
  form: UseFormReturn<ProjectFormValues>;
  formatFee: (value: string) => string;
  displayFee: (fee: number) => string;
}

const ProjectFinancialDetails = ({ form, formatFee, displayFee }: ProjectFinancialDetailsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField 
          control={form.control} 
          name="fee" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Fee</FormLabel>
              <FormControl>
                <Input 
                  type="text"
                  inputMode="decimal"
                  value={field.value === 0 ? "" : displayFee(field.value)}
                  onChange={(e) => {
                    const formatted = formatFee(e.target.value);
                    field.onChange(formatted === '' ? 0 : parseFloat(formatted));
                  }}
                  placeholder="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="currency" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} 
        />
      </div>

      <FormField 
        control={form.control} 
        name="projectType" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {projectTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} 
      />
    </>
  );
};

export default ProjectFinancialDetails;
