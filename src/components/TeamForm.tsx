
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X, Plus } from "lucide-react";
import { TeamMember, TeamPosition } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  position: z.string({
    required_error: "Please select a position."
  }),
  role: z.string({
    required_error: "Please select a role."
  }),
  startDate: z.date({
    required_error: "Please select a start date."
  }),
  skills: z.array(z.string()).min(1, {
    message: "Add at least one skill."
  })
});

interface TeamFormProps {
  teamMember?: TeamMember & { role?: string; email?: string };
  onSave: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

const TeamForm = ({
  teamMember,
  onSave,
  onCancel
}: TeamFormProps) => {
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    teamMember?.skills || []
  );
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  // Common skills for suggestion
  const skillSuggestions = [
    "UI Design", 
    "UX Design", 
    "Web Design", 
    "Mobile Design",
    "Branding",
    "Typography",
    "Illustration",
    "Animation",
    "Wireframing",
    "Prototyping",
    "User Research",
    "Figma",
    "Sketch",
    "Adobe XD",
    "Photoshop",
    "Illustrator",
    "After Effects",
    "InDesign",
    "HTML/CSS",
    "JavaScript",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "PHP",
    "WordPress",
    "Webflow",
    "Framer"
  ];

  const positions: TeamPosition[] = [
    "Project Manager",
    "Account Executive",
    "UI Designer",
    "Senior UI Designer",
    "Design Director",
    "Lead UI Designer",
    "Lead Graphic Designer",
    "Lead Illustrator",
    "Illustrator",
    "Graphic Designer",
    "Co-Founder"
  ];

  const roles = [
    { value: "owner", label: "Owner" },
    { value: "administrator", label: "Administrator" },
    { value: "team", label: "Team Member" }
  ];

  // Fetch current role if editing existing member
  useEffect(() => {
    const fetchCurrentRole = async () => {
      if (teamMember?.email) {
        try {
          // First get the user by email
          const { data: userData } = await supabase.auth.admin.listUsers();
          const user = userData.users.find(u => u.email === teamMember.email);
          
          if (user) {
            // Then get their role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .single();
            
            if (roleData) {
              setCurrentRole(roleData.role);
            }
          }
        } catch (error) {
          console.error('Error fetching current role:', error);
        }
      }
    };

    fetchCurrentRole();
  }, [teamMember?.email]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teamMember?.name || "",
      email: teamMember?.email || "",
      position: teamMember?.position || "",
      role: teamMember?.role || currentRole || "team",
      startDate: teamMember?.startDate ? new Date(teamMember.startDate) : new Date(),
      skills: teamMember?.skills || []
    }
  });

  // Update form skills value when selectedSkills changes
  React.useEffect(() => {
    form.setValue('skills', selectedSkills);
  }, [selectedSkills, form]);

  // Update role when currentRole is fetched
  React.useEffect(() => {
    if (currentRole && !teamMember?.role) {
      form.setValue('role', currentRole);
    }
  }, [currentRole, form, teamMember?.role]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  // Skill management functions
  const addSkill = (skill: string) => {
    if (skill.trim() === "") return;
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>
            {teamMember ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            {teamMember ? "Update team member information and role." : "Add a new team member with their role and permissions."}
          </DialogDescription>
        </DialogHeader>

        <FormField 
          control={form.control} 
          name="name" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="email" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="position" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {positions.map(position => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="role" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              {currentRole && (
                <p className="text-xs text-muted-foreground">
                  Current role in system: <span className="capitalize font-medium">{currentRole}</span>
                </p>
              )}
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="startDate" 
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button 
                      variant={"outline"} 
                      className={cn(
                        "w-full pl-3 text-left font-normal", 
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={field.value} 
                    onSelect={field.onChange} 
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="skills" 
          render={() => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <div className="flex flex-col space-y-3">
                <div className="flex">
                  <FormControl>
                    <Input 
                      placeholder="Add a skill..." 
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(skillInput);
                        }
                      }}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => addSkill(skillInput)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pb-2">
                  {selectedSkills.map(skill => (
                    <Badge key={skill} variant="outline" className="flex items-center gap-1">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => removeSkill(skill)}
                        className="rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {skill}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Suggested skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {skillSuggestions
                      .filter(skill => !selectedSkills.includes(skill))
                      .slice(0, 10)
                      .map(skill => (
                        <Badge 
                          key={skill} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )} 
        />

        <DialogFooter className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {teamMember ? "Update Team Member" : "Add Team Member"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default TeamForm;
