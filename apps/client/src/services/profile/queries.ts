import { useQuery } from "@tanstack/react-query";
import { profileOptions } from "./options";

export function useProfile() {
  return useQuery(profileOptions.get());
}
