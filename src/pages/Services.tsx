import React, { useMemo, useState } from "react";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ui_ux_design: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/30",
  graphic_design: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/30",
  illustrations: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30",
};

type ServiceCategoryFilter = "all" | ServiceCategory;

const CATEGORY_TABS: Array<{ value: ServiceCategoryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "graphic_design", label: SERVICE_CATEGORY_LABELS.graphic_design },
  { value: "ui_ux_design", label: SERVICE_CATEGORY_LABELS.ui_ux_design },
  { value: "illustrations", label: SERVICE_CATEGORY_LABELS.illustrations },
];

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
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategoryFilter>("all");

  const filteredServices = useMemo(
    () =>
      categoryFilter === "all"
        ? services
        : services.filter((service) => service.category === categoryFilter),
    [categoryFilter, services]
  );

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
    <main className="p-6 max-lg:w-full max-lg:overflow-hidden max-lg:p-4">
      <div className="mb-6 flex items-start justify-between gap-4 max-lg:mb-5 max-lg:w-full max-lg:max-w-[calc(100vw-48px)] max-lg:flex-col max-lg:gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight max-lg:text-[22px] max-lg:leading-7">Services</h1>
          <p className="text-muted-foreground max-lg:mt-1 max-lg:max-w-[24rem] max-lg:text-[13px] max-lg:leading-5">
            Create reusable services, sub-services, and pricing for projects.
          </p>
        </div>
        <Button
          onClick={() => openServiceDialog()}
          className="max-lg:h-9 max-lg:w-fit max-lg:self-start max-lg:px-3 max-lg:text-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Service
        </Button>
      </div>

      {!setupRequired && !isLoading && services.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 max-lg:mb-4 max-lg:w-full max-lg:max-w-[calc(100vw-48px)] max-lg:flex-col max-lg:items-stretch max-lg:gap-2 max-lg:overflow-hidden">
          <Tabs
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as ServiceCategoryFilter)}
            className="max-lg:w-full max-lg:min-w-0 max-lg:overflow-hidden"
          >
            <TabsList className="mobile-scroll max-w-full justify-start overflow-x-auto max-lg:flex max-lg:w-full max-lg:min-w-0 max-lg:px-1">
              {CATEGORY_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="max-lg:h-8 max-lg:shrink-0 max-lg:px-3 max-lg:text-[13px]">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="text-sm text-muted-foreground max-lg:text-[13px] max-lg:leading-5">
            {filteredServices.length} service{filteredServices.length === 1 ? "" : "s"}
          </p>
        </div>
      )}

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
      ) : filteredServices.length === 0 ? (
        <div className="rounded-md border border-dashed bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">No services in this category</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Switch tabs or add a new service for {CATEGORY_TABS.find((tab) => tab.value === categoryFilter)?.label}.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 max-lg:w-full max-lg:max-w-[calc(100vw-48px)] max-lg:min-w-0 max-lg:gap-3 max-lg:overflow-hidden">
          {filteredServices.map((service) => {
            const subServices = service.subServices || [];

            return (
              <article
                key={service.id}
                className="flex min-h-[260px] flex-col rounded-md border border-border-soft bg-card shadow-sm transition-colors hover:border-border max-lg:min-h-0 max-lg:w-full max-lg:min-w-0 max-lg:max-w-full max-lg:overflow-hidden"
              >
                <div className="flex flex-1 flex-col p-4 max-lg:p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {service.category && (
                        <div className="mb-2 max-lg:mb-1.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium max-lg:px-2 max-lg:text-[11px] ${CATEGORY_COLORS[service.category]}`}>
                            {SERVICE_CATEGORY_LABELS[service.category]}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="min-w-0 truncate text-lg font-semibold leading-7 max-lg:text-base max-lg:leading-6">
                          {service.name}
                        </h2>
                      </div>
                      <div className="mt-3 max-lg:mt-2">
                        <p className="text-lg font-semibold leading-7 text-foreground max-lg:text-base max-lg:leading-6">
                          {formatPrice(service.price, service.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="group relative h-8 w-8 max-lg:h-9 max-lg:w-9"
                        onClick={() => openSubServiceDialog(service.id)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-20 whitespace-nowrap rounded-md border border-border-soft bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                          Sub-service
                        </span>
                        <span className="sr-only">Add sub-service</span>
                      </Button>
                      <ServiceActionsMenu
                        service={service}
                        onEdit={openServiceDialog}
                        onDelete={deleteService}
                      />
                    </div>
                  </div>

                  {service.description ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground max-lg:mt-2 max-lg:text-[13px] max-lg:leading-5">
                      {service.description}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground/70 max-lg:mt-2 max-lg:text-[13px] max-lg:leading-5">
                      No description yet.
                    </p>
                  )}

                  <div className="mt-4 flex items-center border-t border-border-soft pt-4 max-lg:mt-3 max-lg:pt-3">
                    <span className="text-sm font-medium text-muted-foreground max-lg:text-[13px]">
                      {subServices.length} sub-service{subServices.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                {subServices.length > 0 && (
                  <div className="border-t border-border-soft bg-surface-2/60 p-3 dark:bg-surface-2">
                    <div className="space-y-2">
                      {subServices.map((subService) => (
                        <div
                          key={subService.id}
                          className="flex items-center justify-between gap-3 rounded-md border border-border-soft bg-card px-3 py-2"
                        >
                          <div className="min-w-0">
                            <span className="block min-w-0 truncate text-sm font-medium">{subService.name}</span>
                            <p className="mt-0.5 text-sm font-semibold text-foreground">
                              {formatPrice(subService.price, subService.currency)}
                            </p>
                            {subService.description && (
                              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                {subService.description}
                              </p>
                            )}
                          </div>
                          <SubServiceActionsMenu
                            serviceId={service.id}
                            subService={subService}
                            onEdit={openSubServiceDialog}
                            onDelete={deleteSubService}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
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

const ServiceActionsMenu = ({
  service,
  onEdit,
  onDelete,
}: {
  service: StudioService;
  onEdit: (service: StudioService) => void;
  onDelete: (serviceId: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Service actions</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44">
      <DropdownMenuItem onClick={() => onEdit(service)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit service
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={() => onDelete(service.id)}
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete service
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const SubServiceActionsMenu = ({
  serviceId,
  subService,
  onEdit,
  onDelete,
}: {
  serviceId: string;
  subService: StudioSubService;
  onEdit: (serviceId: string, subService: StudioSubService) => void;
  onDelete: (subServiceId: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Sub-service actions</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onClick={() => onEdit(serviceId, subService)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit sub-service
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={() => onDelete(subService.id)}
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete sub-service
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

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
