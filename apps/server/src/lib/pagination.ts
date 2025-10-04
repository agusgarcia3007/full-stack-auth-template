import { z } from "zod";

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});

export type PaginationParams = {
  page: number;
  limit: number;
};

export type SortingItem = z.infer<typeof sortingItemSchema>;

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}

export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function parseQueryParams(query: Record<string, string | undefined>) {
  const { page, limit, sort, ...filters } = query;

  const params = paginationSchema.parse({
    page,
    limit,
    sort,
  });

  let sorting: z.infer<typeof sortingItemSchema>[] = [];
  if (params.sort) {
    sorting = params.sort.split(',').map(field => {
      const desc = field.startsWith('-');
      const id = desc ? field.slice(1) : field;
      return { id, desc };
    });
  }

  const parsedFilters: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value) parsedFilters[key] = value;
  });

  return {
    pagination: {
      page: params.page,
      limit: params.limit,
    },
    sorting,
    filters: parsedFilters
  };
}
