import { api } from "../client";
import type { User } from "@/types";

export const updateProfile = (form: FormData) =>
  api.put<{ data: User }>("/profile", form).then((r) => r.data.data);
