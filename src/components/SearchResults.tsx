import type { TvmazeSearchResult } from '../api/tvmaze'
import { Link } from 'react-router-dom'
import type { SearchStatus } from '../context/SearchContext'

interface SearchResultsProps {
  status: SearchStatus
  results: TvmazeSearchResult[]
  selectedShowId: number | null
  onSelectShow: (showId: number) => void
}

export function SearchResults({
  status,
  results,
  selectedShowId,
  onSelectShow,
}: SearchResultsProps) {
  return (
    <section
      className="show-results"
      aria-labelledby="results-title"
      aria-busy={status === 'loading'}
    >
      <h2 id="results-title">Search results</h2>
      {status === 'idle' && <p>Search for a show to see matching results.</p>}
      {status === 'success' && results.length > 0 && (
        <ul className="show-results__list">
          {results.map(({ show }) => (
            <li key={show.id}>
              <div className="show-results__item">
                <button
                  className="show-results__button"
                  type="button"
                  aria-pressed={selectedShowId === show.id}
                  onClick={() => onSelectShow(show.id)}
                >
                  <span>{show.name}</span>
                  <span className="show-results__meta">
                    {show.language ?? 'TV show'}
                  </span>
                </button>
                <Link
                  className="show-results__details-link"
                  to={`/shows/${show.id}`}
                >
                  Full details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}