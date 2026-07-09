import { useCartStore, type CartItem } from "./cart-store";

const mockItem: CartItem = {
  id: "1",
  name: "Test Product",
  price: 49.99,
  image: "/test.jpg",
  quantity: 1,
};

const mockItem2: CartItem = {
  id: "2",
  name: "Test Product 2",
  price: 99.99,
  originalPrice: 129.99,
  image: "/test2.jpg",
  quantity: 2,
  variant: "Black",
  color: "#000",
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe("useCartStore", () => {
  it("starts with an empty cart", () => {
    expect(useCartStore.getState().items).toEqual([]);
  });

  describe("addItem", () => {
    it("adds a new item to the cart", () => {
      useCartStore.getState().addItem(mockItem);
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0]).toEqual(mockItem);
    });

    it("merges quantity when adding an existing item", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem({ ...mockItem, quantity: 2 });
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(3);
    });

    it("adds multiple distinct items", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("removes an item by id", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().removeItem("1");
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].id).toBe("2");
    });

    it("does nothing when id does not exist", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().removeItem("nonexistent");
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity for an existing item", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("1", 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("clamps minimum quantity to 1", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("1", 0);
      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });

    it("does nothing for a nonexistent id", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("nonexistent", 5);
      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });
  });

  describe("clearCart", () => {
    it("removes all items", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items).toEqual([]);
    });
  });

  describe("itemCount", () => {
    it("returns 0 for an empty cart", () => {
      expect(useCartStore.getState().itemCount()).toBe(0);
    });

    it("returns total quantity across all items", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      expect(useCartStore.getState().itemCount()).toBe(3);
    });
  });

  describe("subtotal", () => {
    it("returns 0 for an empty cart", () => {
      expect(useCartStore.getState().subtotal()).toBe(0);
    });

    it("calculates subtotal as sum of price * quantity", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      expect(useCartStore.getState().subtotal()).toBe(49.99 * 1 + 99.99 * 2);
    });
  });
});
