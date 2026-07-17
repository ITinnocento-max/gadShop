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
  appliedPromo: {
    promoCodeId: string;
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null;
  setShippingAddress: (address: ShippingAddress) => void;
  setShippingMethod: (method: string) => void;
  setGuestInfo: (info: GuestInfo) => void;
  setAppliedPromo: (promo: CheckoutState["appliedPromo"]) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      shippingAddress: null,
      shippingMethod: "standard",
      guestInfo: null,
      appliedPromo: null,
      setShippingAddress: (address) => set({ shippingAddress: address }),
      setShippingMethod: (method) => set({ shippingMethod: method }),
      setGuestInfo: (info) => set({ guestInfo: info }),
      setAppliedPromo: (promo) => set({ appliedPromo: promo }),
      clearCheckout: () =>
        set({ shippingAddress: null, shippingMethod: "standard", guestInfo: null, appliedPromo: null }),
    }),
    {
      name: "checkout-storage",
    }
  )
);
