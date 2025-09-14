// src/api/appointments.js
import { http } from './http'

export async function createAppointment(payload) {
  const { data } = await http.post('/appointments', payload)
  return data
}

export async function listAppointments(params = {}) {
  const { data } = await http.get('/appointments', { params })
  return data
}

export async function getAppointment(id) {
  const { data } = await http.get(`/appointments/${id}`)
  return data
}

export async function updateAppointment(id, payload) {
  const { data } = await http.put(`/appointments/${id}`, payload)
  return data
}

export async function deleteAppointment(id) {
  const { data } = await http.delete(`/appointments/${id}`)
  return data
}

export async function restoreAppointment(id) {
  const { data } = await http.post(`/appointments/${id}/restore`)
  return data
}
