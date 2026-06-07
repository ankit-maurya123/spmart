import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authHeaders } from "../lib/api";

const KEY = ["wallet"];

/** Balance + transaction list (newest first). */
export function useWallet() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await axios.get("/api/user/wallet", authHeaders());
      return data; // { balance, transactions }
    },
    staleTime: 1000 * 30,
  });
}

/** Add money to wallet — simulated payment success. */
export function useAddMoney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, method }) => {
      const { data } = await axios.post(
        "/api/user/wallet/topup",
        { amount, method },
        authHeaders()
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
    },
  });
}
