import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  assignDirectorToMovie,
  createDirector,
  fetchDirectors,
  fetchDirectorMovies,
} from '../api/directors'
import { fetchMovies } from '../api/movies'
import type {
  Director,
  DirectorForm,
  DirectorMovieAssignmentForm,
  DirectedMovie,
} from '../types/director'
import type { Movie } from '../types/movie'
import './DirectorsView.css'

const initialForm: DirectorForm = {
  name: '',
  country: '',
}

const initialAssignmentForm: DirectorMovieAssignmentForm = {
  director_id: '',
  movie_id: '',
  release_year: '',
}

function DirectorsView() {
  const [directors, setDirectors] = useState<Director[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [directedMovies, setDirectedMovies] = useState<DirectedMovie[]>([])
  const [selectedDirectorId, setSelectedDirectorId] = useState('')
  const [form, setForm] = useState<DirectorForm>(initialForm)
  const [assignmentForm, setAssignmentForm] =
    useState<DirectorMovieAssignmentForm>(initialAssignmentForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isLoadingDirectedMovies, setIsLoadingDirectedMovies] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 1 && form.country.trim().length >= 2
  }, [form])

  const canAssignMovie = useMemo(() => {
    return (
      assignmentForm.director_id.length > 0 &&
      assignmentForm.movie_id.length > 0 &&
      Number.isInteger(Number(assignmentForm.release_year)) &&
      Number(assignmentForm.release_year) >= 1888 &&
      Number(assignmentForm.release_year) <= 2100
    )
  }, [assignmentForm])

  useEffect(() => {
    void loadDirectors()
  }, [])

  async function loadDirectors() {
    setIsLoading(true)
    setError(null)

    try {
      const [directorsData, moviesData] = await Promise.all([
        fetchDirectors(),
        fetchMovies(),
      ])

      setDirectors(directorsData)
      setMovies(moviesData)
      setDirectedMovies([])
      setSelectedDirectorId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateDirector(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const createdDirector = await createDirector({
        name: form.name.trim(),
        country: form.country.trim(),
      })

      setDirectors((currentDirectors) => [...currentDirectors, createdDirector])
      setForm(initialForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAssignDirectorToMovie(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canAssignMovie) {
      return
    }

    setIsAssigning(true)
    setError(null)
    setAssignmentMessage(null)

    try {
      await assignDirectorToMovie({
        director_id: assignmentForm.director_id,
        movie_id: assignmentForm.movie_id,
        release_year: Number(assignmentForm.release_year),
      })

      setAssignmentForm(initialAssignmentForm)
      setAssignmentMessage('Director assigned to movie.')

      if (selectedDirectorId === assignmentForm.director_id) {
        setDirectedMovies(await fetchDirectorMovies(selectedDirectorId))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsAssigning(false)
    }
  }

  async function handleSelectedDirectorChange(directorId: string) {
    setSelectedDirectorId(directorId)
    setDirectedMovies([])
    setError(null)

    if (!directorId) {
      return
    }

    setIsLoadingDirectedMovies(true)

    try {
      setDirectedMovies(await fetchDirectorMovies(directorId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoadingDirectedMovies(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h2>Directors</h2>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadDirectors()}>
          Refresh
        </button>
      </header>

      <div className="directors-layout">
        <div className="directors-side">
          <section className="panel">
            <h3>Add director</h3>
            <form className="director-form" onSubmit={(event) => void handleCreateDirector(event)}>
              <label>
                Name
                <input
                  minLength={1}
                  name="name"
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Roman Polanski"
                  required
                  type="text"
                  value={form.name}
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

              <button className="primary-button" disabled={!canSubmit || isSubmitting} type="submit">
                {isSubmitting ? 'Adding...' : 'Add director'}
              </button>
            </form>
          </section>

          <section className="panel">
            <h3>Assign movie</h3>
            <form
              className="director-form"
              onSubmit={(event) => void handleAssignDirectorToMovie(event)}
            >
              <label>
                Director
                <select
                  disabled={directors.length === 0}
                  name="director_id"
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      director_id: event.target.value,
                    })
                  }
                  required
                  value={assignmentForm.director_id}
                >
                  <option value="">Select director</option>
                  {directors.map((director) => (
                    <option key={director.id} value={director.id}>
                      {director.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Movie
                <select
                  disabled={movies.length === 0}
                  name="movie_id"
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      movie_id: event.target.value,
                    })
                  }
                  required
                  value={assignmentForm.movie_id}
                >
                  <option value="">Select movie</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Release year
                <input
                  max={2100}
                  min={1888}
                  name="release_year"
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      release_year: event.target.value,
                    })
                  }
                  placeholder="2002"
                  required
                  type="number"
                  value={assignmentForm.release_year}
                />
              </label>

              {assignmentMessage ? (
                <p className="message success-message">{assignmentMessage}</p>
              ) : null}

              <button
                className="primary-button"
                disabled={!canAssignMovie || isAssigning}
                type="submit"
              >
                {isAssigning ? 'Assigning...' : 'Assign director'}
              </button>
            </form>
          </section>

          <section className="panel">
            <h3>Directed movies</h3>
            <div className="director-form">
              <label>
                Director
                <select
                  disabled={directors.length === 0}
                  name="selected_director_id"
                  onChange={(event) => void handleSelectedDirectorChange(event.target.value)}
                  value={selectedDirectorId}
                >
                  <option value="">Select director</option>
                  {directors.map((director) => (
                    <option key={director.id} value={director.id}>
                      {director.name}
                    </option>
                  ))}
                </select>
              </label>

              {isLoadingDirectedMovies ? (
                <p className="message">Loading directed movies...</p>
              ) : null}

              {!isLoadingDirectedMovies && selectedDirectorId && directedMovies.length === 0 ? (
                <p className="message">No directed movies assigned.</p>
              ) : null}

              {!isLoadingDirectedMovies && directedMovies.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Year</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {directedMovies.map((directedMovie) => (
                        <tr key={directedMovie.movie.id}>
                          <td>{directedMovie.movie.title}</td>
                          <td>{directedMovie.release_year}</td>
                          <td>{directedMovie.movie.category.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <section className="panel directors-panel">
          <div className="panel-title-row">
            <h3>All directors</h3>
            <span>{directors.length}</span>
          </div>

          {error ? <p className="message error-message">{error}</p> : null}
          {isLoading ? <p className="message">Loading directors...</p> : null}

          {!isLoading && directors.length === 0 ? (
            <p className="message">No directors yet.</p>
          ) : null}

          {!isLoading && directors.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Country</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {directors.map((director) => (
                    <tr key={director.id}>
                      <td>{director.name}</td>
                      <td>{director.country}</td>
                      <td className="muted-cell">{director.id}</td>
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

export default DirectorsView
