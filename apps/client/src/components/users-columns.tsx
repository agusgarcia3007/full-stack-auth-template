import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/services/users/service";
import { useTranslation } from "react-i18next";

function RoleCell({ role }: { role: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
        role === "admin"
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {t(`roles.${role}` as "roles.admin" | "roles.student")}
    </span>
  );
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <RoleCell role={role} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de creación",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
    ),
  },
];
