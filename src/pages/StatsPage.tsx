import { Link } from 'react-router-dom'
import { useSearch } from '../context/SearchContext'
import { summarizeShowResults } from '../utils/showStats'
import type { DistributionEntry } from '../utils/showStats'

interface DistributionListProps {
  title: string
  entries: DistributionEntry[]
}

function DistributionList({ title, entries }: DistributionListProps) {
  const headingId = `stats-${title.toLowerCase()}`

  return (
    <section className="stats-distribution" aria-labelledby={headingId}>
      <h2 id={headingId}>By {title}</h2>
      {entries.length === 0 ? (
        <p>No {title.toLowerCase()} data available.</p>
      ) : (
        <ul>
          {entries.map(({ label, count }) => (
            <li key={label}>
              <span>{label}</span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function StatsPage() {
  const { hasSearched, lastSearchQuery, results, status, errorMessage } = useSearch()
  const stats = summarizeShowResults(results)

  let content

  if (!hasSearched) {
    content = <p className="stats-message">Search for shows in Explorer to see statistics.</p>
  } else if (status === 'loading') {
    content = (
      <p className="stats-message" role="status" aria-live="polite">
        Search is in progress. Statistics will appear when it finishes.
      </p>
    )
  } else if (status === 'error') {
    content = (
      <p className="stats-message" role="alert">
        {errorMessage}
      </p>
    )
  } else if (results.length === 0) {
    content = <p className="stats-message">The last search returned no shows.</p>
  } else {
    content = (
      <>
        <p className="stats-query">
          Last search: <q>{lastSearchQuery}</q>
        </p>
        <dl className="stats-metrics" aria-label="Current search summary">
          <div className="stats-metric">
            <dt>Shows in results</dt>
            <dd>{stats.totalShows}</dd>
          </div>
          <div className="stats-metric">
            <dt>Shows with ratings</dt>
            <dd>{stats.ratedShows}</dd>
          </div>
          <div className="stats-metric">
            <dt>Shows without ratings</dt>
            <dd>{stats.unratedShows}</dd>
          </div>
          <div className="stats-metric">
            <dt>Average available rating</dt>
            <dd>
              {stats.averageRating === null
                ? 'No ratings available'
                : stats.averageRating.toFixed(1)}
            </dd>
          </div>
        </dl>
        <p className="stats-scope-note">
          These statistics describe only the current search results, not the full TVmaze catalog.
        </p>
        <p className="stats-scope-note">
          A show can belong to more than one genre, so genre counts can add up to more than the
          number of shows.
        </p>
        <div className="stats-distributions">
          <DistributionList title="Language" entries={stats.languages} />
          <DistributionList title="Genre" entries={stats.genres} />
        </div>
      </>
    )
  }

  return (
    <section className="page-content stats-page" aria-labelledby="stats-title">
      <p className="page-eyebrow">Current search</p>
      <h1 id="stats-title">Statistics</h1>
      {content}
      <Link className="page-link" to="/">
        Go to Explorer
      </Link>
    </section>
  )
}