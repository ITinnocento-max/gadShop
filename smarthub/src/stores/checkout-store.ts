import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface GuestInfo {
  email: string;
  phone: string;
}

interface CheckoutState {
  shippingAddress: ShippingAddress | null;
  shippingMethod: string;
  guestInfo: GuestInfo | null;
  setShippingAddress: (address: ShippingAddress) => void;
  setShippingMethod: (method: string) => void;
  setGuestInfo: (info: GuestInfo) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      shippingAddress: null,
      shippingMethod: "standard",
      guestInfo: null,
      setShippingAddress: (address) => set({ shippingAddress: address }),
      setShippingMethod: (method) => set({ shippingMethod: method }),
      setGuestInfo: (info) => set({ guestInfo: info }),
      clearCheckout: () =>
        set({ shippingAddress: null, shippingMethod: "standard", guestInfo: null }),
    }),
    {
      name: "checkout-storage",
    }
  )
);
