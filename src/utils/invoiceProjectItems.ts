import { v4 as uuidv4 } from "uuid";
import { InvoiceItem, InvoiceType, Project, StudioService, StudioSubService } from "@/types";
import { buildPartialInvoiceItem } from "@/utils/invoiceTypes";

export function serviceCatalogSignature(services: StudioService[]): string {
  return services
    .map((s) => `${s.id}:${s.price}:${(s.subServices || []).map((ss) => `${ss.id}:${ss.price}`).join(",")}`)
    .join("|");
}

export function projectServiceCompositionKey(project: Project): string {
  const sid = (project.serviceIds || []).join(",");
  const sq = (project.serviceQuantities || []).join(",");
  const subid = (project.subServiceIds || []).join(",");
  const subq = (project.subServiceQuantities || []).join(",");
  return `${project.id}|${sid}|${sq}|${subid}|${subq}`;
}

/** Key for when to rebuild seeded line items from project + catalog (not just rescale). */
export function invoicePartialSeedCompositionKey(project: Project, services: StudioService[]): string {
  return `${projectServiceCompositionKey(project)}@@${serviceCatalogSignature(services)}`;
}

/**
 * Line items from the project's selected services / sub-services (same currency only).
 * Quantities come from parallel arrays on the project.
 */
export function buildInvoiceLineItemsFromProject(project: Project, services: StudioService[]): InvoiceItem[] {
  const currency = project.currency;
  const serviceById = new Map(services.map((s) => [s.id, s]));
  const items: InvoiceItem[] = [];

  const serviceIds = project.serviceIds || [];
  const serviceQuantities = project.serviceQuantities || [];

  for (let i = 0; i < serviceIds.length; i++) {
    const id = serviceIds[i];
    const svc = serviceById.get(id);
    if (!svc || svc.currency !== currency) continue;
    const qty = Number(serviceQuantities[i] ?? 1) || 0;
    if (qty <= 0) continue;
    const rate = Number(svc.price) || 0;
    items.push({
      id: uuidv4(),
      description: svc.name,
      quantity: qty,
      rate,
      amount: qty * rate,
    });
  }

  const subIds = project.subServiceIds || [];
  const subQty = project.subServiceQuantities || [];

  for (let i = 0; i < subIds.length; i++) {
    const id = subIds[i];
    let sub: StudioSubService | undefined;
    let parentName: string | undefined;
    for (const s of services) {
      sub = s.subServices?.find((x) => x.id === id);
      if (sub) {
        parentName = s.name;
        break;
      }
    }
    if (!sub || sub.currency !== currency) continue;
    const qty = Number(subQty[i] ?? 1) || 0;
    if (qty <= 0) continue;
    const rate = Number(sub.price) || 0;
    const description = parentName ? `${parentName} — ${sub.name}` : sub.name;
    items.push({
      id: uuidv4(),
      description,
      quantity: qty,
      rate,
      amount: qty * rate,
    });
  }

  return items;
}

export function buildPartialInvoiceItemsFromProject(params: {
  project: Project;
  services: StudioService[];
  invoiceType: InvoiceType;
  /** Used only when the project has no billable catalog lines (placeholder row). */
  targetTotal: number;
}): InvoiceItem[] {
  const { project, services, invoiceType, targetTotal } = params;
  const catalogLines = buildInvoiceLineItemsFromProject(project, services);
  if (catalogLines.length === 0) {
    return [buildPartialInvoiceItem(invoiceType, targetTotal, undefined)];
  }
  return catalogLines;
}
