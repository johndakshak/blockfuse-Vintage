export type OrderStatus = "Delivered" | "Processing" | "Shipped" | "Pending" | "Cancelled";
export type PayStatus   = "Paid" | "Pending" | "Failed";
export type ProductStatus = "Active" | "Low Stock" | "Out of Stock";
export type CustomerStatus = "Active" | "Inactive" | "Banned";

export type Order = {
  id: string;
  name: string;
  items: number;
  amt: string;
  pay: PayStatus;
  status: OrderStatus;
  date: string;
};

export type Product = {
  name: string;
  cat: string;
  price: string;
  stock: number;
  status: ProductStatus;
  date: string;
};

export type Customer = {
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: string;
  status: CustomerStatus;
  joined: string;
};

export const ORDERS: Order[] = [
  { id: "#BV-0041", name: "Amara Okafor",   items: 2, amt: "₦48,500", pay: "Paid",    status: "Delivered",  date: "Mar 8" },
  { id: "#BV-0040", name: "James Holloway", items: 1, amt: "₦22,000", pay: "Paid",    status: "Processing", date: "Mar 8" },
  { id: "#BV-0039", name: "Fatima Bello",   items: 3, amt: "₦76,000", pay: "Paid",    status: "Shipped",    date: "Mar 7" },
  { id: "#BV-0038", name: "Chidi Eze",      items: 1, amt: "₦15,500", pay: "Pending", status: "Pending",    date: "Mar 7" },
  { id: "#BV-0037", name: "Sophie Martin",  items: 2, amt: "₦54,000", pay: "Paid",    status: "Delivered",  date: "Mar 6" },
  { id: "#BV-0036", name: "Emeka Nwosu",    items: 1, amt: "₦38,000", pay: "Paid",    status: "Shipped",    date: "Mar 5" },
  { id: "#BV-0035", name: "Lara Adeyemi",   items: 4, amt: "₦92,000", pay: "Pending", status: "Pending",    date: "Mar 4" },
  { id: "#BV-0034", name: "Tunde Bakare",   items: 1, amt: "₦18,500", pay: "Failed",  status: "Cancelled",  date: "Mar 3" },
];

export const PRODUCTS: Product[] = [
  { name: "1970s Suede Jacket",      cat: "Jackets",     price: "₦38,000", stock: 4,  status: "Active",        date: "Feb 10" },
  { name: "Floral Wrap Dress",       cat: "Dresses",     price: "₦22,500", stock: 12, status: "Active",        date: "Feb 14" },
  { name: "Leather Belt Collection", cat: "Accessories", price: "₦9,500",  stock: 1,  status: "Low Stock",     date: "Jan 30" },
  { name: "Wide Leg Trousers",       cat: "Trousers",    price: "₦18,000", stock: 7,  status: "Active",        date: "Feb 20" },
  { name: "Vintage Silk Blouse",     cat: "Tops",        price: "₦16,500", stock: 0,  status: "Out of Stock",  date: "Jan 22" },
  { name: "Tweed Blazer",            cat: "Jackets",     price: "₦42,000", stock: 3,  status: "Active",        date: "Mar 1"  },
  { name: "Corduroy Cap",            cat: "Accessories", price: "₦7,000",  stock: 18, status: "Active",        date: "Mar 5"  },
  { name: "High-Waist Skirt",        cat: "Dresses",     price: "₦14,500", stock: 0,  status: "Out of Stock",  date: "Feb 2"  },
];

export const CUSTOMERS: Customer[] = [
  { name: "Amara Okafor",   email: "amara@example.com",  phone: "+234 801 234 5678", orders: 8,  spent: "₦184,000", status: "Active",   joined: "Jan 2025" },
  { name: "James Holloway", email: "james@example.com",  phone: "+44 7700 900123",   orders: 3,  spent: "₦62,000",  status: "Active",   joined: "Feb 2025" },
  { name: "Fatima Bello",   email: "fatima@example.com", phone: "+234 802 345 6789", orders: 12, spent: "₦310,500", status: "Active",   joined: "Dec 2024" },
  { name: "Chidi Eze",      email: "chidi@example.com",  phone: "+234 803 456 7890", orders: 1,  spent: "₦15,500",  status: "Active",   joined: "Mar 2026" },
  { name: "Sophie Martin",  email: "sophie@example.com", phone: "+33 6 12 34 56 78", orders: 5,  spent: "₦121,000", status: "Active",   joined: "Nov 2024" },
  { name: "Emeka Nwosu",    email: "emeka@example.com",  phone: "+234 804 567 8901", orders: 6,  spent: "₦98,000",  status: "Active",   joined: "Oct 2024" },
  { name: "Lara Adeyemi",   email: "lara@example.com",   phone: "+234 805 678 9012", orders: 2,  spent: "₦42,000",  status: "Inactive", joined: "Jan 2025" },
  { name: "Tunde Bakare",   email: "tunde@example.com",  phone: "+234 806 789 0123", orders: 1,  spent: "₦0",       status: "Banned",   joined: "Feb 2026" },
];

// Badge colour map
export const orderStatusBadge: Record<OrderStatus, string> = {
  Delivered:  "bg-[rgba(74,144,104,0.1)]  text-[#3a7a5c]",
  Processing: "bg-[rgba(200,169,110,0.15)] text-[#a8893e]",
  Shipped:    "bg-[rgba(74,130,184,0.1)]  text-[#3a7ab0]",
  Pending:    "bg-[rgba(154,150,144,0.12)] text-[#7a776f]",
  Cancelled:  "bg-[rgba(176,92,58,0.1)]   text-[#b05c3a]",
};

export const payStatusBadge: Record<PayStatus, string> = {
  Paid:    "bg-[rgba(74,144,104,0.1)]  text-[#3a7a5c]",
  Pending: "bg-[rgba(200,169,110,0.15)] text-[#a8893e]",
  Failed:  "bg-[rgba(176,92,58,0.1)]   text-[#b05c3a]",
};

export const productStatusBadge: Record<ProductStatus, string> = {
  "Active":        "bg-[rgba(74,144,104,0.1)]  text-[#3a7a5c]",
  "Low Stock":     "bg-[rgba(176,92,58,0.1)]   text-[#b05c3a]",
  "Out of Stock":  "bg-[rgba(154,150,144,0.12)] text-[#7a776f]",
};

export const customerStatusBadge: Record<CustomerStatus, string> = {
  Active:   "bg-[rgba(74,144,104,0.1)]  text-[#3a7a5c]",
  Inactive: "bg-[rgba(154,150,144,0.12)] text-[#7a776f]",
  Banned:   "bg-[rgba(176,92,58,0.1)]   text-[#b05c3a]",
};
