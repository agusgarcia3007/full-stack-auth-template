import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
import { getColumns } from "@/components/users-columns";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnPinningState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Filters, type Filter } from "@/components/ui/filters";
import { useUsersFilterFields } from "@/components/users-filters-config";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { FunnelPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/users")({
  component: RouteComponent,
});

function RouteComponent() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ["actions"],
  });
  const [filters, setFilters] = useState<Filter[]>([]);
  const [debouncedFilters, setDebouncedFilters] = useState<Filter[]>([]);

  const { t } = useTranslation();
  const filterFields = useUsersFilterFields();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const apiFilters = useMemo(() => {
    return debouncedFilters.reduce((acc, filter) => {
      if (filter.values.length === 0) return acc;

      const key = `${filter.field}[${filter.operator}]`;
      acc[key] = filter.values.join(",");
      return acc;
    }, {} as Record<string, string>);
  }, [debouncedFilters]);

  const { data, isLoading, isPending } = useUsersList({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
    filters: apiFilters,
  });

  const columns = getColumns(t);

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
      columnPinning,
    },
    columnResizeMode: "onChange",
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
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

      <Filters
        radius="full"
        filters={filters}
        fields={filterFields}
        onChange={setFilters}
        addButton={
          <Button size="icon" variant="outline">
            <FunnelPlus />
          </Button>
        }
        i18n={{
          addFilter: t("filters.addFilter"),
          searchFields: t("filters.searchFields"),
          noFieldsFound: t("filters.noFieldsFound"),
          noResultsFound: t("filters.noResultsFound"),
          select: t("filters.select"),
          true: t("filters.true"),
          false: t("filters.false"),
          operators: {
            is: t("filters.operators.is"),
            isNot: t("filters.operators.isNot"),
            isAnyOf: t("filters.operators.isAnyOf"),
            isNotAnyOf: t("filters.operators.isNotAnyOf"),
            contains: t("filters.operators.contains"),
            notContains: t("filters.operators.notContains"),
            startsWith: t("filters.operators.startsWith"),
            endsWith: t("filters.operators.endsWith"),
            before: t("filters.operators.before"),
            after: t("filters.operators.after"),
            between: t("filters.operators.between"),
            empty: t("filters.operators.empty"),
            notEmpty: t("filters.operators.notEmpty"),
            equals: t("filters.operators.equals"),
            notEquals: t("filters.operators.notEquals"),
            greaterThan: t("filters.operators.greaterThan"),
            lessThan: t("filters.operators.lessThan"),
            isExactly: t("filters.operators.isExactly"),
            includesAll: t("filters.operators.includesAll"),
            excludesAll: t("filters.operators.excludesAll"),
            notBetween: t("filters.operators.notBetween"),
            overlaps: t("filters.operators.overlaps"),
            includes: t("filters.operators.includes"),
            excludes: t("filters.operators.excludes"),
            includesAllOf: t("filters.operators.includesAllOf"),
            includesAnyOf: t("filters.operators.includesAnyOf"),
          },
          placeholders: {
            enterField: (fieldType: string) =>
              t("filters.placeholders.enterField", { fieldType }),
            selectField: t("filters.placeholders.selectField"),
            searchField: (fieldName: string) =>
              t("filters.placeholders.searchField", { fieldName }),
            enterKey: t("filters.placeholders.enterKey"),
            enterValue: t("filters.placeholders.enterValue"),
          },
          validation: {
            invalidEmail: t("filters.validation.invalidEmail"),
            invalidUrl: t("filters.validation.invalidUrl"),
            invalidTel: t("filters.validation.invalidTel"),
            invalid: t("filters.validation.invalid"),
          },
        }}
      />

      <DataGrid
        table={table}
        recordCount={data?.pagination.total ?? 0}
        isLoading={isLoading || isPending}
        loadingMode="skeleton"
        emptyMessage={
          <Empty className="border-0">
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
        }
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
