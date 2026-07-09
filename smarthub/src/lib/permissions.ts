export type Role =
  | "super_admin"
  | "administrator"
  | "finance_manager"
  | "accountant"
  | "inventory_manager"
  | "sales_manager"
  | "customer_support"
  | "marketing_manager"
  | "content_manager"
  | "store_manager";

export type Resource =
  | "dashboard"
  | "products"
  | "orders"
  | "financial"
  | "profit_loss"
  | "inventory"
  | "customers"
  | "marketing"
  | "content"
  | "users"
  | "settings"
  | "reports"
  | "banking"
  | "expenses"
  | "tax"
  | "invoicing"
  | "payments"
  | "analytics";

export type Action = "view" | "create" | "edit" | "approve" | "export" | "delete";

type PermissionMap = Record<Resource, Action[]>;

export const ROLE_PERMISSIONS: Record<Role, PermissionMap> = {
  super_admin: {
    dashboard: ["view", "export"],
    products: ["view", "create", "edit", "approve", "export", "delete"],
    orders: ["view", "create", "edit", "approve", "export", "delete"],
    financial: ["view", "create", "edit", "approve", "export", "delete"],
    profit_loss: ["view", "create", "edit", "approve", "export", "delete"],
    inventory: ["view", "create", "edit", "approve", "export", "delete"],
    customers: ["view", "create", "edit", "approve", "export", "delete"],
    marketing: ["view", "create", "edit", "approve", "export", "delete"],
    content: ["view", "create", "edit", "approve", "export", "delete"],
    users: ["view", "create", "edit", "approve", "export", "delete"],
    settings: ["view", "edit", "export"],
    reports: ["view", "create", "edit", "approve", "export", "delete"],
    banking: ["view", "create", "edit", "approve", "export", "delete"],
    expenses: ["view", "create", "edit", "approve", "export", "delete"],
    tax: ["view", "create", "edit", "approve", "export", "delete"],
    invoicing: ["view", "create", "edit", "approve", "export", "delete"],
    payments: ["view", "create", "edit", "approve", "export", "delete"],
    analytics: ["view", "export"],
  },
  administrator: {
    dashboard: ["view", "export"],
    products: ["view", "create", "edit", "approve", "export", "delete"],
    orders: ["view", "create", "edit", "approve", "export", "delete"],
    financial: ["view", "create", "edit", "export"],
    profit_loss: ["view", "create", "edit", "export"],
    inventory: ["view", "create", "edit", "export"],
    customers: ["view", "create", "edit", "export", "delete"],
    marketing: ["view", "create", "edit", "approve", "export", "delete"],
    content: ["view", "create", "edit", "approve", "export", "delete"],
    users: ["view", "create", "edit", "export"],
    settings: ["view", "edit"],
    reports: ["view", "create", "edit", "export", "delete"],
    banking: ["view", "create", "edit", "export", "delete"],
    expenses: ["view", "create", "edit", "export", "delete"],
    tax: ["view", "create", "edit", "export"],
    invoicing: ["view", "create", "edit", "export", "delete"],
    payments: ["view", "create", "edit", "export", "delete"],
    analytics: ["view", "export"],
  },
  finance_manager: {
    dashboard: ["view"],
    products: ["view"],
    orders: ["view", "export"],
    financial: ["view", "create", "edit", "approve", "export", "delete"],
    profit_loss: ["view", "create", "edit", "approve", "export", "delete"],
    inventory: ["view"],
    customers: ["view"],
    marketing: ["view", "export"],
    content: [],
    users: [],
    settings: [],
    reports: ["view", "create", "edit", "approve", "export", "delete"],
    banking: ["view", "create", "edit", "approve", "export", "delete"],
    expenses: ["view", "create", "edit", "approve", "export", "delete"],
    tax: ["view", "create", "edit", "approve", "export", "delete"],
    invoicing: ["view", "create", "edit", "approve", "export", "delete"],
    payments: ["view", "create", "edit", "approve", "export", "delete"],
    analytics: ["view", "export"],
  },
  accountant: {
    dashboard: ["view"],
    products: [],
    orders: ["view"],
    financial: ["view", "create", "edit", "export"],
    profit_loss: ["view", "create", "edit", "export"],
    inventory: [],
    customers: [],
    marketing: [],
    content: [],
    users: [],
    settings: [],
    reports: ["view", "create", "edit", "export"],
    banking: ["view", "edit", "export"],
    expenses: ["view", "create", "edit", "export"],
    tax: ["view", "edit", "export"],
    invoicing: ["view", "create", "edit", "export"],
    payments: ["view", "export"],
    analytics: ["view"],
  },
  inventory_manager: {
    dashboard: ["view"],
    products: ["view", "create", "edit", "export"],
    orders: ["view"],
    financial: [],
    profit_loss: [],
    inventory: ["view", "create", "edit", "export", "delete"],
    customers: [],
    marketing: [],
    content: [],
    users: [],
    settings: [],
    reports: ["view", "export"],
    banking: [],
    expenses: ["view"],
    tax: [],
    invoicing: ["view"],
    payments: [],
    analytics: ["view"],
  },
  sales_manager: {
    dashboard: ["view"],
    products: ["view", "create", "edit", "export"],
    orders: ["view", "create", "edit", "export"],
    financial: ["view"],
    profit_loss: [],
    inventory: ["view"],
    customers: ["view", "create", "edit", "export"],
    marketing: [],
    content: [],
    users: [],
    settings: [],
    reports: ["view", "export"],
    banking: [],
    expenses: [],
    tax: [],
    invoicing: ["view"],
    payments: ["view"],
    analytics: ["view", "export"],
  },
  customer_support: {
    dashboard: ["view"],
    products: ["view"],
    orders: ["view", "edit", "export"],
    financial: [],
    profit_loss: [],
    inventory: [],
    customers: ["view", "edit", "export"],
    marketing: [],
    content: [],
    users: [],
    settings: [],
    reports: [],
    banking: [],
    expenses: [],
    tax: [],
    invoicing: ["view"],
    payments: ["view"],
    analytics: [],
  },
  marketing_manager: {
    dashboard: ["view", "export"],
    products: ["view", "edit"],
    orders: [],
    financial: [],
    profit_loss: [],
    inventory: [],
    customers: ["view"],
    marketing: ["view", "create", "edit", "approve", "export", "delete"],
    content: ["view", "edit"],
    users: [],
    settings: [],
    reports: ["view", "export"],
    banking: [],
    expenses: ["view"],
    tax: [],
    invoicing: [],
    payments: [],
    analytics: ["view", "export"],
  },
  content_manager: {
    dashboard: ["view"],
    products: ["view", "create", "edit", "export"],
    orders: [],
    financial: [],
    profit_loss: [],
    inventory: [],
    customers: [],
    marketing: [],
    content: ["view", "create", "edit", "approve", "export", "delete"],
    users: [],
    settings: [],
    reports: [],
    banking: [],
    expenses: [],
    tax: [],
    invoicing: [],
    payments: [],
    analytics: [],
  },
  store_manager: {
    dashboard: ["view", "export"],
    products: ["view", "create", "edit", "approve", "export"],
    orders: ["view", "create", "edit", "export"],
    financial: ["view"],
    profit_loss: [],
    inventory: ["view", "create", "edit", "export"],
    customers: ["view", "edit"],
    marketing: [],
    content: [],
    users: [],
    settings: [],
    reports: ["view", "export"],
    banking: [],
    expenses: ["view"],
    tax: [],
    invoicing: ["view", "create"],
    payments: ["view"],
    analytics: ["view", "export"],
  },
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  finance_manager: "Finance Manager",
  accountant: "Accountant",
  inventory_manager: "Inventory Manager",
  sales_manager: "Sales Manager",
  customer_support: "Customer Support Agent",
  marketing_manager: "Marketing Manager",
  content_manager: "Content Manager",
  store_manager: "Store Manager",
};

export function hasPermission(
  role: Role | null,
  resource: Resource,
  action: Action,
): boolean {
  if (!role) return false;
  const actions = ROLE_PERMISSIONS[role]?.[resource];
  if (!actions) return false;
  return actions.includes(action);
}

export function canAccessAny(
  role: Role | null,
  resource: Resource,
): boolean {
  if (!role) return false;
  const actions = ROLE_PERMISSIONS[role]?.[resource];
  return !!actions && actions.length > 0;
}
