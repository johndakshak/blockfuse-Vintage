export type CartItem = {
  id: number;
  name: string;
  meta: string;
  price: number;
  qty: number;
};

export const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");
