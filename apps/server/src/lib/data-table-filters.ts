import { SQL, and, ilike, eq } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export function buildFilterCondition(
  value: string,
  column: PgColumn
): SQL | undefined {
  if (!value) return undefined;

  const columnType = column.getSQLType();

  if (columnType.includes('varchar') || columnType.includes('text')) {
    return ilike(column, `%${value}%`);
  }

  if (columnType.includes('boolean')) {
    return eq(column, value === 'true');
  }

  return eq(column, value);
}

export function buildFiltersCondition<T extends Record<string, PgColumn>>(
  filters: Record<string, string>,
  columnMap: T
): SQL | undefined {
  const conditions = Object.entries(filters)
    .map(([key, value]) => {
      const column = columnMap[key];
      if (!column) return undefined;
      return buildFilterCondition(value, column);
    })
    .filter((condition): condition is SQL => condition !== undefined);

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];

  return and(...conditions);
}
