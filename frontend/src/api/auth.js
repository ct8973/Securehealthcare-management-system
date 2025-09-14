// src/api/auth.js
import { http } from './http'
import { setToken, clearToken, getToken } from './token'

export async function register({ username, password, role }) {
  const { data } = await http.post('/auth/register', { username, password, role })
  if (data?.token) setToken(data.token)
  return data
}

export async function login({ username, password }) {
  const { data } = await http.post('/auth/login', { username, password })
  if (data?.token) setToken(data.token)
  return data
}

export async function me() {
  if (!getToken()) return null
  const { data } = await http.get('/auth/me')
  return data?.user
}

export function logout() {
  clearToken()
}
