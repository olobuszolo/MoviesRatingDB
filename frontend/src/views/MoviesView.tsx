import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { fetchCategories } from '../api/categories'
import { createMovie, fetchMovieRecommendations, fetchMovies } from '../api/movies'
import { createOpinion, fetchMovieOpinions } from '../api/opinions'
import { fetchUsers } from '../api/users'
import type { Category } from '../types/category'
import type { Movie, MovieForm, MovieRecommendation } from '../types/movie'
import type { MovieOpinion, OpinionForm } from '../types/opinion'
import type { User } from '../types/user'
import './MoviesView.css'

const initialForm: MovieForm = {
  title: '',
  duration_minutes: '',
  category_id: '',
}

const initialOpinionForm: OpinionForm = {
  user_id: '',
  movie_id: '',
  score: '',
  platform: '',
}

const scores = Array.from({ length: 10 }, (_, index) => String(index + 1))
const platforms = ['Netflix', 'HBO', 'Amazon', 'Disney', 'TV']

function MoviesView() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [movieOpinions, setMovieOpinions] = useState<MovieOpinion[]>([])
  const [movieRecommendations, setMovieRecommendations] = useState<MovieRecommendation[]>([])
  const [selectedOpinionMovieId, setSelectedOpinionMovieId] = useState('')
  const [selectedRecommendationMovieId, setSelectedRecommendationMovieId] = useState('')
  const [form, setForm] = useState<MovieForm>(initialForm)
  const [opinionForm, setOpinionForm] = useState<OpinionForm>(initialOpinionForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddingOpinion, setIsAddingOpinion] = useState(false)
  const [isLoadingOpinions, setIsLoadingOpinions] = useState(false)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [opinionMessage, setOpinionMessage] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length >= 1 &&
      Number.isInteger(Number(form.duration_minutes)) &&
      Number(form.duration_minutes) >= 1 &&
      Number(form.duration_minutes) <= 500 &&
      form.category_id.length > 0
    )
  }, [form])

  const canAddOpinion = useMemo(() => {
    return (
      opinionForm.user_id.length > 0 &&
      opinionForm.movie_id.length > 0 &&
      Number.isInteger(Number(opinionForm.score)) &&
      Number(opinionForm.score) >= 1 &&
      Number(opinionForm.score) <= 10 &&
      opinionForm.platform.length > 0
    )
  }, [opinionForm])

  useEffect(() => {
    void loadMoviesData()
  }, [])

  async function loadMoviesData() {
    setIsLoading(true)
    setError(null)

    try {
      const [moviesData, categoriesData, usersData] = await Promise.all([
        fetchMovies(),
        fetchCategories(),
        fetchUsers(),
      ])

      setMovies(moviesData)
      setCategories(categoriesData)
      setUsers(usersData)
      setMovieOpinions([])
      setMovieRecommendations([])
      setSelectedOpinionMovieId('')
      setSelectedRecommendationMovieId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateOpinion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canAddOpinion) {
      return
    }

    setIsAddingOpinion(true)
    setError(null)
    setOpinionMessage(null)

    try {
      await createOpinion({
        user_id: opinionForm.user_id,
        movie_id: opinionForm.movie_id,
        score: Number(opinionForm.score),
        platform: opinionForm.platform,
      })

      setOpinionForm(initialOpinionForm)
      setOpinionMessage('Opinion added.')

      if (selectedOpinionMovieId === opinionForm.movie_id) {
        setMovieOpinions(await fetchMovieOpinions(selectedOpinionMovieId))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsAddingOpinion(false)
    }
  }

  async function handleSelectedOpinionMovieChange(movieId: string) {
    setSelectedOpinionMovieId(movieId)
    setMovieOpinions([])
    setError(null)

    if (!movieId) {
      return
    }

    setIsLoadingOpinions(true)

    try {
      setMovieOpinions(await fetchMovieOpinions(movieId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoadingOpinions(false)
    }
  }

  async function handleSelectedRecommendationMovieChange(movieId: string) {
    setSelectedRecommendationMovieId(movieId)
    setMovieRecommendations([])
    setError(null)

    if (!movieId) {
      return
    }

    setIsLoadingRecommendations(true)

    try {
      setMovieRecommendations(await fetchMovieRecommendations(movieId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoadingRecommendations(false)
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
        <div className="movies-side">
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

          <section className="panel">
            <h3>Add opinion</h3>
            <form className="movie-form" onSubmit={(event) => void handleCreateOpinion(event)}>
              <label>
                User
                <select
                  disabled={users.length === 0}
                  name="user_id"
                  onChange={(event) =>
                    setOpinionForm({ ...opinionForm, user_id: event.target.value })
                  }
                  required
                  value={opinionForm.user_id}
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
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
                    setOpinionForm({ ...opinionForm, movie_id: event.target.value })
                  }
                  required
                  value={opinionForm.movie_id}
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
                Score
                <select
                  name="score"
                  onChange={(event) =>
                    setOpinionForm({ ...opinionForm, score: event.target.value })
                  }
                  required
                  value={opinionForm.score}
                >
                  <option value="">Select score</option>
                  {scores.map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Platform
                <select
                  name="platform"
                  onChange={(event) =>
                    setOpinionForm({ ...opinionForm, platform: event.target.value })
                  }
                  required
                  value={opinionForm.platform}
                >
                  <option value="">Select platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>

              {opinionMessage ? <p className="message success-message">{opinionMessage}</p> : null}

              <button
                className="primary-button"
                disabled={!canAddOpinion || isAddingOpinion}
                type="submit"
              >
                {isAddingOpinion ? 'Adding...' : 'Add opinion'}
              </button>
            </form>
          </section>

          <section className="panel">
            <h3>Movie opinions</h3>
            <div className="movie-form">
              <label>
                Movie
                <select
                  disabled={movies.length === 0}
                  name="selected_opinion_movie_id"
                  onChange={(event) => void handleSelectedOpinionMovieChange(event.target.value)}
                  value={selectedOpinionMovieId}
                >
                  <option value="">Select movie</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </label>

              {isLoadingOpinions ? <p className="message">Loading opinions...</p> : null}

              {!isLoadingOpinions && selectedOpinionMovieId && movieOpinions.length === 0 ? (
                <p className="message">No opinions for this movie.</p>
              ) : null}

              {!isLoadingOpinions && movieOpinions.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Score</th>
                        <th>Platform</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movieOpinions.map((opinion) => (
                        <tr key={`${opinion.username}-${opinion.platform}`}>
                          <td>{opinion.username}</td>
                          <td>{opinion.score}</td>
                          <td>{opinion.platform}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </section>

          <section className="panel">
            <h3>Recommendations</h3>
            <div className="movie-form">
              <label>
                Source movie
                <select
                  disabled={movies.length === 0}
                  name="selected_recommendation_movie_id"
                  onChange={(event) =>
                    void handleSelectedRecommendationMovieChange(event.target.value)
                  }
                  value={selectedRecommendationMovieId}
                >
                  <option value="">Select movie</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </label>

              {isLoadingRecommendations ? (
                <p className="message">Loading recommendations...</p>
              ) : null}

              {!isLoadingRecommendations &&
              selectedRecommendationMovieId &&
              movieRecommendations.length === 0 ? (
                <p className="message">No recommendations for this movie.</p>
              ) : null}

              {!isLoadingRecommendations && movieRecommendations.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Movie</th>
                        <th>User</th>
                        <th>Score</th>
                        <th>Platform</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movieRecommendations.map((recommendation) => (
                        <tr key={recommendation.movie.id}>
                          <td>{recommendation.movie.title}</td>
                          <td>{recommendation.recommended_by}</td>
                          <td>{recommendation.user_score}</td>
                          <td>{recommendation.platform}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </section>
        </div>

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
