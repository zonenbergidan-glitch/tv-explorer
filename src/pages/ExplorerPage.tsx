import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { searchShows } from '../api/tvmaze'
import type { TvmazeSearchResult } from '../api/tvmaze'
import { SearchFeedback, type SearchStatus } from '../components/SearchFeedback'
import { SearchForm } from '../components/SearchForm'
import { SearchResults } from '../components/SearchResults'
import { ShowDetails } from '../components/ShowDetails'

export function ExplorerPage() {
  const [query, setQuery] = useState('')
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<TvmazeSearchResult[]>([])
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const requestId = useRef(0)

  async function runSearch(searchQuery: string) {
    const normalizedQuery = searchQuery.trim()
    const currentRequestId = ++requestId.current

    setLastSearchQuery(normalizedQuery)
    setSelectedShowId(null)
    setResults([])
    setErrorMessage('')

    if (!normalizedQuery) {
      setStatus('idle')
      return
    }

    setStatus('loading')

    try {
      const searchResults = await searchShows(normalizedQuery)
      if (currentRequestId !== requestId.current) {
        return
      }

      setResults(searchResults)
      setStatus('success')
    } catch {
      if (currentRequestId !== requestId.current) {
        return
      }

      setErrorMessage('The search could not be completed. Please try again.')
      setStatus('error')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void runSearch(query)
  }

  const selectedShow = results.find(({ show }) => show.id === selectedShowId)?.show

  return (
    <section className="explorer-page" aria-labelledby="explorer-title">
      <p className="page-eyebrow">Discover something to watch</p>
      <h1 id="explorer-title">Explorer</h1>

      <SearchForm
        query={query}
        isLoading={status === 'loading'}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
      />
      <SearchFeedback
        status={status}
        resultCount={results.length}
        errorMessage={errorMessage}
        onRetry={() => void runSearch(lastSearchQuery)}
      />

      <div className="explorer-layout">
        <SearchResults
          status={status}
          results={results}
          selectedShowId={selectedShowId}
          onSelectShow={setSelectedShowId}
        />

        <section className="show-detail-panel" aria-live="polite">
          {selectedShow ? (
            <ShowDetails show={selectedShow} />
          ) : (
            <p className="show-detail-panel__empty">
              {status === 'success' && results.length > 0
                ? 'Choose a show to see its details.'
                : 'Show details will appear here.'}
            </p>
          )}
        </section>
      </div>
    </section>
  )
}