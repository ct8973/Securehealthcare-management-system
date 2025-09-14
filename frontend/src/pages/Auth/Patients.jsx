import { useEffect, useState } from 'react'
import { listPatients, createPatient, deletePatient, restorePatient } from '../api/patients'

export default function Patients() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      const data = await listPatients({ q })
      setItems(data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load patients')
    }
  }

  useEffect(() => { load() }, []) // load on mount

  async function addDemo() {
    setCreating(true)
    try {
      await createPatient({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phone: '+1 555 123456',
        email: 'john@example.com'
      })
      await load()
    } catch (err) {
      alert(err?.response?.data?.error || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  async function softDelete(id) {
    if (!confirm('Delete this patient?')) return
    try {
      await deletePatient(id)
      await load()
    } catch (err) {
      alert(err?.response?.data?.error || 'Delete failed')
    }
  }

  async function restore(id) {
    try {
      const p = await restorePatient(id)
      alert(`Restored: ${p.firstName} ${p.lastName}`)
      await load()
    } catch (err) {
      alert(err?.response?.data?.error || 'Restore failed')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Patients</h2>
      <div style={{ marginBottom: 12 }}>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search name/phone/email" />
        <button onClick={load}>Search</button>
        <button onClick={addDemo} disabled={creating}>+ Add demo</button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th><th>DOB</th><th>Phone</th><th>Email</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p._id}>
              <td>{p.firstName} {p.lastName}</td>
              <td>{new Date(p.dateOfBirth).toLocaleDateString()}</td>
              <td>{p.phone || '-'}</td>
              <td>{p.email || '-'}</td>
              <td>
                <button onClick={()=>softDelete(p._id)}>Delete</button>
                <button onClick={()=>restore(p._id)}>Restore</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
