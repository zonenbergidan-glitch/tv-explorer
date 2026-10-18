import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getShowById, TvmazeApiError } from '../api/tvmaze'
import type { TvmazeShow } from '../api/tvmaze'
import { ShowDetails } from '../components/ShowDetails'

type ShowPageState =
  | { requestKey: string; status: 'loading' }
  | { requestKey: string; status: 'not-found' }
  | { requestKey: string; status: 'error' }
  | { requestKey: string; status: 'success'; show: TvmazeShow }

function parseShowId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null
  }

  const showId = Number(value)
  return Number.isSafeInteger(showId) && showId > 0 ? showId : null
}

export function ShowPage() {
  const { showId: showIdParam } = useParams<{ showId: string }>()
  const showId = parseShowId(showIdParam)
  const [retryCount, setRetryCount] = useState(0)
  const [loadState, setLoadState] = useState<ShowPageState | null>(null)
  const requestKey = `${showIdParam ?? ''}:${retryCount}`

  useEffect(() => {
    if (showId === null) {
      return
    }

    let isCurrentRequest = true

    void getShowById(showId)
      .then((show) => {
        if (isCurrentRequest) {
          setLoadState({ requestKey, status: 'success', show })
        }
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return
        }

        setLoadState({
          requestKey,
          status:
            error instanceof TvmazeApiError && error.status === 404
              ? 'not-found'
              : 'error',
        })
      })

    return () => {
      isCurrentRequest = false
    }
  }, [requestKey, showId])

  const currentState: ShowPageState | { status: 'invalid' } =
    showId === null
      ? { status: 'invalid' }
      : loadState?.requestKey === requestKey
        ? loadState
        : { requestKey, status: 'loading' }

  return (
    <section className="page-content show-page" aria-labelledby="show-page-title">
      <p className="page-eyebrow">TVmaze show</p>
      {currentState.status === 'invalid' ? (
        <>
          <h1 id="show-page-title">Invalid show ID</h1>
          <p className="show-page__message" role="alert">
            The show ID must be a positive whole number.
          </p>
        </>
      ) : currentState.status === 'loading' ? (
        <>
          <h1 id="show-page-title">Show details</h1>
          <p className="show-page__message" role="status" aria-live="polite">
            Loading show details...
          </p>
        </>
      ) : currentState.status === 'not-found' ? (
        <>
          <h1 id="show-page-title">Show not found</h1>
          <p className="show-page__message" role="status">
            TVmaze does not have a show with this ID.
          </p>
        </>
      ) : currentState.status === 'error' ? (
        <>
          <h1 id="show-page-title">Could not load show</h1>
          <p className="show-page__message show-page__error" role="alert">
            There was a problem loading this show. Please try again.
          </p>
          <button
            className="show-page__retry"
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </>
      ) : (
        <>
          <h1 id="show-page-title">{currentState.show.name}</h1>
          <ShowDetails show={currentState.show} />
        </>
      )}
      <Link className="page-link" to="/">
        Back to Explorer
      </Link>
    </section>
  )
}