import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authHeaders } from "../lib/api";
import { useUserAuth } from "../context/UserAuthContext";

const KEY = ["wishlist"];

/** Returns the populated wishlist products for the logged-in user. */
export function useWishlist() {
  const { user } = useUserAuth();
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await axios.get("/api/user/wishlist", authHeaders());
      return data.products || [];
    },
    enabled: !!user,
  });
}

/** Toggle a product in the wishlist. Returns { added, wishlist }. */
export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId) => {
      const { data } = await axios.post(
        `/api/user/wishlist/${productId}`,
        {},
        authHeaders()
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

/**
 * Check whether a productId is in the user's wishlist.
 * Reads the cached wishlist (from useWishlist) without re-fetching.
 */
export function useIsWishlisted(productId) {
  const qc = useQueryClient();
  const list = qc.getQueryData(KEY) || [];
  return list.some((p) => (p?._id || p) === productId);
}
