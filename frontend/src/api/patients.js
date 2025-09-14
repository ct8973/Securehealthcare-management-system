// src/api/patients.js
import { http } from './http'

export async function createPatient(payload) {
  const { data } = await http.post('/patients', payload)
  return data
}

export async function listPatients(params = {}) {
  const { data } = await http.get('/patients', { params })
  return data
}

export async function getPatient(id) {
  const { data } = await http.get(`/patients/${id}`)
  return data
}

export async function updatePatient(id, payload) {
  const { data } = await http.put(`/patients/${id}`, payload)
  return data
}

export async function deletePatient(id) {
  const { data } = await http.delete(`/patients/${id}`)
  return data
}

export async function restorePatient(id) {
  const { data } = await http.post(`/patients/${id}/restore`)
  return data
}

export async function myProfile() {
  const { data } = await http.get('/patients/me')
  return data
}
