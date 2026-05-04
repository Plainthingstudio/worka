import React, { useCallback, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ChevronDown, ChevronRight, Minus, Package, Plus } from "lucide-react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectFormValues } from "./projectFormSchema";
import {
  Currency,
  ServiceCategory,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  StudioService,
  StudioSubService,
} from "@/types";
import { cn } from "@/lib/utils";

export type QuantityMap = Record<string, number>;

type GroupKey = ServiceCategory | "uncategorized";

const GROUP_ORDER: GroupKey[] = [
  "ui_ux_design",
  "graphic_design",
  "illustrations",
  "uncategorized",
];

interface ProjectServicesProps {
  form: UseFormReturn<ProjectFormValues>;
  services: StudioService[];
  serviceQuantities: QuantityMap;
  setServiceQuantities: React.Dispatch<React.SetStateAction<QuantityMap>>;
  subServiceQuantities: QuantityMap;
  setSubServiceQuantities: React.Dispatch<React.SetStateAction<QuantityMap>>;
  setupRequired?: boolean;
}

const formatPrice = (price: number, currency: Currency) =>
  `${price.toLocaleString()} ${currency}`;

const priceBadgeClass =
  "inline-flex shrink-0 items-center rounded-[10px] bg-transparent px-2 py-1 text-xs font-medium leading-4 tracking-normal text-[#0F172A] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.5)]";

const totalBadgeClass =
  "inline-flex items-center rounded-[10px] bg-[#F1F5F9] px-2 py-1 text-xs font-medium leading-4 text-[#0F172A] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.5)]";

