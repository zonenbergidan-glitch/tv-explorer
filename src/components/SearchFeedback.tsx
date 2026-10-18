import type { SearchStatus } from '../context/SearchContext'

interface SearchFeedbackProps {
  status: SearchStatus
  resultCount: number
  errorMessage: string
  onRetry: () => void
}

export function SearchFeedback({
  status,
  resultCount,
  errorMessage,
  onRetry,
}: SearchFeedbackProps) {
  if (status === 'loading') {
    return (
      <p className="search-message" role="status" aria-live="polite">
        Searching TVmaze...
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="search-error" role="alert">
        <p>{errorMessage}</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  if (status === 'success' && resultCount === 0) {
    return (
      <p className="search-message" role="status">
        No shows found. Try a different search.
      </p>
    )
  }

  return null
}