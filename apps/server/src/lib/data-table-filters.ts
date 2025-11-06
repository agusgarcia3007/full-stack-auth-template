import { SQL, and, ilike, eq, ne, gt, lt, gte, lte, isNull, isNotNull, inArray, notInArray } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export function buildFilterCondition(
  value: string,
  column: PgColumn,
  operator: string = "contains"
): SQL | undefined {
  if (!value && operator !== "empty" && operator !== "not_empty") return undefined;

  const columnType = column.getSQLType();
  const isTextField = columnType.includes('varchar') || columnType.includes('text');
  const isDateField = columnType.includes('timestamp') || columnType.includes('date');
  const isBooleanField = columnType.includes('boolean');

  if (operator === "empty") {
    return isNull(column);
  }

  if (operator === "not_empty") {
    return isNotNull(column);
  }

  if (isTextField) {
    switch (operator) {
      case "contains":
        return ilike(column, `%${value}%`);
      case "not_contains":
        return ne(column, ilike(column, `%${value}%`));
      case "starts_with":
        return ilike(column, `${value}%`);
      case "ends_with":
        return ilike(column, `%${value}`);
      case "is":
      case "is_exactly":
        return eq(column, value);
      case "is_not":
        return ne(column, value);
      default:
        return ilike(column, `%${value}%`);
    }
  }

  if (isDateField) {
    const dateValue = new Date(value);
    switch (operator) {
      case "before": {
        const endOfDay = new Date(dateValue);
        endOfDay.setHours(23, 59, 59, 999);
        return lte(column, endOfDay);
      }
      case "after": {
        const startOfDay = new Date(dateValue);
        startOfDay.setHours(0, 0, 0, 0);
        return gte(column, startOfDay);
      }
      case "is": {
        const startOfDay = new Date(dateValue);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateValue);
        endOfDay.setHours(23, 59, 59, 999);
        return and(gte(column, startOfDay), lte(column, endOfDay));
      }
      case "is_not": {
        const startOfDay = new Date(dateValue);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateValue);
        endOfDay.setHours(23, 59, 59, 999);
        return ne(column, and(gte(column, startOfDay), lte(column, endOfDay)) as any);
      }
      case "between": {
        const [start, end] = value.split(",");
        if (start && end) {
          const startDate = new Date(start);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999);
          return and(
            gte(column, startDate),
            lte(column, endDate)
          );
        }
        return undefined;
      }
      default:
        return eq(column, dateValue);
    }
  }

  if (isBooleanField) {
    const boolValue = value === "true" || value === "1";
    switch (operator) {
      case "is":
        return eq(column, boolValue);
      case "is_not":
        return ne(column, boolValue);
      default:
        return eq(column, boolValue);
    }
  }

  const values = value.split(",");
  switch (operator) {
    case "is":
    case "equals":
      return eq(column, value);
    case "is_not":
    case "not_equals":
      return ne(column, value);
    case "is_any_of":
      return inArray(column, values);
    case "is_not_any_of":
      return notInArray(column, values);
    case "greater_than":
      return gt(column, value);
    case "less_than":
      return lt(column, value);
    case "between": {
      const [min, max] = values;
      if (min && max) {
        return and(gte(column, min), lte(column, max));
      }
      return undefined;
    }
    default:
      return eq(column, value);
  }
}

export function buildFiltersCondition<T extends Record<string, PgColumn>>(
  filters: Record<string, string>,
  columnMap: T
): SQL | undefined {
  const conditions = Object.entries(filters)
    .map(([key, value]) => {
      const match = key.match(/^(.+)\[(.+)\]$/);
      if (match) {
        const [, fieldName, operator] = match;
        const column = columnMap[fieldName];
        if (!column) return undefined;
        return buildFilterCondition(value, column, operator);
      } else {
        const column = columnMap[key];
        if (!column) return undefined;
        return buildFilterCondition(value, column);
      }
    })
    .filter((condition): condition is SQL => condition !== undefined);

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];

  return and(...conditions);
}
