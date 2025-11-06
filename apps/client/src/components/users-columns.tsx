import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/services/users/service";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { DataGridColumnHeader, DataGridTableRowSelect, DataGridTableRowSelectAll } from "@/components/data-grid/crud";
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

export const columns: ColumnDef<User>[] = [
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
      <DataGridColumnHeader
        title="Nombre"
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.getValue("name")}
      </div>
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
      <DataGridColumnHeader
        title="Email"
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue("email")}
      </div>
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
      <DataGridColumnHeader
        title="Rol"
        visibility={true}
        column={column}
      />
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
        title="Fecha de creación"
        visibility={true}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="text-foreground">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
    size: 150,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    id: "actions",
    header: "Acciones",
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
            <Pencil className="size-4 mr-2" />
            {t("users.actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="size-4 mr-2" />
            {t("users.actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditUserDialog user={user} open={openEdit} onOpenChange={setOpenEdit} />
    </>
  );
}
