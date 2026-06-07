import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authHeaders } from "../lib/api";

/** All orders for the logged-in user (newest first). */
export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user/orders", authHeaders());
      return data;
    },
  });
}

/** Single order — public endpoint, by orderNumber (e.g. "SPM-001234"). */
export function useOrder(orderNumber) {
  return useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const { data } = await axios.get(`/api/orders/${orderNumber}`);
      return data;
    },
    enabled: !!orderNumber,
  });
}

/** Cancel the user's own order (pending/confirmed only). */
export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderNumber, reason }) => {
      const { data } = await axios.post(
        `/api/user/orders/${orderNumber}/cancel`,
        { reason },
        authHeaders()
      );
      return data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["order", updated.orderNumber], updated);
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}