/** Figma: 32×32 buttons, 7px radius; input 32h, slate bg, 10px radius; gap 4px */
const QtyStepper = ({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  ariaLabel: string;
}) => {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(value + 1);

  return (
    <div className="flex h-8 items-center gap-1" aria-label={ariaLabel}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 shrink-0 rounded-[7px] border-[#E2E8F0] bg-white",
          value <= 0 && "opacity-50"
        )}
        onClick={dec}
        disabled={value <= 0}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(0);
            return;
          }
          const parsed = parseInt(raw, 10);
          onChange(Number.isNaN(parsed) ? 0 : Math.max(0, parsed));
        }}
        className="h-8 w-14 shrink-0 rounded-[10px] border-[#E2E8F0] bg-[#F8FAFC] px-3 text-center text-sm font-normal tabular-nums leading-5 tracking-[-0.15px] text-[#020817]"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-[7px] border-[#E2E8F0] bg-white shadow-[0px_1px_2px_rgba(15,23,42,0.05)]"
        onClick={inc}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

function groupKeyForService(service: StudioService): GroupKey {
  if (
    service.category &&
    (SERVICE_CATEGORIES as readonly string[]).includes(service.category)
  ) {
    return service.category;
  }
  return "uncategorized";
}

function categoryHeaderIcon(groupKey: GroupKey) {
  if (groupKey === "illustrations") {
    return (
      <Package className="h-4 w-4 shrink-0 opacity-50 text-[#020817] -rotate-90" />
    );
  }
  return <Package className="h-4 w-4 shrink-0 opacity-50 text-[#020817]" />;
}

const ProjectServices = ({
  form,
  services,
  serviceQuantities,
  setServiceQuantities,
  subServiceQuantities,
  setSubServiceQuantities,
  setupRequired = false,
}: ProjectServicesProps) => {
  const currency = form.watch("currency");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<GroupKey>>(() => new Set());
  const [collapsedServiceCards, setCollapsedServiceCards] = useState<Set<string>>(
    () => new Set()
  );

  const toggleGroup = useCallback((key: GroupKey) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleServiceCard = useCallback((id: string) => {
    setCollapsedServiceCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const availableServices = useMemo(
    () => services.filter((service) => service.currency === currency),
    [services, currency]
  );

  const grouped = useMemo(() => {
    const map = new Map<GroupKey, StudioService[]>();
    for (const s of availableServices) {
      const k = groupKeyForService(s);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return GROUP_ORDER.filter((k) => (map.get(k)?.length ?? 0) > 0).map((key) => ({
      key,
      label:
        key === "uncategorized"
          ? "Other services"
          : SERVICE_CATEGORY_LABELS[key],
      services: map.get(key)!,
    }));
  }, [availableServices]);

  const selectedTotal = useMemo(() => {
    const serviceTotal = availableServices.reduce((sum, service) => {
      const qty = serviceQuantities[service.id] || 0;
      return sum + service.price * qty;
    }, 0);

    const subServiceTotal = availableServices
      .flatMap((service) => service.subServices || [])
      .filter((subService) => subService.currency === currency)
      .reduce((sum, subService) => {
        const qty = subServiceQuantities[subService.id] || 0;
        return sum + subService.price * qty;
      }, 0);

    return serviceTotal + subServiceTotal;
  }, [availableServices, serviceQuantities, subServiceQuantities, currency]);

  const setServiceQty = (id: string, next: number) => {
    setServiceQuantities((current) => {
      const updated = { ...current, [id]: next };
      if (next <= 0) delete updated[id];
      return updated;
    });
  };

  const setSubServiceQty = (id: string, next: number) => {
    setSubServiceQuantities((current) => {
      const updated = { ...current, [id]: next };
      if (next <= 0) delete updated[id];
      return updated;
    });
  };

  const renderSubRows = (
    service: StudioService,
    subServices: StudioSubService[]
  ) =>
    subServices.map((subService) => {
      const subQty = subServiceQuantities[subService.id] || 0;
      const subSubtotal = subService.price * subQty;

      return (
        <div
          key={subService.id}
          className="flex flex-col gap-2 border-t border-[#E2E8F0] pt-[13px] sm:flex-row sm:items-center sm:justify-between sm:gap-2"
        >
          <div className="min-w-0 flex-1 space-y-1 pl-0 sm:pl-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-medium tracking-[-0.3125px] text-[#020817]">
                {subService.name}
              </span>
              <span className={priceBadgeClass}>
                {formatPrice(subService.price, subService.currency)}
              </span>
            </div>
            {subService.description && (
              <p className="text-sm font-normal leading-5 tracking-[-0.15px] text-[#64748B]">
                {subService.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1 sm:w-[160px]">
            <QtyStepper
              value={subQty}
              onChange={(next) => setSubServiceQty(subService.id, next)}
              ariaLabel={`${subService.name} quantity`}
            />
            {subQty > 0 && (
              <span className="text-xs text-muted-foreground">
                Subtotal: {formatPrice(subSubtotal, subService.currency)}
              </span>
            )}
          </div>
        </div>
      );
    });

  return (
    <FormField
      control={form.control}
      name="serviceIds"
      render={() => (
        <FormItem className="flex w-full flex-col items-stretch gap-2">
          <div className="flex h-6 w-full flex-row items-center justify-between gap-2 pr-px">
            <FormLabel className="m-0 text-sm font-medium leading-[14px] tracking-[-0.15px] text-[#020817]">
              Project Services
            </FormLabel>
            <span className={totalBadgeClass}>
              Selected total: {formatPrice(selectedTotal, currency)}
            </span>
          </div>

          {setupRequired ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              Services database setup is required before services can be selected.
            </div>
          ) : availableServices.length === 0 ? (
            <div className="rounded-md border border-dashed border-[#E2E8F0] p-5 text-center text-sm text-muted-foreground">
              No services found for {currency}. Create services first or switch currency.
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2">
              {grouped.map(({ key: groupKey, label, services: groupServices }) => {
                const groupCollapsed = collapsedGroups.has(groupKey);
                return (
                  <div key={groupKey} className="flex w-full flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupKey)}
                      className="flex max-w-full flex-row items-center gap-1 rounded-md py-0.5 text-left outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {groupCollapsed ? (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      {categoryHeaderIcon(groupKey)}
                      <span className="text-xs font-medium leading-[14px] tracking-[-0.15px] text-[#020817]">
                        {label}
                      </span>
                    </button>

                    {!groupCollapsed && (
                      <div className="flex flex-col gap-2">
                        {groupServices.map((service) => {
                          const serviceQty = serviceQuantities[service.id] || 0;
                          const serviceSubtotal = service.price * serviceQty;
                          const subServices = (service.subServices || []).filter(
                            (item) => item.currency === currency
                          );
                          const cardCollapsed = collapsedServiceCards.has(service.id);

                          return (
                            <div
                              key={service.id}
                              className="flex w-full flex-col gap-3 rounded-[7px] border border-[#E2E8F0] bg-white p-3 shadow-[0px_1px_2px_rgba(15,23,42,0.05)]"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                <div className="min-w-0 flex-1 space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleServiceCard(service.id)}
                                    className="flex w-full max-w-full flex-wrap items-center gap-2 rounded-sm text-left outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    {cardCollapsed ? (
                                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    )}
                                    <span className="text-base font-medium tracking-[-0.3125px] text-[#020817]">
                                      {service.name}
                                    </span>
                                    <span className={priceBadgeClass}>
                                      {formatPrice(service.price, service.currency)}
                                    </span>
                                  </button>
                                  {!cardCollapsed && service.description && (
                                    <p className="text-sm font-normal leading-5 tracking-[-0.15px] text-[#64748B]">
                                      {service.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-1 sm:w-[160px]">
                                  <QtyStepper
                                    value={serviceQty}
                                    onChange={(next) => setServiceQty(service.id, next)}
                                    ariaLabel={`${service.name} quantity`}
                                  />
                                  {!cardCollapsed && serviceQty > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      Subtotal:{" "}
                                      {formatPrice(serviceSubtotal, service.currency)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {!cardCollapsed && subServices.length > 0 && (
                                <div className="flex flex-col gap-0">
                                  {renderSubRows(service, subServices)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProjectServices;
