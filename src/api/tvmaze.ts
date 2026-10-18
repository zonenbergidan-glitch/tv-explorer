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

const TVMAZE_SEARCH_URL = 'https://api.tvmaze.com/search/shows'

export async function searchShows(query: string): Promise<TvmazeSearchResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const searchParams = new URLSearchParams({ q: trimmedQuery })
  const response = await fetch(`${TVMAZE_SEARCH_URL}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(`TVmaze search failed with HTTP ${response.status}`)
  }

  return (await response.json()) as TvmazeSearchResult[]
}