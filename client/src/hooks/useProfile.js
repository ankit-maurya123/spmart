import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { authHeaders } from "../lib/api";
import { useUserAuth } from "../context/UserAuthContext";

/** PUT /api/user/profile — name, phone, gender, dob, avatar, notifications */
export function useUpdateProfile() {
  const { updateUser } = useUserAuth();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axios.put("/api/user/profile", payload, authHeaders());
      return data.user;
    },
    onSuccess: (user) => {
      if (user) updateUser(user);
    },
  });
}

/** POST /api/user/change-password */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const { data } = await axios.post(
        "/api/user/change-password",
        { currentPassword, newPassword },
        authHeaders()
      );
      return data;
    },
  });
}
