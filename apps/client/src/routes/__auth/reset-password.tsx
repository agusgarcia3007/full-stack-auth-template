import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResetPasswordMutation } from "@/services/auth/mutations";

export const Route = createFileRoute("/__auth/reset-password")({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string(),
  }),
});

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

function RouteComponent() {
  const { token } = Route.useSearch();
  const { t } = useTranslation();
  const { mutate, isPending } = useResetPasswordMutation();

  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, { message: t("auth.validation.passwordMin8") }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    mutate({ token, password: data.password });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t("auth.resetPassword.title")}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t("auth.resetPassword.subtitle")}
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.resetPassword.newPassword")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.resetPassword.confirmPassword")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" isLoading={isPending}>
            {t("auth.resetPassword.submit")}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("auth.resetPassword.rememberPassword")}{" "}
          <Link to="/login" className="underline underline-offset-4">
            {t("auth.resetPassword.backToLogin")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
