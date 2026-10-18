import type { TvmazeSearchResult } from '../api/tvmaze'

export interface DistributionEntry {
  label: string
  count: number
}

export interface ShowSearchStats {
  totalShows: number
  ratedShows: number
  unratedShows: number
  averageRating: number | null
  languages: DistributionEntry[]
  genres: DistributionEntry[]
}

const MISSING_VALUE = 'Not available'

function normalizeValue(value: string | null | undefined): string | null {
  const normalizedValue = value?.trim()
  return normalizedValue || null
}

function sortedDistribution(counts: Map<string, number>): DistributionEntry[] {
  return [...counts.entries()]
    .sort(([first], [second]) => {
      if (first === MISSING_VALUE) return second === MISSING_VALUE ? 0 : 1
      if (second === MISSING_VALUE) return -1
      return first.localeCompare(second, 'en', { sensitivity: 'base' })
    })
    .map(([label, count]) => ({ label, count }))
}

export function summarizeShowResults(
  results: readonly TvmazeSearchResult[],
): ShowSearchStats {
  const ratings = results
    .map(({ show }) => show.rating?.average)
    .filter((rating): rating is number =>
      typeof rating === 'number' && Number.isFinite(rating),
    )
  const languageCounts = new Map<string, number>()
  const genreCounts = new Map<string, number>()

  for (const { show } of results) {
    const language = normalizeValue(show.language) ?? MISSING_VALUE
    languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1)

    const genres = [
      ...new Set(
        (show.genres ?? [])
          .map((genre) => normalizeValue(genre))
          .filter((genre): genre is string => genre !== null),
      ),
    ]

    if (genres.length === 0) {
      genreCounts.set(MISSING_VALUE, (genreCounts.get(MISSING_VALUE) ?? 0) + 1)
    } else {
      for (const genre of genres) {
        genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1)
      }
    }
  }

  return {
    totalShows: results.length,
    ratedShows: ratings.length,
    unratedShows: results.length - ratings.length,
    averageRating:
      ratings.length > 0
        ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
        : null,
    languages: sortedDistribution(languageCounts),
    genres: sortedDistribution(genreCounts),
  }
}