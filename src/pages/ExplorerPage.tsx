import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearch } from '../context/SearchContext'
import { SearchFeedback } from '../components/SearchFeedback'
import { SearchForm } from '../components/SearchForm'
import { SearchResults } from '../components/SearchResults'
import { ShowDetails } from '../components/ShowDetails'

export function ExplorerPage() {
  const {
    query,
    results,
    status,
    errorMessage,
    comparedShowIds,
    setQuery,
    submitSearch,
    retrySearch,
    toggleComparedShow,
  } = useSearch()
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSelectedShowId(null)
    submitSearch()
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
        onRetry={() => {
          setSelectedShowId(null)
          retrySearch()
        }}
      />

      <div className="explorer-layout">
        <SearchResults
          status={status}
          results={results}
          selectedShowId={selectedShowId}
          comparedShowIds={comparedShowIds}
          onSelectShow={setSelectedShowId}
          onToggleComparedShow={toggleComparedShow}
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