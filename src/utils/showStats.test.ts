import { describe, expect, it } from 'vitest'
import type { TvmazeSearchResult } from '../api/tvmaze'
import { summarizeShowResults } from './showStats'

function makeResult(
  id: number,
  fields: Partial<TvmazeSearchResult['show']> = {},
): TvmazeSearchResult {
  return {
    score: 1,
    show: { id, name: `Show ${id}`, ...fields },
  }
}

describe('summarizeShowResults', () => {
  it('returns empty statistics for no results', () => {
    expect(summarizeShowResults([])).toEqual({
      totalShows: 0,
      ratedShows: 0,
      unratedShows: 0,
      averageRating: null,
      languages: [],
      genres: [],
    })
  })

  it('averages finite numeric ratings only and includes zero', () => {
    const stats = summarizeShowResults([
      makeResult(1, { rating: { average: 0 } }),
      makeResult(2, { rating: { average: 8 } }),
      makeResult(3, { rating: { average: null } }),
      makeResult(4, { rating: { average: Number.NaN } }),
    ])

    expect(stats.ratedShows).toBe(2)
    expect(stats.unratedShows).toBe(2)
    expect(stats.averageRating).toBe(4)
  })

  it('returns no average when all ratings are missing', () => {
    const stats = summarizeShowResults([
      makeResult(1, { rating: null }),
      makeResult(2),
    ])

    expect(stats.averageRating).toBeNull()
    expect(stats.ratedShows).toBe(0)
    expect(stats.unratedShows).toBe(2)
  })

  it('counts a show once in each genre and allows multi-genre totals above show count', () => {
    const stats = summarizeShowResults([
      makeResult(1, { genres: ['Drama', 'Comedy', 'Drama'] }),
      makeResult(2, { genres: ['Drama'] }),
    ])

    expect(stats.genres).toEqual([
      { label: 'Comedy', count: 1 },
      { label: 'Drama', count: 2 },
    ])
    expect(stats.genres.reduce((total, entry) => total + entry.count, 0)).toBeGreaterThan(
      stats.totalShows,
    )
  })

  it('groups missing languages and genres under a final fallback category', () => {
    const stats = summarizeShowResults([
      makeResult(1, { language: ' French ', genres: null }),
      makeResult(2, { language: null, genres: [] }),
      makeResult(3, { language: 'English', genres: ['Drama', ' '] }),
    ])

    expect(stats.languages).toEqual([
      { label: 'English', count: 1 },
      { label: 'French', count: 1 },
      { label: 'Not available', count: 1 },
    ])
    expect(stats.genres).toEqual([
      { label: 'Drama', count: 1 },
      { label: 'Not available', count: 2 },
    ])
  })

  it('sorts distributions consistently regardless of result order', () => {
    const stats = summarizeShowResults([
      makeResult(1, { language: 'Spanish', genres: ['Zebra'] }),
      makeResult(2, { language: 'Arabic', genres: ['Action'] }),
    ])

    expect(stats.languages.map(({ label }) => label)).toEqual(['Arabic', 'Spanish'])
    expect(stats.genres.map(({ label }) => label)).toEqual(['Action', 'Zebra'])
  })
})