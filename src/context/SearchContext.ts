import { createContext, useContext } from 'react'
import type { TvmazeSearchResult } from '../api/tvmaze'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SearchContextValue {
  query: string
  lastSearchQuery: string
  results: TvmazeSearchResult[]
  status: SearchStatus
  errorMessage: string
  hasSearched: boolean
  setQuery: (query: string) => void
  submitSearch: () => void
  retrySearch: () => void
}

export const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }

  return context
}