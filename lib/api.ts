export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8080/ws-trips";

export type User = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type PlannerRequest = {
  budgetInr: number;
  days: number;
  startLocation: string;
};

export type ItineraryItem = {
  id: number | null;
  dayNumber: number;
  sortOrder: number;
  title: string;
  description: string;
  estimatedCostInr: number;
};

export type PlannerSuggestion = {
  destinationId: number;
  name: string;
  region: string;
  category: string;
  estimatedTotalInr: number;
  remainingBudgetInr: number;
  description: string;
  itinerary: ItineraryItem[];
};

export type Member = {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: "OWNER" | "MEMBER";
};

export type Trip = {
  id: number;
  name: string;
  destinationName: string;
  budgetInr: number;
  days: number;
  startLocation: string;
  inviteCode: string;
  owner: User;
  members: Member[];
  itinerary: ItineraryItem[];
};

export type CreateTripRequest = {
  name?: string;
  destinationName: string;
  budgetInr: number;
  days: number;
  startLocation: string;
  templateDestinationId?: number;
  itinerary?: ItineraryItem[];
};

export type ExpenseSplit = {
  memberId: number;
  memberName: string;
  shareAmount: number;
};

export type Expense = {
  id: number;
  title: string;
  amount: number;
  paidBy: Member;
  createdAt: string;
  splits: ExpenseSplit[];
};

export type ExpenseRequest = {
  title: string;
  amount: number;
  paidByMemberId: number;
  splitMemberIds: number[];
};

export type Balance = {
  memberId: number;
  memberName: string;
  balance: number;
};

export type SettlementTransaction = {
  fromMemberId: number;
  fromMemberName: string;
  toMemberId: number;
  toMemberName: string;
  amount: number;
};

export type Settlement = {
  balances: Balance[];
  transactions: SettlementTransaction[];
};

export type LocationMessage = {
  tripId: number;
  memberId: number;
  memberName: string;
  latitude: number;
  longitude: number;
  sharedAt: string;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      message = payload.message ?? message;
    } catch {
      // Keep the generic message when the server did not return JSON.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body }),
  me: (token: string) => request<User>("/auth/me", { token }),
};

export const plannerApi = {
  suggestions: (body: PlannerRequest, token: string) =>
    request<PlannerSuggestion[]>("/planner/suggestions", {
      method: "POST",
      body,
      token,
    }),
};

export const tripsApi = {
  list: (token: string) => request<Trip[]>("/trips", { token }),
  get: (tripId: number, token: string) => request<Trip>(`/trips/${tripId}`, { token }),
  create: (body: CreateTripRequest, token: string) =>
    request<Trip>("/trips", { method: "POST", body, token }),
  join: (inviteCode: string, token: string) =>
    request<Trip>(`/trips/join/${encodeURIComponent(inviteCode)}`, {
      method: "POST",
      token,
    }),
  addItineraryItem: (
    tripId: number,
    body: Omit<ItineraryItem, "id">,
    token: string,
  ) =>
    request<ItineraryItem>(`/trips/${tripId}/itinerary`, {
      method: "POST",
      body,
      token,
    }),
  updateItineraryItem: (
    tripId: number,
    itemId: number,
    body: Omit<ItineraryItem, "id">,
    token: string,
  ) =>
    request<ItineraryItem>(`/trips/${tripId}/itinerary/${itemId}`, {
      method: "PUT",
      body,
      token,
    }),
  deleteItineraryItem: (tripId: number, itemId: number, token: string) =>
    request<void>(`/trips/${tripId}/itinerary/${itemId}`, {
      method: "DELETE",
      token,
    }),
  expenses: (tripId: number, token: string) =>
    request<Expense[]>(`/trips/${tripId}/expenses`, { token }),
  addExpense: (tripId: number, body: ExpenseRequest, token: string) =>
    request<Expense>(`/trips/${tripId}/expenses`, {
      method: "POST",
      body,
      token,
    }),
  settlements: (tripId: number, token: string) =>
    request<Settlement>(`/trips/${tripId}/settlements`, { token }),
};
