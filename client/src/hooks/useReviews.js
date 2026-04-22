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

export function useAddReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData) => {
      const { data } = await axios.post("/api/reviews", reviewData);
      return data;
    },
    onSuccess: (data, variables) => {
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
