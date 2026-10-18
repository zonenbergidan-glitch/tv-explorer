import type { TvmazeShow } from '../api/tvmaze'

interface ShowDetailsProps {
  show: TvmazeShow
}

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

export function ShowDetails({ show }: ShowDetailsProps) {
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