import type { TvmazeShow } from '../api/tvmaze'

export type RatingComparison =
  | { kind: 'first-higher'; difference: number }
  | { kind: 'second-higher'; difference: number }
  | { kind: 'equal' }
  | { kind: 'unavailable' }

export function compareShowRatings(
  firstShow: TvmazeShow,
  secondShow: TvmazeShow,
): RatingComparison {
  const firstRating = firstShow.rating?.average
  const secondRating = secondShow.rating?.average

  if (firstRating == null || secondRating == null) {
    return { kind: 'unavailable' }
  }

  if (firstRating === secondRating) {
    return { kind: 'equal' }
  }

  if (firstRating > secondRating) {
    return { kind: 'first-higher', difference: firstRating - secondRating }
  }

  return { kind: 'second-higher', difference: secondRating - firstRating }
}