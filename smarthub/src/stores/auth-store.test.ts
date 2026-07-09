import { useAuthStore } from "./auth-store";

const mockUser = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
};

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe("useAuthStore", () => {
  it("starts with no authenticated user", () => {
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  describe("login", () => {
    it("sets the user and marks as authenticated", () => {
      useAuthStore.getState().login(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("replaces the previous user on subsequent login", () => {
      useAuthStore.getState().login(mockUser);
      const anotherUser = { id: "user-2", name: "Jane", email: "jane@example.com" };
      useAuthStore.getState().login(anotherUser);
      expect(useAuthStore.getState().user).toEqual(anotherUser);
    });
  });

  describe("logout", () => {
    it("clears the user and marks as unauthenticated", () => {
      useAuthStore.getState().login(mockUser);
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("is idempotent when already logged out", () => {
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
