import * as React from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateUser } from "@/services/users/mutations";
import type { User } from "@/services/users/service";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DrawerClose } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

const updateUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(["admin", "student"]),
  password: z.string().optional(),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const updateUser = useUpdateUser();

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      });
    }
  }, [open, user, form]);

  const onSubmit = async (data: UpdateUserFormValues) => {
    try {
      const updateData: {
        name: string;
        email: string;
        role: "admin" | "student";
        password?: string;
      } = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      await updateUser.mutateAsync({
        id: user.id,
        input: updateData,
      });

      toast.success(t("users.edit.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("users.edit.error"));
    }
  };

  const footer = isMobile ? (
    <>
      <Button
        type="submit"
        onClick={form.handleSubmit(onSubmit)}
        disabled={updateUser.isPending}
      >
        {updateUser.isPending ? t("users.edit.saving") : t("users.edit.save")}
      </Button>
      <DrawerClose asChild>
        <Button variant="outline">{t("users.edit.cancel")}</Button>
      </DrawerClose>
    </>
  ) : undefined;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("users.edit.title")}
      description={t("users.edit.description")}
      footer={footer}
      contentClassName="sm:max-w-[425px]"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.edit.fields.name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>{t("users.edit.fields.email")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.edit.fields.role")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                    <SelectItem value="student">
                      {t("roles.student")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("users.edit.fields.password")}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isMobile && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("users.edit.cancel")}
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending
                  ? t("users.edit.saving")
                  : t("users.edit.save")}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
