import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Helper to create a fake JWT
const createFakeToken = (user: User) => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    id: user.id,
    name: user.name,
    exp: Date.now() / 1000 + 3600,
  }; // Expires in 1 hour
  return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.fakesig`;
};

// Attempt to load user and token from localStorage
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

export type User = { id: string; email: string; name: string };

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      const user = action.payload;
      const token = createFakeToken(user);
      state.user = user;
      state.token = token;
      state.loading = false;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
