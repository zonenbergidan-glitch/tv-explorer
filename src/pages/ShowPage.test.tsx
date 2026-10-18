import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getShowById, searchShows, TvmazeApiError } from '../api/tvmaze'
import type { TvmazeShow } from '../api/tvmaze'
import App from '../App'
import { ShowPage } from './ShowPage'

vi.mock('../api/tvmaze', async (importOriginal) => ({
  ...await importOriginal<typeof import('../api/tvmaze')>(),
  getShowById: vi.fn(),
  searchShows: vi.fn(),
}))

const mockGetShowById = vi.mocked(getShowById)
const mockSearchShows = vi.mocked(searchShows)

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function ShowPageTestRoutes() {
  return (
    <>
      <Link to="/shows/2">Open show 2</Link>
      <Routes>
        <Route path="/shows/:showId" element={<ShowPage />} />
      </Routes>
    </>
  )
}

beforeEach(() => {
  mockGetShowById.mockReset()
  mockSearchShows.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('show details route', () => {
  it('loads a show when its route is opened directly', async () => {
    const show: TvmazeShow = { id: 139, name: 'Girls' }
    mockGetShowById.mockResolvedValue(show)

    render(
      <MemoryRouter initialEntries={['/shows/139']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Girls', level: 1 }),
    ).toBeVisible()
    expect(mockGetShowById).toHaveBeenCalledWith(139)
    expect(screen.getByRole('link', { name: 'Back to Explorer' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it.each(['0', '-1', '1.5', 'not-a-number', '9007199254740992'])(
    'does not request a show for invalid ID %s', (showId) => {
      render(
        <MemoryRouter initialEntries={[`/shows/${showId}`]}>
          <App />
        </MemoryRouter>,
      )

      expect(screen.getByRole('heading', { name: 'Invalid show ID' })).toBeVisible()
      expect(mockGetShowById).not.toHaveBeenCalled()
    },
  )

  it('shows a not-found state for HTTP 404', async () => {
    mockGetShowById.mockRejectedValue(new TvmazeApiError(404))

    render(
      <MemoryRouter initialEntries={['/shows/999999']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Show not found' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Explorer' })).toBeVisible()
  })

  it('shows a network error and offers a retry', async () => {
    mockGetShowById.mockRejectedValue(new TypeError('Failed to fetch'))

    render(
      <MemoryRouter initialEntries={['/shows/139']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Please try again')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
  })

  it('retries the current show ID after a failure', async () => {
    const user = userEvent.setup()
    mockGetShowById
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockResolvedValueOnce({ id: 139, name: 'Girls' })

    render(
      <MemoryRouter initialEntries={['/shows/139']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('heading', { name: 'Girls', level: 1 }),
    ).toBeVisible()
    expect(mockGetShowById).toHaveBeenNthCalledWith(2, 139)
  })

  it('ignores the old response after the route ID changes while loading', async () => {
    const user = userEvent.setup()
    const firstShow = deferred<TvmazeShow>()
    const secondShow = deferred<TvmazeShow>()
    mockGetShowById
      .mockReturnValueOnce(firstShow.promise)
      .mockReturnValueOnce(secondShow.promise)

    render(
      <MemoryRouter initialEntries={['/shows/1']}>
        <ShowPageTestRoutes />
      </MemoryRouter>,
    )

    await waitFor(() => expect(mockGetShowById).toHaveBeenCalledWith(1))
    await user.click(screen.getByRole('link', { name: 'Open show 2' }))
    await waitFor(() => expect(mockGetShowById).toHaveBeenCalledWith(2))

    await act(async () => secondShow.resolve({ id: 2, name: 'Current show' }))
    expect(
      await screen.findByRole('heading', { name: 'Current show', level: 1 }),
    ).toBeVisible()

    await act(async () => firstShow.resolve({ id: 1, name: 'Old show' }))
    expect(screen.getByRole('heading', { name: 'Current show', level: 1 })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Old show', level: 1 })).toBeNull()
  })
})