import { type FilterFieldConfig } from "@/components/ui/filters";
import { useTranslation } from "react-i18next";
import { User, Mail, Shield, Calendar } from "lucide-react";

export function useUsersFilterFields(): FilterFieldConfig[] {
  const { t } = useTranslation();

  return [
    {
      key: "name",
      label: t("users.filters.name"),
      icon: <User className="size-4" />,
      type: "text",
      placeholder: t("users.filters.namePlaceholder"),
      defaultOperator: "contains",
    },
    {
      key: "email",
      label: t("users.filters.email"),
      icon: <Mail className="size-4" />,
      type: "email",
      placeholder: t("users.filters.emailPlaceholder"),
      defaultOperator: "contains",
    },
    {
      key: "role",
      label: t("users.filters.role"),
      icon: <Shield className="size-4" />,
      type: "select",
      options: [
        { value: "admin", label: t("roles.admin") },
        { value: "student", label: t("roles.student") },
      ],
      defaultOperator: "is",
    },
    {
      key: "createdAt",
      label: t("users.columns.createdAt"),
      icon: <Calendar className="size-4" />,
      type: "daterange",
      defaultOperator: "between",
    },
  ];
}
