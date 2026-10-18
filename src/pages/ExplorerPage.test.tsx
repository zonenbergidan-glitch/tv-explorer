import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { searchShows } from '../api/tvmaze'
import type { TvmazeSearchResult } from '../api/tvmaze'
import { SearchProvider } from '../context/SearchProvider'
import { ExplorerPage } from './ExplorerPage'

vi.mock('../api/tvmaze', () => ({
  searchShows: vi.fn(),
}))

const mockSearchShows = vi.mocked(searchShows)

function renderExplorerPage() {
  return render(
    <MemoryRouter>
      <SearchProvider>
        <ExplorerPage />
      </SearchProvider>
    </MemoryRouter>,
  )
}

function makeResult(
  id: number,
  name: string,
  showFields: Partial<TvmazeSearchResult['show']> = {},
): TvmazeSearchResult {
  return {
    score: 1,
    show: {
      id,
      name,
      ...showFields,
    },
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

beforeEach(() => {
  mockSearchShows.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ExplorerPage', () => {
  it('shows the labeled search form and the initial guidance', async () => {
    const user = userEvent.setup()
    renderExplorerPage()

    expect(screen.getByRole('searchbox', { name: 'Search TV shows' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Search' })).toBeVisible()
    expect(screen.getByText('Search for a show to see matching results.')).toBeVisible()
    expect(mockSearchShows).not.toHaveBeenCalled()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search TV shows' }),
      'typing does not search',
    )
    expect(mockSearchShows).not.toHaveBeenCalled()
  })

  it('does not call the API when an empty query is submitted', async () => {
    const user = userEvent.setup()
    renderExplorerPage()

    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(mockSearchShows).not.toHaveBeenCalled()
    expect(screen.getByText('Search for a show to see matching results.')).toBeVisible()
  })

  it('repeats the same query and clears the local selection for the new request', async () => {
    const user = userEvent.setup()
    const results = [makeResult(139, 'Girls')]
    mockSearchShows.mockResolvedValueOnce(results).mockResolvedValueOnce(results)
    renderExplorerPage()

    const input = screen.getByRole('searchbox', { name: 'Search TV shows' })
    const searchButton = screen.getByRole('button', { name: 'Search' })
    await user.type(input, 'girls')
    await user.click(searchButton)
    const resultButton = await screen.findByRole('button', { name: /Girls/ })
    await user.click(resultButton)
    expect(resultButton).toHaveAttribute('aria-pressed', 'true')

    await user.click(searchButton)

    await waitFor(() => expect(mockSearchShows).toHaveBeenCalledTimes(2))
    expect(mockSearchShows).toHaveBeenLastCalledWith('girls')
    expect(await screen.findByRole('button', { name: /Girls/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('searches and shows results, then allows keyboard selection and details', async () => {
    const user = userEvent.setup()
    mockSearchShows.mockResolvedValue([
      makeResult(139, 'Girls', {
        genres: ['Drama', 'Comedy'],
        language: 'English',
        rating: { average: 6.4 },
        image: { medium: 'https://example.com/girls.jpg' },
        summary: '<p><strong>Girls</strong> &amp friends.</p>',
      }),
    ])
    renderExplorerPage()

    await user.type(screen.getByRole('searchbox', { name: 'Search TV shows' }), 'girls')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(mockSearchShows).toHaveBeenCalledWith('girls')
    const showButton = await screen.findByRole('button', { name: /Girls/ })
    expect(screen.getByRole('link', { name: 'Full details' })).toHaveAttribute(
      'href',
      '/shows/139',
    )
    showButton.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Show details' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'Girls poster' })).toHaveAttribute(
      'src',
      'https://example.com/girls.jpg',
    )
    expect(screen.getByText('Drama, Comedy')).toBeVisible()
    const details = screen.getByRole('region', { name: 'Show details' })
    expect(within(details).getByText('English')).toBeVisible()
    expect(screen.getByText('6.4')).toBeVisible()

    const summary = screen.getByText('Girls & friends.')
    expect(summary.querySelector('strong')).toBeNull()
    expect(summary.innerHTML).not.toContain('<strong>')
  })

  it('shows a readable fallback for missing details', async () => {
    const user = userEvent.setup()
    mockSearchShows.mockResolvedValue([
      makeResult(1, 'Unknown show', {
        genres: null,
        language: null,
        rating: { average: null },
        image: null,
        summary: null,
      }),
    ])
    renderExplorerPage()

    await user.type(screen.getByRole('searchbox', { name: 'Search TV shows' }), 'unknown')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await user.click(await screen.findByRole('button', { name: /Unknown show/ }))

    expect(screen.getByText('No image')).toBeVisible()
    expect(screen.getAllByText('Not available')).toHaveLength(3)
    expect(screen.getByText('No summary available.')).toBeVisible()
  })

  it('announces loading and shows a no-results message', async () => {
    const user = userEvent.setup()
    const pendingSearch = deferred<TvmazeSearchResult[]>()
    mockSearchShows.mockReturnValue(pendingSearch.promise)
    renderExplorerPage()

    await user.type(screen.getByRole('searchbox', { name: 'Search TV shows' }), 'none')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByRole('status')).toHaveTextContent('Searching TVmaze')

    await act(async () => pendingSearch.resolve([]))

    expect(await screen.findByRole('status')).toHaveTextContent('No shows found')
  })

  it('shows an accessible error and retries the failed query', async () => {
    const user = userEvent.setup()
    mockSearchShows
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce([makeResult(2, 'Retry result')])
    renderExplorerPage()

    await user.type(screen.getByRole('searchbox', { name: 'Search TV shows' }), 'retry me')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Please try again')

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    await waitFor(() => expect(mockSearchShows).toHaveBeenNthCalledWith(2, 'retry me'))
    expect(await screen.findByRole('button', { name: /Retry result/ })).toBeVisible()
  })

  it('does not let an older response replace the latest search results', async () => {
    const user = userEvent.setup()
    const olderSearch = deferred<TvmazeSearchResult[]>()
    const newerSearch = deferred<TvmazeSearchResult[]>()
    mockSearchShows
      .mockReturnValueOnce(olderSearch.promise)
      .mockReturnValueOnce(newerSearch.promise)
    renderExplorerPage()

    const searchInput = screen.getByRole('searchbox', { name: 'Search TV shows' })
    const submitButton = screen.getByRole('button', { name: 'Search' })
    await user.type(searchInput, 'old query')
    await user.click(submitButton)
    await user.clear(searchInput)
    await user.type(searchInput, 'new query')
    await user.click(submitButton)

    await act(async () => newerSearch.resolve([makeResult(4, 'Newest result')]))
    expect(await screen.findByRole('button', { name: /Newest result/ })).toBeVisible()

    await act(async () => olderSearch.resolve([makeResult(3, 'Stale result')]))
    expect(screen.getByRole('button', { name: /Newest result/ })).toBeVisible()
    expect(screen.queryByRole('button', { name: /Stale result/ })).toBeNull()
    expect(within(screen.getByRole('region', { name: 'Search results' })).getByText('Newest result')).toBeVisible()
  })
})