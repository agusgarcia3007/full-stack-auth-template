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
import { useForgotPasswordMutation } from "@/services/auth/mutations";

export const Route = createFileRoute("/__auth/forgot-password")({
  component: RouteComponent,
});

type ForgotPasswordFormValues = {
  email: string;
};

function RouteComponent() {
  const { t } = useTranslation();
  const { mutate, isPending } = useForgotPasswordMutation();

  const forgotPasswordSchema = z.object({
    email: z.string().email({ message: t("auth.validation.emailInvalid") }),
  });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t("auth.forgotPassword.title")}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t("auth.forgotPassword.subtitle")}
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.forgotPassword.email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("common.emailPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" isLoading={isPending}>
            {t("auth.forgotPassword.submit")}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("auth.forgotPassword.rememberPassword")}{" "}
          <Link to="/login" className="underline underline-offset-4">
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
