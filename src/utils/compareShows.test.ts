import { describe, expect, it } from 'vitest'
import type { TvmazeShow } from '../api/tvmaze'
import { compareShowRatings } from './compareShows'

function makeShow(id: number, name: string, rating: number | null): TvmazeShow {
  return { id, name, rating: { average: rating } }
}

describe('compareShowRatings', () => {
  it('returns the first show and difference when its rating is higher', () => {
    expect(
      compareShowRatings(makeShow(1, 'First', 8), makeShow(2, 'Second', 6.5)),
    ).toEqual({ kind: 'first-higher', difference: 1.5 })
  })

  it('returns the second show and difference when its rating is higher', () => {
    expect(
      compareShowRatings(makeShow(1, 'First', 6), makeShow(2, 'Second', 7)),
    ).toEqual({ kind: 'second-higher', difference: 1 })
  })

  it('reports equal ratings', () => {
    expect(
      compareShowRatings(makeShow(1, 'First', 7), makeShow(2, 'Second', 7)),
    ).toEqual({ kind: 'equal' })
  })

  it('does not treat a missing first rating as zero', () => {
    expect(
      compareShowRatings(makeShow(1, 'First', null), makeShow(2, 'Second', 7)),
    ).toEqual({ kind: 'unavailable' })
  })

  it('does not treat a missing second rating as zero', () => {
    expect(
      compareShowRatings(makeShow(1, 'First', 7), makeShow(2, 'Second', null)),
    ).toEqual({ kind: 'unavailable' })
  })
})