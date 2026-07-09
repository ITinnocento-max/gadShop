import { create } from "zustand";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface CheckoutState {
  shippingAddress: ShippingAddress | null;
  shippingMethod: string;
  setShippingAddress: (address: ShippingAddress) => void;
  setShippingMethod: (method: string) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  shippingAddress: null,
  shippingMethod: "standard",
  setShippingAddress: (address) => set({ shippingAddress: address }),
  setShippingMethod: (method) => set({ shippingMethod: method }),
  clearCheckout: () => set({ shippingAddress: null, shippingMethod: "standard" }),
}));
