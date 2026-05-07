import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createUser, fetchUsers } from '../api/users'
import type { User, UserForm } from '../types/user'
import './UsersView.css'

const initialForm: UserForm = {
  username: '',
  country: '',
  age: '',
}

function UsersView() {
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState<UserForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      form.username.trim().length >= 2 &&
      form.country.trim().length >= 2 &&
      Number.isInteger(Number(form.age)) &&
      Number(form.age) >= 0 &&
      Number(form.age) <= 120
    )
  }, [form])

  useEffect(() => {
    void loadUsers()
  }, [])

  async function loadUsers() {
    setIsLoading(true)
    setError(null)

    try {
      setUsers(await fetchUsers())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const createdUser = await createUser({
        username: form.username.trim(),
        country: form.country.trim(),
        age: Number(form.age),
      })

      setUsers((currentUsers) => [...currentUsers, createdUser])
      setForm(initialForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h2>Users</h2>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadUsers()}>
          Refresh
        </button>
      </header>

      <div className="users-layout">
        <section className="panel">
          <h3>Add user</h3>
          <form className="user-form" onSubmit={(event) => void handleCreateUser(event)}>
            <label>
              Username
              <input
                minLength={2}
                name="username"
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                placeholder="Tomek"
                required
                type="text"
                value={form.username}
              />
            </label>

            <label>
              Country
              <input
                minLength={2}
                name="country"
                onChange={(event) => setForm({ ...form, country: event.target.value })}
                placeholder="Poland"
                required
                type="text"
                value={form.country}
              />
            </label>

            <label>
              Age
              <input
                max={120}
                min={0}
                name="age"
                onChange={(event) => setForm({ ...form, age: event.target.value })}
                placeholder="24"
                required
                type="number"
                value={form.age}
              />
            </label>

            <button className="primary-button" disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? 'Adding...' : 'Add user'}
            </button>
          </form>
        </section>

        <section className="panel users-panel">
          <div className="panel-title-row">
            <h3>All users</h3>
            <span>{users.length}</span>
          </div>

          {error ? <p className="message error-message">{error}</p> : null}
          {isLoading ? <p className="message">Loading users...</p> : null}

          {!isLoading && users.length === 0 ? (
            <p className="message">No users yet.</p>
          ) : null}

          {!isLoading && users.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Country</th>
                    <th>Age</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.country}</td>
                      <td>{user.age}</td>
                      <td className="muted-cell">{user.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </>
  )
}

export default UsersView
