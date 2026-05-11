import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createCategory,
  fetchCategories,
  fetchCategoryTopMovies,
} from '../api/categories'
import type { Category, CategoryForm, CategoryTopMovie } from '../types/category'
import './CategoriesView.css'

const initialForm: CategoryForm = {
  name: '',
}

function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([])
  const [topMovies, setTopMovies] = useState<CategoryTopMovie[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [form, setForm] = useState<CategoryForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTopMovies, setIsLoadingTopMovies] = useState(false)
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
      setTopMovies([])
      setSelectedCategoryId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSelectedCategoryChange(categoryId: string) {
    setSelectedCategoryId(categoryId)
    setTopMovies([])
    setError(null)

    if (!categoryId) {
      return
    }

    setIsLoadingTopMovies(true)

    try {
      setTopMovies(await fetchCategoryTopMovies(categoryId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoadingTopMovies(false)
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
        <div className="categories-side">
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

          <section className="panel">
            <h3>Top movies</h3>
            <div className="category-form">
              <label>
                Category
                <select
                  disabled={categories.length === 0}
                  name="selected_category_id"
                  onChange={(event) => void handleSelectedCategoryChange(event.target.value)}
                  value={selectedCategoryId}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              {isLoadingTopMovies ? <p className="message">Loading top movies...</p> : null}

              {!isLoadingTopMovies && selectedCategoryId && topMovies.length === 0 ? (
                <p className="message">No rated movies in this category.</p>
              ) : null}

              {!isLoadingTopMovies && topMovies.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Movie</th>
                        <th>Average</th>
                        <th>Opinions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMovies.map((topMovie) => (
                        <tr key={topMovie.movie.id}>
                          <td>{topMovie.movie.title}</td>
                          <td>{topMovie.average_score.toFixed(2)}</td>
                          <td>{topMovie.opinions_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </section>
        </div>

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
