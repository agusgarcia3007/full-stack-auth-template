import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { saveTokens } from "@/lib/auth";
import { AuthService } from "./service";

export function useLoginMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthService.login(email, password),
    onSuccess: (data) => {
      saveTokens(data.accessToken, data.refreshToken);
      navigate({ to: "/" });
    },
    onError: catchAxiosError,
  });
}

export function useSignupMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => AuthService.signup(name, email, password),
    onSuccess: (data) => {
      saveTokens(data.accessToken, data.refreshToken);
      navigate({ to: "/" });
    },
    onError: catchAxiosError,
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      AuthService.forgotPassword(email),
    onError: catchAxiosError,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      AuthService.resetPassword(token, password),
    onError: catchAxiosError,
  });
}
