// src/api/admin.js
import { http } from './http'

export async function listAudit(params = {}) {
  const { data } = await http.get('/admin/audit', { params })
  return data
}
