import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authHeaders } from "../lib/api";

const KEY = ["addresses"];

export function useAddresses() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await axios.get("/api/user/addresses", authHeaders());
      return data.addresses || [];
    },
  });
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axios.post("/api/user/addresses", payload, authHeaders());
      return data.addresses;
    },
    onSuccess: (addresses) => qc.setQueryData(KEY, addresses),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await axios.put(`/api/user/addresses/${id}`, payload, authHeaders());
      return data.addresses;
    },
    onSuccess: (addresses) => qc.setQueryData(KEY, addresses),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.delete(`/api/user/addresses/${id}`, authHeaders());
      return data.addresses;
    },
    onSuccess: (addresses) => qc.setQueryData(KEY, addresses),
  });
}
