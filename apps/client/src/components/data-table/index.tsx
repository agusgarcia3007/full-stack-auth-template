import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
  type Table as TableType,
  type Header,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo, createContext, useContext } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableContextValue<TData> {
  table: TableType<TData>;
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

function useDataTable<TData>() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("DataTable compound components must be used within DataTable");
  }
  return context as DataTableContextValue<TData>;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  sorting: SortingState;
  filters: ColumnFiltersState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
  onFiltersChange: OnChangeFn<ColumnFiltersState>;
  isLoading?: boolean;
  isSelectable?: boolean;
  children: React.ReactNode;
}

function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  sorting,
  filters,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  isLoading = false,
  isSelectable = false,
  children,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const tableColumns = useMemo(() => {
    if (!isSelectable) return columns;

    const checkboxColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todas"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [checkboxColumn, ...columns];
  }, [columns, isSelectable]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters: filters,
      rowSelection,
    },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange: onFiltersChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableSortingRemoval: false,
    enableRowSelection: isSelectable,
  });

  return (
    <DataTableContext.Provider value={{ table }}>
      <div className="space-y-4">{children}</div>
    </DataTableContext.Provider>
  );
}

function DataTableToolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between">{children}</div>;
}

interface DataTableContentProps<TData> {
  columns: ColumnDef<TData, any>[];
  pagination: PaginationState;
  isLoading?: boolean;
}

interface DataTableContentContextValue {
  emptyContent?: React.ReactNode;
}

const DataTableContentContext = createContext<DataTableContentContextValue>({});

function DataTableContent<TData>({
  columns,
  pagination,
  isLoading = false,
  children,
}: DataTableContentProps<TData> & { children?: React.ReactNode }) {
  const { table } = useDataTable<TData>();
  const [emptyContent, setEmptyContent] = useState<React.ReactNode>(null);

  const renderHeader = (header: Header<TData, unknown>) => {
    if (header.isPlaceholder) return null;

    const canSort = header.column.getCanSort();
    const isSorted = header.column.getIsSorted();

    if (!canSort) {
      return flexRender(header.column.columnDef.header, header.getContext());
    }

    return (
      <Button
        variant="ghost"
        onClick={() => header.column.toggleSorting(isSorted === "asc")}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {isSorted === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : isSorted === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    );
  };

  const hasRows = table.getRowModel().rows?.length > 0;

  return (
    <DataTableContentContext.Provider value={{ emptyContent }}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{renderHeader(header)}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : hasRows ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-auto p-0">
                  {children}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DataTableContentContext.Provider>
  );
}

function DataTableEmpty({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface DataTablePaginationProps {
  pageCount: number;
  pagination: PaginationState;
}

function DataTablePagination({
  pageCount,
  pagination,
}: DataTablePaginationProps) {
  const { table } = useDataTable();

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Página {pagination.pageIndex + 1} de {pageCount}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filas por página</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export {
  DataTable,
  useDataTable,
};

export {
  DataTableToolbar,
  DataTableContent,
  DataTableEmpty as DataTableEmptyState,
  DataTablePagination,
};
