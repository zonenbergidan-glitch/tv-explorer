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
})