
import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface IllustrationStepOneProps {
  onNext: () => void;
}

const IllustrationStepOne: React.FC<IllustrationStepOneProps> = ({ onNext }) => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">About You and Your Company</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register("name", { required: "Name is required" })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="Enter your phone number"
            {...register("phone")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
          <Input
            id="companyName"
            placeholder="Enter your company name"
            {...register("companyName", { required: "Company name is required" })}
            className={errors.companyName ? "border-red-500" : ""}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm">{String(errors.companyName.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aboutCompany">About Your Company <span className="text-red-500">*</span></Label>
          <Textarea
            id="aboutCompany"
            placeholder="Tell us about your company, products, services and value proposition"
            {...register("aboutCompany", { required: "Company description is required" })}
            className={`min-h-[100px] ${errors.aboutCompany ? "border-red-500" : ""}`}
          />
          {errors.aboutCompany && (
            <p className="text-red-500 text-sm">{String(errors.aboutCompany.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="illustrationsPurpose">Purpose of Illustrations <span className="text-red-500">*</span></Label>
          <Textarea
            id="illustrationsPurpose"
            placeholder="What do you need these illustrations for? (e.g., website, marketing, product, etc.)"
            {...register("illustrationsPurpose", { required: "Purpose is required" })}
            className={`min-h-[100px] ${errors.illustrationsPurpose ? "border-red-500" : ""}`}
          />
          {errors.illustrationsPurpose && (
            <p className="text-red-500 text-sm">{String(errors.illustrationsPurpose.message)}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="w-full sm:w-auto">
          Next
        </Button>
      </div>
    </div>
  );
};

export default IllustrationStepOne;
