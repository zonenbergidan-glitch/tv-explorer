import { useEffect, useReducer, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import { searchShows } from '../api/tvmaze'
import type { TvmazeSearchResult } from '../api/tvmaze'
import { SearchContext } from './SearchContext'
import type { SearchContextValue, SearchStatus } from './SearchContext'

interface SearchState {
  query: string
  lastSearchQuery: string
  requestQuery: string
  requestId: number
  results: TvmazeSearchResult[]
  status: SearchStatus
  errorMessage: string
  hasSearched: boolean
  comparedShowIds: number[]
}

type SearchAction =
  | { type: 'query-changed'; query: string }
  | { type: 'search-started'; query: string; requestId: number }
  | { type: 'search-succeeded'; results: TvmazeSearchResult[]; requestId: number }
  | { type: 'search-failed'; errorMessage: string; requestId: number }
  | { type: 'comparison-toggled'; showId: number }

const initialState: SearchState = {
  query: '',
  lastSearchQuery: '',
  requestQuery: '',
  requestId: 0,
  results: [],
  status: 'idle',
  errorMessage: '',
  hasSearched: false,
  comparedShowIds: [],
}

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'query-changed':
      return { ...state, query: action.query }
    case 'search-started':
      return {
        ...state,
        lastSearchQuery: action.query,
        requestQuery: action.query,
        requestId: action.requestId,
        results: [],
        status: action.query ? 'loading' : 'idle',
        errorMessage: '',
        hasSearched: Boolean(action.query),
        comparedShowIds: [],
      }
    case 'search-succeeded':
      if (action.requestId !== state.requestId) {
        return state
      }

      return {
        ...state,
        results: action.results,
        status: 'success',
      }
    case 'search-failed':
      if (action.requestId !== state.requestId) {
        return state
      }

      return {
        ...state,
        errorMessage: action.errorMessage,
        status: 'error',
      }
    case 'comparison-toggled': {
      if (!state.results.some(({ show }) => show.id === action.showId)) {
        return state
      }

      if (state.comparedShowIds.includes(action.showId)) {
        return {
          ...state,
          comparedShowIds: state.comparedShowIds.filter(
            (showId) => showId !== action.showId,
          ),
        }
      }

      if (state.comparedShowIds.length >= 2) {
        return state
      }

      return {
        ...state,
        comparedShowIds: [...state.comparedShowIds, action.showId],
      }
    }
  }
}

export function SearchProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(searchReducer, initialState)
  const nextRequestId = useRef(0)

  useEffect(() => {
    if (!state.requestQuery) {
      return
    }

    const requestId = state.requestId
    let isCurrentRequest = true

    void searchShows(state.requestQuery)
      .then((results) => {
        if (isCurrentRequest) {
          dispatch({ type: 'search-succeeded', results, requestId })
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          dispatch({
            type: 'search-failed',
            errorMessage: 'The search could not be completed. Please try again.',
            requestId,
          })
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [state.requestId, state.requestQuery])

  function startSearch(query: string) {
    dispatch({
      type: 'search-started',
      query: query.trim(),
      requestId: ++nextRequestId.current,
    })
  }

  const contextValue: SearchContextValue = {
    query: state.query,
    lastSearchQuery: state.lastSearchQuery,
    results: state.results,
    status: state.status,
    errorMessage: state.errorMessage,
    hasSearched: state.hasSearched,
    comparedShowIds: state.comparedShowIds,
    setQuery: (query) => dispatch({ type: 'query-changed', query }),
    submitSearch: () => startSearch(state.query),
    retrySearch: () => startSearch(state.lastSearchQuery),
    toggleComparedShow: (showId) =>
      dispatch({ type: 'comparison-toggled', showId }),
  }

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  )
}