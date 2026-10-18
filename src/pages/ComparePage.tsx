import { Link } from 'react-router-dom'
import type { TvmazeShow } from '../api/tvmaze'
import { useSearch } from '../context/SearchContext'
import { compareShowRatings } from '../utils/compareShows'

function ComparisonShow({ show }: { show: TvmazeShow }) {
  const genres = show.genres?.length ? show.genres.join(', ') : 'Not available'
  const language = show.language || 'Not available'
  const rating = show.rating?.average

  return (
    <article className="comparison-show" aria-labelledby={`comparison-show-${show.id}`}>
      <h2 id={`comparison-show-${show.id}`}>{show.name}</h2>
      {show.image?.medium ? (
        <img
          className="comparison-show__image"
          src={show.image.medium}
          alt={`${show.name} poster`}
        />
      ) : (
        <div
          className="comparison-show__image comparison-show__image--empty"
          role="img"
          aria-label={`No image available for ${show.name}`}
        >
          No image available
        </div>
      )}
      <dl>
        <div>
          <dt>Genres</dt>
          <dd>{genres}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>{language}</dd>
        </div>
        <div>
          <dt>Rating</dt>
          <dd>{rating == null ? 'Not available' : rating}</dd>
        </div>
      </dl>
      <Link className="page-link" to={`/shows/${show.id}`}>
        View {show.name} details
      </Link>
    </article>
  )
}

export function ComparePage() {
  const { hasSearched, results, status, errorMessage, comparedShowIds } = useSearch()
  const selectedShows = comparedShowIds
    .map((showId) => results.find(({ show }) => show.id === showId)?.show)
    .filter((show): show is TvmazeShow => show !== undefined)

  let comparisonContent

  if (!hasSearched) {
    comparisonContent = (
      <p className="compare-page__message">
        Search for shows in Explorer before comparing them.
      </p>
    )
  } else if (status === 'loading') {
    comparisonContent = (
      <p className="compare-page__message" role="status" aria-live="polite">
        Search is in progress. You can compare shows when results are ready.
      </p>
    )
  } else if (status === 'error') {
    comparisonContent = (
      <p className="compare-page__message" role="alert">
        {errorMessage}
      </p>
    )
  } else if (results.length === 0) {
    comparisonContent = (
      <p className="compare-page__message">
        The last search returned no shows to compare.
      </p>
    )
  } else if (results.length < 2) {
    comparisonContent = (
      <p className="compare-page__message">
        At least two different shows are needed. Try another search in Explorer.
      </p>
    )
  } else if (selectedShows.length === 0) {
    comparisonContent = (
      <p className="compare-page__message">
        Choose two different shows from the search results to compare them.
      </p>
    )
  } else if (selectedShows.length < 2) {
    comparisonContent = (
      <p className="compare-page__message">
        Choose one more show from the search results to complete the comparison.
      </p>
    )
  } else {
    const [firstShow, secondShow] = selectedShows
    const ratingComparison = compareShowRatings(firstShow, secondShow)

    comparisonContent = (
      <>
        <div className="compare-grid">
          <ComparisonShow show={firstShow} />
          <ComparisonShow show={secondShow} />
        </div>
        <p className="compare-rating-summary" role="status">
          {ratingComparison.kind === 'equal'
            ? 'The ratings are equal.'
            : ratingComparison.kind === 'unavailable'
              ? 'Rating difference is unavailable because one or both ratings are missing.'
              : ratingComparison.kind === 'first-higher'
                ? `${firstShow.name} has the higher rating by ${ratingComparison.difference.toFixed(1)} points.`
                : `${secondShow.name} has the higher rating by ${ratingComparison.difference.toFixed(1)} points.`}
        </p>
      </>
    )
  }

  return (
    <section className="page-content compare-page" aria-labelledby="compare-title">
      <p className="page-eyebrow">Compare shows</p>
      <h1 id="compare-title">Compare</h1>
      {comparisonContent}
      <Link className="page-link" to="/">
        Back to Explorer
      </Link>
    </section>
  )
}