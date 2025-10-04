import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  DataTable,
  DataTableToolbar,
  DataTableContent,
  DataTablePagination,
} from "@/components/data-table";
import { DataTableFilters, type FilterDef } from "@/components/data-table/filters";
import { useUsersList } from "@/services/users/queries";
import { columns } from "@/components/users-columns";
import type {
  PaginationState,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export const Route = createFileRoute("/admin/users")({
  component: RouteComponent,
});

function UsersToolbar() {
  const { t } = useTranslation();

  const filters: FilterDef[] = [
    {
      id: "name",
      label: t("users.filters.name"),
      type: "text",
      placeholder: t("users.filters.namePlaceholder"),
    },
    {
      id: "email",
      label: t("users.filters.email"),
      type: "text",
      placeholder: t("users.filters.emailPlaceholder"),
    },
    {
      id: "role",
      label: t("users.filters.role"),
      type: "select",
      placeholder: t("users.filters.rolePlaceholder"),
      options: [
        { label: t("roles.admin"), value: "admin" },
        { label: t("roles.student"), value: "student" },
      ],
    },
  ];

  return <DataTableFilters filters={filters} />;
}

function RouteComponent() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);

  const { t } = useTranslation();

  const apiFilters = useMemo(() => {
    const result: Record<string, string> = {};
    filters.forEach((f) => {
      result[f.id] = Array.isArray(f.value) ? f.value.join(',') : String(f.value);
    });
    return result;
  }, [filters]);

  const { data, isLoading } = useUsersList({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
    filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">{t("users.title")}</h1>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.pagination.totalPages ?? 0}
        pagination={pagination}
        sorting={sorting}
        filters={filters}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onFiltersChange={setFilters}
        isLoading={isLoading}
      >
        <DataTableToolbar>
          <UsersToolbar />
        </DataTableToolbar>

        <DataTableContent
          columns={columns}
          pagination={pagination}
          isLoading={isLoading}
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>{t("users.empty.title")}</EmptyTitle>
              <EmptyDescription>
                {t("users.empty.description")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </DataTableContent>

        <DataTablePagination
          pageCount={data?.pagination.totalPages ?? 0}
          pagination={pagination}
        />
      </DataTable>
    </div>
  );
}
