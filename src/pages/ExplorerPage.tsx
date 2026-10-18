import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { searchShows } from '../api/tvmaze'
import type { TvmazeSearchResult, TvmazeShow } from '../api/tvmaze'

type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

function getPlainTextSummary(summary: string | null | undefined): string {
  if (!summary) {
    return 'No summary available.'
  }

  const parsedSummary = new DOMParser().parseFromString(summary, 'text/html')
  parsedSummary.querySelectorAll('script, style').forEach((element) => element.remove())
  return (
    parsedSummary.body.textContent?.replace(/\s+/g, ' ').trim() ||
    'No summary available.'
  )
}

function ShowDetails({ show }: { show: TvmazeShow }) {
  const rating = show.rating?.average

  return (
    <section className="show-detail" aria-labelledby="details-title">
      <h2 id="details-title">Show details</h2>
      <div className="show-detail__heading">
        {show.image?.medium ? (
          <img className="show-detail__poster" src={show.image.medium} alt={`${show.name} poster`} />
        ) : (
          <div className="show-detail__poster show-detail__poster--empty" aria-label="No image available">
            No image
          </div>
        )}
        <div>
          <h3>{show.name}</h3>
          <dl className="show-facts">
            <div>
              <dt>Genres</dt>
              <dd>{show.genres?.length ? show.genres.join(', ') : 'Not available'}</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>{show.language || 'Not available'}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>{rating == null ? 'Not available' : rating}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="show-summary">
        <h3>Summary</h3>
        <p>{getPlainTextSummary(show.summary)}</p>
      </div>
    </section>
  )
}

export function ExplorerPage() {
  const [query, setQuery] = useState('')
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<TvmazeSearchResult[]>([])
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const requestId = useRef(0)

  async function runSearch(searchQuery: string) {
    const normalizedQuery = searchQuery.trim()
    const currentRequestId = ++requestId.current

    setLastSearchQuery(normalizedQuery)
    setSelectedShowId(null)
    setResults([])
    setErrorMessage('')

    if (!normalizedQuery) {
      setStatus('idle')
      return
    }

    setStatus('loading')

    try {
      const searchResults = await searchShows(normalizedQuery)
      if (currentRequestId !== requestId.current) {
        return
      }

      setResults(searchResults)
      setStatus('success')
    } catch {
      if (currentRequestId !== requestId.current) {
        return
      }

      setErrorMessage('The search could not be completed. Please try again.')
      setStatus('error')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void runSearch(query)
  }

  const selectedShow = results.find(({ show }) => show.id === selectedShowId)?.show

  return (
    <section className="explorer-page" aria-labelledby="explorer-title">
      <p className="page-eyebrow">Discover something to watch</p>
      <h1 id="explorer-title">Explorer</h1>

      <form className="explorer-search" onSubmit={handleSubmit} aria-busy={status === 'loading'}>
        <label htmlFor="show-search">Search TV shows</label>
        <div className="explorer-search__controls">
          <input
            id="show-search"
            name="query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="For example, Girls"
          />
          <button type="submit">Search</button>
        </div>
      </form>

      {status === 'loading' && (
        <p className="search-message" role="status" aria-live="polite">
          Searching TVmaze...
        </p>
      )}
      {status === 'error' && (
        <div className="search-error" role="alert">
          <p>{errorMessage}</p>
          <button type="button" onClick={() => void runSearch(lastSearchQuery)}>
            Try again
          </button>
        </div>
      )}
      {status === 'success' && results.length === 0 && (
        <p className="search-message" role="status">
          No shows found. Try a different search.
        </p>
      )}

      <div className="explorer-layout">
        <section className="show-results" aria-labelledby="results-title" aria-busy={status === 'loading'}>
          <h2 id="results-title">Search results</h2>
          {status === 'idle' && <p>Search for a show to see matching results.</p>}
          {status === 'success' && results.length > 0 && (
            <ul className="show-results__list">
              {results.map(({ show }) => (
                <li key={show.id}>
                  <button
                    className="show-results__button"
                    type="button"
                    aria-pressed={selectedShowId === show.id}
                    onClick={() => setSelectedShowId(show.id)}
                  >
                    <span>{show.name}</span>
                    <span className="show-results__meta">
                      {show.language ?? 'TV show'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="show-detail-panel" aria-live="polite">
          {selectedShow ? (
            <ShowDetails show={selectedShow} />
          ) : (
            <p className="show-detail-panel__empty">
              {status === 'success' && results.length > 0
                ? 'Choose a show to see its details.'
                : 'Show details will appear here.'}
            </p>
          )}
        </section>
      </div>
    </section>
  )
}