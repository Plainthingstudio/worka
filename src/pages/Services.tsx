import React, { useState } from "react";
import { Edit, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Currency,
  ServiceCategory,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  StudioService,
  StudioSubService,
} from "@/types";
import { useServices } from "@/hooks/useServices";

/** Radix Select does not allow SelectItem value="" */
const NO_SERVICE_CATEGORY = "__none__" as const;

type ServiceFormState = {
  name: string;
  description: string;
  price: number;
  currency: Currency;
  category: ServiceCategory | typeof NO_SERVICE_CATEGORY;
};

const emptyForm: ServiceFormState = {
  name: "",
  description: "",
  price: 0,
  currency: "IDR",
  category: NO_SERVICE_CATEGORY,
};

const formatPrice = (price: number, currency: Currency) =>
  `${price.toLocaleString()} ${currency}`;

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  ui_ux_design: "bg-blue-100 text-blue-700 border-blue-200",
  graphic_design: "bg-purple-100 text-purple-700 border-purple-200",
  illustrations: "bg-amber-100 text-amber-700 border-amber-200",
};

const Services = () => {
  const {
    services,
    isLoading,
    setupRequired,
    addService,
    updateService,
    deleteService,
    addSubService,
    updateSubService,
    deleteSubService,
  } = useServices();

  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isSubServiceDialogOpen, setIsSubServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<StudioService | null>(null);
  const [editingSubService, setEditingSubService] = useState<StudioSubService | null>(null);
  const [parentServiceId, setParentServiceId] = useState("");
  const [form, setForm] = useState<ServiceFormState>(emptyForm);

  const openServiceDialog = (service?: StudioService) => {
    setEditingService(service || null);
    setForm(service ? {
      name: service.name,
      description: service.description || "",
      price: service.price,
      currency: service.currency,
      category: service.category || NO_SERVICE_CATEGORY,
    } : emptyForm);
    setIsServiceDialogOpen(true);
  };

  const openSubServiceDialog = (serviceId: string, subService?: StudioSubService) => {
    setParentServiceId(serviceId);
    setEditingSubService(subService || null);
    setForm(subService ? {
      name: subService.name,
      description: subService.description || "",
      price: subService.price,
      currency: subService.currency,
      category: NO_SERVICE_CATEGORY,
    } : {
      ...emptyForm,
      currency: services.find((service) => service.id === serviceId)?.currency || "IDR",
    });
    setIsSubServiceDialogOpen(true);
  };

  const saveService = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price) || 0,
      currency: form.currency,
      category: form.category === NO_SERVICE_CATEGORY ? undefined : form.category,
    };

    const success = editingService
      ? await updateService(editingService.id, payload)
      : await addService(payload);

    if (success) {
      setIsServiceDialogOpen(false);
      setEditingService(null);
    }
  };

  const saveSubService = async () => {
    if (!form.name.trim() || !parentServiceId) return;
    const payload = {
      serviceId: parentServiceId,
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price) || 0,
      currency: form.currency,
    };

    const success = editingSubService
      ? await updateSubService(editingSubService.id, payload)
      : await addSubService(payload);

    if (success) {
      setIsSubServiceDialogOpen(false);
      setEditingSubService(null);
    }
  };

  return (
    <main className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Create reusable services, sub-services, and pricing for projects.
          </p>
        </div>
        <Button onClick={() => openServiceDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Service
        </Button>
      </div>

      {setupRequired ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <h2 className="font-semibold">Services database setup required</h2>
          <p className="mt-1 text-sm">
            The Appwrite collections for services are not available yet. Run the Appwrite bootstrap script, then refresh this page.
          </p>
        </div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-24 rounded-md bg-muted" />
          <div className="h-24 rounded-md bg-muted" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <h2 className="text-lg font-semibold">No services yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first service to make project pricing faster.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service.id} className="rounded-md border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{service.name}</h2>
                    <Badge variant="secondary">{formatPrice(service.price, service.currency)}</Badge>
                    {service.category && (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[service.category]}`}>
                        {SERVICE_CATEGORY_LABELS[service.category]}
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openSubServiceDialog(service.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Sub-service
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openServiceDialog(service)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit service</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteService(service.id)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete service</span>
                  </Button>
                </div>
              </div>

              {(service.subServices || []).length > 0 && (
                <div className="mt-4 divide-y rounded-md border">
                  {(service.subServices || []).map((subService) => (
                    <div key={subService.id} className="flex items-center justify-between gap-3 p-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{subService.name}</span>
                          <Badge variant="outline">{formatPrice(subService.price, subService.currency)}</Badge>
                        </div>
                        {subService.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{subService.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openSubServiceDialog(service.id, subService)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit sub-service</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteSubService(subService.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete sub-service</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Service dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          <ServiceForm form={form} setForm={setForm} showCategory />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveService}>{editingService ? "Save Changes" : "Create Service"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Sub-service dialog — no category */}
      <Dialog open={isSubServiceDialogOpen} onOpenChange={setIsSubServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubService ? "Edit Sub-service" : "New Sub-service"}</DialogTitle>
          </DialogHeader>
          <ServiceForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubServiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveSubService}>{editingSubService ? "Save Changes" : "Create Sub-service"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

const ServiceForm = ({
  form,
  setForm,
  showCategory = false,
}: {
  form: ServiceFormState;
  setForm: React.Dispatch<React.SetStateAction<ServiceFormState>>;
  showCategory?: boolean;
}) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="serviceName">Name</Label>
      <Input
        id="serviceName"
        className="mt-1"
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
      />
    </div>
    <div>
      <Label htmlFor="serviceDescription">Description</Label>
      <Textarea
        id="serviceDescription"
        className="mt-1"
        value={form.description}
        onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="servicePrice">Price</Label>
        <Input
          id="servicePrice"
          type="number"
          min="0"
          className="mt-1"
          value={form.price || ""}
          onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) || 0 }))}
        />
      </div>
      <div>
        <Label>Currency</Label>
        <Select
          value={form.currency}
          onValueChange={(value) => setForm((prev) => ({ ...prev, currency: value as Currency }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IDR">IDR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    {showCategory && (
      <div>
        <Label>Category</Label>
        <Select
          value={form.category}
          onValueChange={(value) =>
            setForm((prev) => ({
              ...prev,
              category: value as ServiceCategory | typeof NO_SERVICE_CATEGORY,
            }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a category (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_SERVICE_CATEGORY}>— No category —</SelectItem>
            {SERVICE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {SERVICE_CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
  </div>
);

export default Services;
