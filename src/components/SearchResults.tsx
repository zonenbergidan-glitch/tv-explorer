import type { TvmazeSearchResult } from '../api/tvmaze'
import { Link } from 'react-router-dom'
import type { SearchStatus } from '../context/SearchContext'

interface SearchResultsProps {
  status: SearchStatus
  results: TvmazeSearchResult[]
  selectedShowId: number | null
  comparedShowIds: number[]
  onSelectShow: (showId: number) => void
  onToggleComparedShow: (showId: number) => void
}

export function SearchResults({
  status,
  results,
  selectedShowId,
  comparedShowIds,
  onSelectShow,
  onToggleComparedShow,
}: SearchResultsProps) {
  const hasTwoComparedShows = comparedShowIds.length >= 2

  return (
    <section
      className="show-results"
      aria-labelledby="results-title"
      aria-busy={status === 'loading'}
    >
      <h2 id="results-title">Search results</h2>
      {status === 'idle' && <p>Search for a show to see matching results.</p>}
      {status === 'success' && results.length > 0 && (
        <>
          <ul className="show-results__list">
            {results.map(({ show }) => {
              const isCompared = comparedShowIds.includes(show.id)

              return (
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
                    <label className="show-results__compare-control">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        disabled={!isCompared && hasTwoComparedShows}
                        aria-label={`${isCompared ? 'Remove' : 'Compare'} ${show.name} ${isCompared ? 'from' : 'in'} comparison`}
                        onChange={() => onToggleComparedShow(show.id)}
                      />
                      <span>Compare</span>
                    </label>
                    <Link
                      className="show-results__details-link"
                      to={`/shows/${show.id}`}
                    >
                      Full details
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
          {hasTwoComparedShows && (
            <p className="compare-limit-message" role="status">
              Two shows are selected. Remove one selection to choose another.
            </p>
          )}
          <Link className="compare-results-link" to="/compare">
            Compare selected shows ({comparedShowIds.length}/2)
          </Link>
        </>
      )}
    </section>
  )
}