import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { fetchCategories } from '../api/categories'
import { createMovie, fetchMovies } from '../api/movies'
import type { Category } from '../types/category'
import type { Movie, MovieForm } from '../types/movie'
import './MoviesView.css'

const initialForm: MovieForm = {
  title: '',
  duration_minutes: '',
  category_id: '',
}

function MoviesView() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<MovieForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length >= 1 &&
      Number.isInteger(Number(form.duration_minutes)) &&
      Number(form.duration_minutes) >= 1 &&
      Number(form.duration_minutes) <= 500 &&
      form.category_id.length > 0
    )
  }, [form])

  useEffect(() => {
    void loadMoviesData()
  }, [])

  async function loadMoviesData() {
    setIsLoading(true)
    setError(null)

    try {
      const [moviesData, categoriesData] = await Promise.all([
        fetchMovies(),
        fetchCategories(),
      ])

      setMovies(moviesData)
      setCategories(categoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateMovie(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const createdMovie = await createMovie({
        title: form.title.trim(),
        duration_minutes: Number(form.duration_minutes),
        category_id: form.category_id,
      })

      setMovies((currentMovies) => [...currentMovies, createdMovie])
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
          <h2>Movies</h2>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadMoviesData()}>
          Refresh
        </button>
      </header>

      <div className="movies-layout">
        <section className="panel">
          <h3>Add movie</h3>
          <form className="movie-form" onSubmit={(event) => void handleCreateMovie(event)}>
            <label>
              Title
              <input
                minLength={1}
                name="title"
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Inception"
                required
                type="text"
                value={form.title}
              />
            </label>

            <label>
              Duration minutes
              <input
                max={500}
                min={1}
                name="duration_minutes"
                onChange={(event) =>
                  setForm({ ...form, duration_minutes: event.target.value })
                }
                placeholder="148"
                required
                type="number"
                value={form.duration_minutes}
              />
            </label>

            <label>
              Category
              <select
                disabled={categories.length === 0}
                name="category_id"
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                required
                value={form.category_id}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            {categories.length === 0 && !isLoading ? (
              <p className="message">Create a category before adding movies.</p>
            ) : null}

            <button className="primary-button" disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? 'Adding...' : 'Add movie'}
            </button>
          </form>
        </section>

        <section className="panel movies-panel">
          <div className="panel-title-row">
            <h3>All movies</h3>
            <span>{movies.length}</span>
          </div>

          {error ? <p className="message error-message">{error}</p> : null}
          {isLoading ? <p className="message">Loading movies...</p> : null}

          {!isLoading && movies.length === 0 ? <p className="message">No movies yet.</p> : null}

          {!isLoading && movies.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Category</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id}>
                      <td>{movie.title}</td>
                      <td>{movie.duration_minutes} min</td>
                      <td>{movie.category.name}</td>
                      <td className="muted-cell">{movie.id}</td>
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

export default MoviesView
