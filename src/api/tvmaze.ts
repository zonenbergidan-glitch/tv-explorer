export interface TvmazeShow {
  id: number
  name: string
  url?: string | null
  genres?: string[] | null
  language?: string | null
  rating?: { average: number | null } | null
  image?: { medium?: string | null; original?: string | null } | null
  summary?: string | null
}

export interface TvmazeSearchResult {
  score: number
  show: TvmazeShow
}

export class TvmazeApiError extends Error {
  readonly status: number

  constructor(
    status: number,
    message = `TVmaze request failed with HTTP ${status}`,
  ) {
    super(message)
    this.name = 'TvmazeApiError'
    this.status = status
  }
}

const TVMAZE_SEARCH_URL = 'https://api.tvmaze.com/search/shows'
const TVMAZE_SHOWS_URL = 'https://api.tvmaze.com/shows'

export async function searchShows(query: string): Promise<TvmazeSearchResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const searchParams = new URLSearchParams({ q: trimmedQuery })
  const response = await fetch(`${TVMAZE_SEARCH_URL}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new TvmazeApiError(
      response.status,
      `TVmaze search failed with HTTP ${response.status}`,
    )
  }

  return (await response.json()) as TvmazeSearchResult[]
}

export async function getShowById(showId: number): Promise<TvmazeShow> {
  if (!Number.isSafeInteger(showId) || showId <= 0) {
    throw new RangeError('Show ID must be a positive integer')
  }

  const response = await fetch(`${TVMAZE_SHOWS_URL}/${showId}`)

  if (!response.ok) {
    throw new TvmazeApiError(response.status)
  }

  return (await response.json()) as TvmazeShow
}