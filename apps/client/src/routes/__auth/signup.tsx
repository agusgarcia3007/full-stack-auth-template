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
import { useSignupMutation } from "@/services/auth/mutations";

export const Route = createFileRoute("/__auth/signup")({
  component: RouteComponent,
});

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
};

function RouteComponent() {
  const { t } = useTranslation();
  const { mutate, isPending } = useSignupMutation();

  const signupSchema = z.object({
    name: z.string().min(1, { message: t("auth.validation.nameRequired") }),
    email: z.email({ message: t("auth.validation.emailInvalid") }),
    password: z.string().min(8, { message: t("auth.validation.passwordMin8") }),
  });

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t("auth.signup.title")}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t("auth.signup.subtitle")}
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.name")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.signup.namePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("common.emailPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.password")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" isLoading={isPending}>
            {t("auth.signup.submit")}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("auth.signup.haveAccount")}{" "}
          <Link to="/login" className="underline underline-offset-4">
            {t("auth.signup.loginLink")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
