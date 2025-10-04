import { http } from "@/lib/http";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "student";
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: "admin" | "student";
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: "admin" | "student";
  password?: string;
}

export interface SortingItem {
  id: string;
  desc: boolean;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  sorting?: SortingItem[];
  filters?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersKeys = {
  all: () => ["users"] as const,
  lists: () => [...usersKeys.all(), "list"] as const,
  list: (params?: UsersListParams) => [
    ...usersKeys.lists(),
    {
      page: params?.page,
      limit: params?.limit,
      sorting: params?.sorting,
      filters: params?.filters,
    }
  ] as const,
  details: () => [...usersKeys.all(), "detail"] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

export const usersService = {
  getUsers: async (params?: UsersListParams) => {
    const queryParams: Record<string, string | number> = {};

    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;

    if (params?.sorting && params.sorting.length > 0) {
      queryParams.sort = params.sorting.map(s => `${s.desc ? '-' : ''}${s.id}`).join(',');
    }

    if (params?.filters) {
      Object.assign(queryParams, params.filters);
    }

    const { data } = await http.get<PaginatedResponse<User>>("/admin/users", {
      params: queryParams
    });
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await http.get<{ user: User }>(`/admin/users/${id}`);
    return data.user;
  },

  createUser: async (input: CreateUserInput) => {
    const { data } = await http.post<{ user: User }>("/admin/users", input);
    return data.user;
  },

  updateUser: async (id: string, input: UpdateUserInput) => {
    const { data } = await http.patch<{ user: User }>(`/admin/users/${id}`, input);
    return data.user;
  },

  deleteUser: async (id: string) => {
    const { data } = await http.delete<{ message: string }>(`/admin/users/${id}`);
    return data;
  },
};
