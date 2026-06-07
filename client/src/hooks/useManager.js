import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { managerHeaders } from "../lib/managerApi";

export function useManagerDashboard() {
  return useQuery({
    queryKey: ["manager", "dashboard"],
    queryFn: async () => {
      const { data } = await axios.get("/api/manager/dashboard", managerHeaders());
      return data;
    },
    staleTime: 1000 * 30,
  });
}

export function useManagerOrders(filters = {}) {
  return useQuery({
    queryKey: ["manager", "orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.payment && filters.payment !== "all") params.set("payment", filters.payment);
      const { data } = await axios.get(`/api/manager/orders?${params}`, managerHeaders());
      return data;
    },
  });
}

export function useManagerOrderStats() {
  return useQuery({
    queryKey: ["manager", "orders", "stats"],
    queryFn: async () => {
      const { data } = await axios.get("/api/manager/orders/stats", managerHeaders());
      return data;
    },
  });
}

export function useManagerUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await axios.put(
        `/api/manager/orders/${id}/status`,
        { status },
        managerHeaders()
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manager", "orders"] });
      qc.invalidateQueries({ queryKey: ["manager", "dashboard"] });
    },
  });
}

export function useManagerProducts(filters = {}) {
  return useQuery({
    queryKey: ["manager", "products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);
      if (filters.stock) params.set("stock", filters.stock);
      const { data } = await axios.get(`/api/manager/products?${params}`, managerHeaders());
      return data;
    },
  });
}

export function useManagerCategories() {
  return useQuery({
    queryKey: ["manager", "categories"],
    queryFn: async () => {
      const { data } = await axios.get("/api/manager/products/meta/categories", managerHeaders());
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Orders + sales stats for a single product. */
export function useManagerProductOrders(productId) {
  return useQuery({
    queryKey: ["manager", "product", productId, "orders"],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/manager/products/${productId}/orders`,
        managerHeaders()
      );
      return data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60,
  });
}
