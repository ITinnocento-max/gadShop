import { useWishlistStore, type WishlistItem } from "./wishlist-store";

const mockItem: WishlistItem = {
  id: "1",
  slug: "test-product",
  image: "/test.jpg",
  brand: "TestBrand",
  title: "Test Product",
  price: 99.99,
  inStock: true,
};

const mockItem2: WishlistItem = {
  id: "2",
  slug: "test-product-2",
  image: "/test2.jpg",
  brand: "TestBrand2",
  title: "Test Product 2",
  price: 149.99,
  originalPrice: 199.99,
  inStock: false,
};

beforeEach(() => {
  useWishlistStore.setState({ items: [] });
});

describe("useWishlistStore", () => {
  it("starts with an empty wishlist", () => {
    expect(useWishlistStore.getState().items).toEqual([]);
  });

  describe("toggleItem", () => {
    it("adds an item when it does not exist", () => {
      useWishlistStore.getState().toggleItem(mockItem);
      expect(useWishlistStore.getState().items).toHaveLength(1);
      expect(useWishlistStore.getState().items[0]).toEqual(mockItem);
    });

    it("removes an item when it already exists", () => {
      useWishlistStore.getState().toggleItem(mockItem);
      useWishlistStore.getState().toggleItem(mockItem);
      expect(useWishlistStore.getState().items).toHaveLength(0);
    });

    it("toggles multiple distinct items independently", () => {
      useWishlistStore.getState().toggleItem(mockItem);
      useWishlistStore.getState().toggleItem(mockItem2);
      expect(useWishlistStore.getState().items).toHaveLength(2);

      useWishlistStore.getState().toggleItem(mockItem);
      expect(useWishlistStore.getState().items).toHaveLength(1);
      expect(useWishlistStore.getState().items[0].id).toBe("2");
    });
  });

  describe("removeItem", () => {
    it("removes an item by id", () => {
      useWishlistStore.getState().toggleItem(mockItem);
      useWishlistStore.getState().toggleItem(mockItem2);
      useWishlistStore.getState().removeItem("1");
      expect(useWishlistStore.getState().items).toHaveLength(1);
      expect(useWishlistStore.getState().items[0].id).toBe("2");
    });

    it("does nothing when id does not exist", () => {
      useWishlistStore.getState().toggleItem(mockItem);
      useWishlistStore.getState().removeItem("nonexistent");
      expect(useWishlistStore.getState().items).toHaveLength(1);
    });
  });

  describe("hasItem", () => {
    it("returns true for an item that exists", () => {
      useWishlistStore.getState().toggleItem(mockItem);
      expect(useWishlistStore.getState().hasItem("1")).toBe(true);
    });

    it("returns false for an item that does not exist", () => {
      expect(useWishlistStore.getState().hasItem("1")).toBe(false);
    });

    it("returns false after an item is removed", () => {
      useWishlistStore.getState().toggleItem(mockItem);
      useWishlistStore.getState().removeItem("1");
      expect(useWishlistStore.getState().hasItem("1")).toBe(false);
    });
  });

  describe("clearAll", () => {
    it("removes all items from the wishlist", () => {
      useWishlistStore.getState().toggleItem(mockItem);
      useWishlistStore.getState().toggleItem(mockItem2);
      useWishlistStore.getState().clearAll();
      expect(useWishlistStore.getState().items).toEqual([]);
    });
  });
});
