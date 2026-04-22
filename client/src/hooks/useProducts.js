import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await axios.get("/api/products", { params });
      return data;
    },
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useRelatedProducts(category, excludeId) {
  const { data: allProducts, ...rest } = useProducts();
  const related = allProducts
    ?.filter((p) => p.category === category && p._id !== excludeId)
    .slice(0, 4);
  return { data: related, ...rest };
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get("/api/products/categories");
      return data;
    },
  });
}
