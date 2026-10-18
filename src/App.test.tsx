import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchShows } from './api/tvmaze'
import type { TvmazeSearchResult } from './api/tvmaze'
import App from './App'

vi.mock('./api/tvmaze', async (importOriginal) => ({
  ...await importOriginal<typeof import('./api/tvmaze')>(),
  searchShows: vi.fn(),
}))

const mockSearchShows = vi.mocked(searchShows)

beforeEach(() => {
  mockSearchShows.mockReset()
})

describe('app navigation', () => {
  it('moves between pages through links and keeps the shared menu available', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Explorer' })).toBeVisible()

    await user.click(screen.getByRole('link', { name: 'About' }))
    expect(screen.getByRole('heading', { name: 'About' })).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()

    await user.click(screen.getByRole('link', { name: 'Help' }))
    expect(screen.getByRole('heading', { name: 'Help' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Explorer' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'About' })).toBeVisible()
  })

  it('shows a not-found page for an unknown address', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-address']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'That address does not exist' }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Go to Explorer' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('explains the project and links to its data source and license', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'About' })).toBeVisible()
    expect(screen.getByText(/React, TypeScript, and Vite/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'TVmaze public API' })).toHaveAttribute(
      'href',
      'https://www.tvmaze.com/api',
    )
    expect(screen.getByRole('link', { name: 'TVmaze' })).toHaveAttribute(
      'href',
      'https://www.tvmaze.com/',
    )
    expect(screen.getByRole('link', { name: 'CC BY-SA 4.0 license' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-sa/4.0/',
    )
  })

  it('documents the implemented search, keyboard, retry, and missing-data behavior', () => {
    render(
      <MemoryRouter initialEntries={['/help']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Help' })).toBeVisible()
    expect(screen.getByText(/Enter a show name in the search field/)).toBeVisible()
    expect(screen.getByText(/press Enter or Space to select a show/)).toBeVisible()
    expect(screen.getByText(/choose Try again to repeat it/)).toBeVisible()
    expect(screen.getByText(/Not available, No image, or No summary available/)).toBeVisible()
  })

  it('keeps the query and results when navigating to About and back without another request', async () => {
    const user = userEvent.setup()
    const results: TvmazeSearchResult[] = [
      { score: 1, show: { id: 139, name: 'Girls' } },
    ]
    mockSearchShows.mockResolvedValue(results)

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    const searchInput = screen.getByRole('searchbox', { name: 'Search TV shows' })
    await user.type(searchInput, 'girls')
    expect(mockSearchShows).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByRole('button', { name: /Girls/ })).toBeVisible()
    expect(mockSearchShows).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('link', { name: 'About' }))
    await user.click(screen.getByRole('link', { name: 'Explorer' }))

    expect(screen.getByRole('searchbox', { name: 'Search TV shows' })).toHaveValue(
      'girls',
    )
    expect(screen.getByRole('button', { name: /Girls/ })).toBeVisible()
    expect(mockSearchShows).toHaveBeenCalledTimes(1)
  })

  it('keeps the two compared shows while navigating to About and Compare', async () => {
    const user = userEvent.setup()
    mockSearchShows.mockResolvedValue([
      {
        score: 1,
        show: {
          id: 1,
          name: 'First show',
          genres: ['Drama'],
          language: 'English',
          rating: { average: 8 },
          image: { medium: 'https://example.com/first.jpg' },
        },
      },
      {
        score: 1,
        show: {
          id: 2,
          name: 'Second show',
          genres: null,
          language: null,
          rating: { average: null },
          image: null,
        },
      },
    ])

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByRole('searchbox', { name: 'Search TV shows' }), 'two shows')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await user.click(
      await screen.findByRole('checkbox', { name: 'Compare First show in comparison' }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: 'Compare Second show in comparison' }),
    )

    await user.click(screen.getByRole('link', { name: 'About' }))
    await user.click(screen.getByRole('link', { name: 'Compare' }))

    expect(screen.getByRole('heading', { name: 'First show' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Second show' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'First show poster' })).toHaveAttribute(
      'src',
      'https://example.com/first.jpg',
    )
    expect(screen.getByRole('img', { name: 'No image available for Second show' })).toBeVisible()
    expect(screen.getAllByText('Not available')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('Rating difference is unavailable')
    expect(screen.getByRole('link', { name: 'View First show details' })).toHaveAttribute(
      'href',
      '/shows/1',
    )
    expect(mockSearchShows).toHaveBeenCalledTimes(1)
  })

  it('shows an empty prompt on Compare before any search', () => {
    render(
      <MemoryRouter initialEntries={['/compare']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Search for shows in Explorer/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Explorer' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(mockSearchShows).not.toHaveBeenCalled()
  })

  it('asks for one more show when only one of two results is selected', async () => {
    const user = userEvent.setup()
    mockSearchShows.mockResolvedValue([
      { score: 1, show: { id: 1, name: 'First show' } },
      { score: 1, show: { id: 2, name: 'Second show' } },
    ])

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByRole('searchbox', { name: 'Search TV shows' }), 'shows')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByRole('checkbox', { name: 'Compare First show in comparison' })
    await user.click(screen.getByRole('checkbox', { name: 'Compare First show in comparison' }))
    await user.click(screen.getByRole('link', { name: 'Compare' }))

    expect(screen.getByText(/Choose one more show/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Explorer' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('distinguishes an empty result set from fewer than two results', async () => {
    const user = userEvent.setup()
    mockSearchShows.mockResolvedValueOnce([]).mockResolvedValueOnce([
      { score: 1, show: { id: 1, name: 'Only show' } },
    ])

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    await user.type(screen.getByRole('searchbox', { name: 'Search TV shows' }), 'none')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByText('No shows found. Try a different search.')
    await user.click(screen.getByRole('link', { name: 'Compare' }))
    expect(screen.getByText('The last search returned no shows to compare.')).toBeVisible()

    await user.click(screen.getByRole('link', { name: 'Back to Explorer' }))
    const input = screen.getByRole('searchbox', { name: 'Search TV shows' })
    await user.clear(input)
    await user.type(input, 'one')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByRole('button', { name: /Only show/ })
    await user.click(screen.getByRole('link', { name: 'Compare' }))

    expect(screen.getByText(/At least two different shows are needed/)).toBeVisible()
  })
})