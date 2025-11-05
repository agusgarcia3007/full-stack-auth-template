import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  DataGrid,
  DataGridPagination,
  DataGridTable,
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  ScrollArea,
  ScrollBar,
} from "@/components/data-grid/crud";
import { useUsersList } from "@/services/users/queries";
import { columns } from "@/components/users-columns";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/admin/users")({
  component: RouteComponent,
});

function RouteComponent() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { t } = useTranslation();

  const { data } = useUsersList({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    columns,
    data: data?.data ?? [],
    pageCount: data?.pagination.totalPages ?? 0,
    getRowId: (row) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: "onChange",
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">{t("users.title")}</h1>

      <DataGrid
        table={table}
        recordCount={data?.pagination.total ?? 0}
        tableLayout={{
          columnsPinnable: true,
          columnsResizable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
      >
        <Card>
          <CardHeader className="py-4">
            <CardHeading>
              <div className="text-lg font-semibold">{t("users.title")}</div>
            </CardHeading>
          </CardHeader>
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>
    </div>
  );
}
