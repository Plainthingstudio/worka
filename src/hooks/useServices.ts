import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { account, client, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";
import { Currency, ServiceCategory, SERVICE_CATEGORIES, StudioService, StudioSubService } from "@/types";

const LEGACY_SERVICE_CATEGORY: Record<string, ServiceCategory> = {
  "UI/UX Design": "ui_ux_design",
  "Graphic Design": "graphic_design",
  Illustrations: "illustrations",
};

const normalizeServiceCategory = (raw: unknown): ServiceCategory | undefined => {
  if (raw == null || raw === "") return undefined;
  const s = String(raw);
  if ((SERVICE_CATEGORIES as readonly string[]).includes(s)) return s as ServiceCategory;
  return LEGACY_SERVICE_CATEGORY[s];
};

type ServiceInput = {
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  category?: ServiceCategory;
};

type SubServiceInput = ServiceInput & {
  serviceId: string;
};

type ServiceDocument = {
  $id: string;
  $createdAt: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  category?: ServiceCategory;
};

type SubServiceDocument = ServiceDocument & {
  service_id: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || "");

const mapService = (doc: ServiceDocument): StudioService => ({
  id: doc.$id,
  name: doc.name,
  description: doc.description || "",
  price: Number(doc.price) || 0,
  currency: doc.currency as Currency,
  category: normalizeServiceCategory(doc.category),
  createdAt: new Date(doc.$createdAt),
});

const mapSubService = (doc: SubServiceDocument): StudioSubService => ({
  id: doc.$id,
  serviceId: doc.service_id,
  name: doc.name,
  description: doc.description || "",
  price: Number(doc.price) || 0,
  currency: doc.currency as Currency,
  createdAt: new Date(doc.$createdAt),
});

const isMissingCollection = (error: unknown) => {
  const message = getErrorMessage(error);
  return message.includes("Collection with the requested ID could not be found");
};

export const servicesQueryKey = ["services"] as const;

const fetchServices = async (): Promise<StudioService[]> => {
  const [servicesResponse, subServicesResponse] = await Promise.all([
    databases.listDocuments(DATABASE_ID, "services", [Query.orderAsc("name")]),
    databases.listDocuments(DATABASE_ID, "sub_services", [Query.orderAsc("name")]),
  ]);

  const subServicesByService = new Map<string, StudioSubService[]>();
  (subServicesResponse.documents as unknown as SubServiceDocument[]).map(mapSubService).forEach((subService) => {
    const current = subServicesByService.get(subService.serviceId) || [];
    subServicesByService.set(subService.serviceId, [...current, subService]);
  });

  return (servicesResponse.documents as unknown as ServiceDocument[]).map((doc) => {
    const service = mapService(doc);
    return {
      ...service,
      subServices: subServicesByService.get(service.id) || [],
    };
  });
};

export const useServices = () => {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: servicesQueryKey,
    queryFn: fetchServices,
    retry: (failureCount, queryError) => !isMissingCollection(queryError) && failureCount < 1,
  });
  const setupRequired = isMissingCollection(error);

  useEffect(() => {
    const channels = [
      `databases.${DATABASE_ID}.collections.services.documents`,
      `databases.${DATABASE_ID}.collections.sub_services.documents`,
    ];

    const unsubscribe = client.subscribe(channels, () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    });

    return () => unsubscribe();
  }, [queryClient]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: servicesQueryKey });

  const addService = async (data: ServiceInput) => {
    try {
      const user = await account.get();
      await databases.createDocument(DATABASE_ID, "services", ID.unique(), {
        name: data.name,
        description: data.description || "",
        price: data.price,
        currency: data.currency,
        category: data.category || null,
        user_id: user.$id,
      });
      toast.success("Service created successfully");
      invalidate();
      return true;
    } catch (error: unknown) {
      console.error("Error creating service:", error);
      toast.error(
        isMissingCollection(error)
          ? "Services database is not set up yet. Run the Appwrite bootstrap script first."
          : getErrorMessage(error) || "Failed to create service"
      );
      return false;
    }
  };

  const updateService = async (serviceId: string, data: ServiceInput) => {
    try {
      await databases.updateDocument(DATABASE_ID, "services", serviceId, {
        name: data.name,
        description: data.description || "",
        price: data.price,
        currency: data.currency,
        category: data.category || null,
      });
      toast.success("Service updated successfully");
      invalidate();
      return true;
    } catch (error: unknown) {
      console.error("Error updating service:", error);
      toast.error(getErrorMessage(error) || "Failed to update service");
      return false;
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const service = services.find((item) => item.id === serviceId);
      await Promise.all(
        (service?.subServices || []).map((subService) =>
          databases.deleteDocument(DATABASE_ID, "sub_services", subService.id)
        )
      );
      await databases.deleteDocument(DATABASE_ID, "services", serviceId);
      toast.success("Service deleted successfully");
      invalidate();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting service:", error);
      toast.error(getErrorMessage(error) || "Failed to delete service");
      return false;
    }
  };

  const addSubService = async (data: SubServiceInput) => {
    try {
      const user = await account.get();
      await databases.createDocument(DATABASE_ID, "sub_services", ID.unique(), {
        service_id: data.serviceId,
        name: data.name,
        description: data.description || "",
        price: data.price,
        currency: data.currency,
        user_id: user.$id,
      });
      toast.success("Sub-service created successfully");
      invalidate();
      return true;
    } catch (error: unknown) {
      console.error("Error creating sub-service:", error);
      toast.error(
        isMissingCollection(error)
          ? "Services database is not set up yet. Run the Appwrite bootstrap script first."
          : getErrorMessage(error) || "Failed to create sub-service"
      );
      return false;
    }
  };

  const updateSubService = async (subServiceId: string, data: SubServiceInput) => {
    try {
      await databases.updateDocument(DATABASE_ID, "sub_services", subServiceId, {
        service_id: data.serviceId,
        name: data.name,
        description: data.description || "",
        price: data.price,
        currency: data.currency,
      });
      toast.success("Sub-service updated successfully");
      invalidate();
      return true;
    } catch (error: unknown) {
      console.error("Error updating sub-service:", error);
      toast.error(getErrorMessage(error) || "Failed to update sub-service");
      return false;
    }
  };

  const deleteSubService = async (subServiceId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, "sub_services", subServiceId);
      toast.success("Sub-service deleted successfully");
      invalidate();
      return true;
    } catch (error: unknown) {
      console.error("Error deleting sub-service:", error);
      toast.error(getErrorMessage(error) || "Failed to delete sub-service");
      return false;
    }
  };

  return {
    services,
    isLoading,
    setupRequired,
    addService,
    updateService,
    deleteService,
    addSubService,
    updateSubService,
    deleteSubService,
  };
};
