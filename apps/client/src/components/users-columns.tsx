import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/services/users/service";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  DataGridColumnHeader,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/data-grid/crud";
import { Button } from "@/components/ui/button";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/services/profile/queries";

function RoleCell({ role }: { role: string }) {
  const { t } = useTranslation();

  return (
    <Badge
      variant={role === "admin" ? "primary" : "secondary"}
      appearance="outline"
    >
      {t(`roles.${role}` as "roles.admin" | "roles.student")}
    </Badge>
  );
}

export const getColumns = (t: TFunction): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    id: "id",
    header: () => <DataGridTableRowSelectAll />,
    cell: ({ row }) => <DataGridTableRowSelect row={row} />,
    enableSorting: false,
    size: 35,
    enableResizing: false,
  },
  {
    accessorKey: "name",
    id: "name",
    header: ({ column }) => (
      <DataGridColumnHeader title={t("users.columns.name")} visibility={true} column={column} />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("name")}</div>
    ),
    size: 200,
    enableSorting: true,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: "email",
    id: "email",
    header: ({ column }) => (
      <DataGridColumnHeader title={t("users.columns.email")} visibility={true} column={column} />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("email")}</div>
    ),
    size: 250,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: "role",
    id: "role",
    header: ({ column }) => (
      <DataGridColumnHeader title={t("users.columns.role")} visibility={true} column={column} />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <RoleCell role={role} />;
    },
    size: 120,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: "createdAt",
    id: "createdAt",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={t("users.columns.createdAt")}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="text-foreground">
        {new Date(row.getValue("createdAt")).toLocaleString()}
      </div>
    ),
    size: 180,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: "updatedAt",
    id: "updatedAt",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={t("users.columns.updatedAt")}
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="text-foreground">
        {new Date(row.getValue("updatedAt")).toLocaleString()}
      </div>
    ),
    size: 180,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    id: "actions",
    header: t("users.columns.actions"),
    cell: ({ row }) => {
      const user = row.original;
      return <ActionsCell user={user} />;
    },
    size: 100,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
];

function ActionsCell({ user }: { user: User }) {
  const [openEdit, setOpenEdit] = useState(false);
  const { t } = useTranslation();
  const { data: profile } = useProfile();

  const isCurrentUser = profile?.id === user.id;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Pencil className="size-4" />
            {t("users.actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" disabled={isCurrentUser}>
            <Trash2 className="size-4" />
            {t("users.actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditUserDialog user={user} open={openEdit} onOpenChange={setOpenEdit} />
    </>
  );
}
