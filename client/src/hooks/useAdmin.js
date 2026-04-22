import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/stats");
      return data;
    },
  });
}

export function useRecentReviews() {
  return useQuery({
    queryKey: ["admin", "recentReviews"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/reviews/recent");
      return data;
    },
  });
}

export function useMonthlyReviews() {
  return useQuery({
    queryKey: ["admin", "monthlyReviews"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/reviews/monthly");
      return data;
    },
  });
}

export function useTopProducts() {
  return useQuery({
    queryKey: ["admin", "topProducts"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/products/top");
      return data;
    },
  });
}

export function useAllReviews() {
  return useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/reviews");
      return data;
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId) => {
      const { data } = await axios.delete(`/api/admin/reviews/${reviewId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["latestReviews"] });
    },
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await axios.post("/api/products", formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await axios.put(`/api/products/${id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId) => {
      await axios.delete(`/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useCategoryStats() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/categories");
      return data;
    },
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name) => {
      const { data } = await axios.post("/api/admin/categories", { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name) => {
      const { data } = await axios.delete(`/api/admin/categories/${encodeURIComponent(name)}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// --- Admin Users hooks ---

export function useUserStats() {
  return useQuery({
    queryKey: ["admin", "userStats"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/users/stats");
      return data;
    },
  });
}

export function useAllUsers(params = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/users", { params });
      return data;
    },
  });
}

export function useUserDetail(id) {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/admin/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await axios.delete(`/api/admin/users/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "userStats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// --- Admin Profile hooks ---

function getAuthHeaders() {
  const token = localStorage.getItem("spmart-admin-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/profile", {
        headers: getAuthHeaders(),
      });
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await axios.put("/api/admin/profile", formData, {
        headers: getAuthHeaders(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete("/api/admin/profile/avatar", {
        headers: getAuthHeaders(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings) => {
      const { data } = await axios.put("/api/admin/profile/settings", settings, {
        headers: getAuthHeaders(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const { data } = await axios.put(
        "/api/admin/profile/password",
        { currentPassword, newPassword },
        { headers: getAuthHeaders() }
      );
      return data;
    },
  });
}
