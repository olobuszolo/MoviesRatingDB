import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createCategory, fetchCategories } from '../api/categories'
import type { Category, CategoryForm } from '../types/category'
import './CategoriesView.css'

const initialForm: CategoryForm = {
  name: '',
}

function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<CategoryForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => form.name.trim().length >= 1, [form.name])

  useEffect(() => {
    void loadCategories()
  }, [])

  async function loadCategories() {
    setIsLoading(true)
    setError(null)

    try {
      setCategories(await fetchCategories())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const createdCategory = await createCategory({
        name: form.name.trim(),
      })

      setCategories((currentCategories) => [...currentCategories, createdCategory])
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
          <h2>Categories</h2>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadCategories()}>
          Refresh
        </button>
      </header>

      <div className="categories-layout">
        <section className="panel">
          <h3>Add category</h3>
          <form className="category-form" onSubmit={(event) => void handleCreateCategory(event)}>
            <label>
              Name
              <input
                minLength={1}
                name="name"
                onChange={(event) => setForm({ name: event.target.value })}
                placeholder="Drama"
                required
                type="text"
                value={form.name}
              />
            </label>

            <button className="primary-button" disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? 'Adding...' : 'Add category'}
            </button>
          </form>
        </section>

        <section className="panel categories-panel">
          <div className="panel-title-row">
            <h3>All categories</h3>
            <span>{categories.length}</span>
          </div>

          {error ? <p className="message error-message">{error}</p> : null}
          {isLoading ? <p className="message">Loading categories...</p> : null}

          {!isLoading && categories.length === 0 ? (
            <p className="message">No categories yet.</p>
          ) : null}

          {!isLoading && categories.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td className="muted-cell">{category.id}</td>
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

export default CategoriesView
