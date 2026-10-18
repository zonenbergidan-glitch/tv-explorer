import type { FormEvent } from 'react'

interface SearchFormProps {
  query: string
  isLoading: boolean
  onQueryChange: (query: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function SearchForm({
  query,
  isLoading,
  onQueryChange,
  onSubmit,
}: SearchFormProps) {
  return (
    <form className="explorer-search" onSubmit={onSubmit} aria-busy={isLoading}>
      <label htmlFor="show-search">Search TV shows</label>
      <div className="explorer-search__controls">
        <input
          id="show-search"
          name="query"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="For example, Girls"
        />
        <button type="submit">Search</button>
      </div>
    </form>
  )
}