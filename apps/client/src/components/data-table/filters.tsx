import { useState, useMemo } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { useTranslation } from "react-i18next";
import { useQueryStates, parseAsString } from "nuqs";
import { useDataTable } from "./index";

export type FilterType = "text" | "select";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  id: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
}

export interface DataTableFiltersProps {
  filters: FilterDef[];
  title?: string;
}

export function DataTableFilters({ filters, title }: DataTableFiltersProps) {
  const { t } = useTranslation();
  const { table } = useDataTable();
  const activeFiltersCount = table.getState().columnFilters.length;

  const urlParamsConfig = useMemo(() => {
    const config: Record<string, typeof parseAsString> = {};
    filters.forEach((filter) => {
      config[filter.id] = parseAsString;
    });
    return config;
  }, [filters]);

  const [urlParams, setUrlParams] = useQueryStates(urlParamsConfig);

  const [pendingFilters, setPendingFilters] = useState<
    Record<string, string | undefined>
  >({});

  const filterTitle = title || t("dataTable.filters");

  const getFilterValue = (columnId: string): string => {
    return (
      pendingFilters[columnId] ??
      (table.getColumn(columnId)?.getFilterValue() as string) ??
      ""
    );
  };

  const applyFilters = () => {
    const newUrlParams: Record<string, string | null> = {};

    Object.entries(pendingFilters).forEach(([columnId, value]) => {
      if (value === "" || value === undefined || value === " ") {
        table.getColumn(columnId)?.setFilterValue(undefined);
        newUrlParams[columnId] = null;
      } else {
        table.getColumn(columnId)?.setFilterValue(value);
        newUrlParams[columnId] = value;
      }
    });

    setUrlParams(newUrlParams);
    setPendingFilters({});
  };

  const clearFilters = () => {
    table.resetColumnFilters();
    setPendingFilters({});

    const clearParams: Record<string, null> = {};
    filters.forEach((filter) => {
      clearParams[filter.id] = null;
    });
    setUrlParams(clearParams);
  };

  const renderFilter = (filter: FilterDef) => {
    if (!table.getColumn(filter.id)) return null;

    switch (filter.type) {
      case "text":
        return (
          <Field key={filter.id}>
            <FieldLabel htmlFor={`filter-${filter.id}`}>
              {filter.label}
            </FieldLabel>
            <Input
              id={`filter-${filter.id}`}
              placeholder={filter.placeholder}
              value={getFilterValue(filter.id)}
              onChange={(event) =>
                setPendingFilters({
                  ...pendingFilters,
                  [filter.id]: event.target.value,
                })
              }
            />
          </Field>
        );

      case "select":
        return (
          <Field key={filter.id}>
            <FieldLabel htmlFor={`filter-${filter.id}`}>
              {filter.label}
            </FieldLabel>
            <Select
              value={getFilterValue(filter.id)}
              onValueChange={(value) =>
                setPendingFilters({
                  ...pendingFilters,
                  [filter.id]: value || undefined,
                })
              }
            >
              <SelectTrigger id={`filter-${filter.id}`} className="w-full">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        );

      default:
        return null;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          {filterTitle}
          {activeFiltersCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <FieldGroup className="gap-2">
          <h4 className="font-medium leading-none">{filterTitle}</h4>

          {filters.map(renderFilter)}

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={applyFilters}
              className="flex-1"
              disabled={Object.keys(pendingFilters).length === 0}
            >
              {t("dataTable.actions.apply")}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex-1"
              >
                {t("dataTable.actions.clear")}
              </Button>
            )}
          </div>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}
