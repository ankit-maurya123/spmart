import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useReviews(productId) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/reviews/${productId}`);
      return data;
    },
    enabled: !!productId,
  });
}

// Submitting a review now requires an authenticated user. The mutation
// resolves to { review, message } and the review is created in 'pending'
// status — it won't show up in the public list until an admin approves it.
export function useAddReview(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData) => {
      const { data } = await axios.post("/api/reviews", reviewData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useLatestReviews() {
  return useQuery({
    queryKey: ["latestReviews"],
    queryFn: async () => {
      const { data } = await axios.get("/api/reviews/latest");
      return data;
    },
  });
}
