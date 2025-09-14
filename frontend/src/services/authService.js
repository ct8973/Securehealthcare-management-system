import { login, register } from "../api/auth";

export const loginUser = async (username, password) => {
  return await login({ username, password });
};

export const registerUser = async (username, password, role) => {
  return await register({ username, password, role });
};
