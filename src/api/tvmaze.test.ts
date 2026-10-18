import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchShows } from './tvmaze'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function stubFetchResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('searchShows', () => {
  it('returns shows and safely encodes the search query', async () => {
    const results = [
      {
        score: 0.9,
        show: {
          id: 139,
          name: 'Girls',
          genres: ['Drama'],
          rating: { average: 6.4 },
          image: { medium: 'https://example.com/girls.jpg' },
          summary: null,
        },
      },
    ]
    const fetchMock = stubFetchResponse(results)

    await expect(searchShows('Girls & Boys?')).resolves.toEqual(results)

    const [requestedUrl] = fetchMock.mock.calls[0] as [string]
    const url = new URL(requestedUrl)
    expect(url.origin).toBe('https://api.tvmaze.com')
    expect(url.pathname).toBe('/search/shows')
    expect(url.searchParams.get('q')).toBe('Girls & Boys?')
  })

  it('returns an empty array when the API has no matches', async () => {
    stubFetchResponse([])

    await expect(searchShows('No matching shows')).resolves.toEqual([])
  })

  it.each(['', '   ', '\n\t'])(
    'does not fetch when the query is empty or whitespace (%j)',
    async (query) => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      await expect(searchShows(query)).resolves.toEqual([])
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it('accepts omitted fields and explicit null values', async () => {
    const results = [
      {
        score: 0.5,
        show: {
          id: 10,
          name: 'A show with missing data',
          genres: null,
          rating: { average: null },
          image: null,
          summary: null,
        },
      },
      {
        score: 0.4,
        show: {
          id: 11,
          name: 'A show with omitted data',
        },
      },
    ]
    stubFetchResponse(results)

    await expect(searchShows('A show')).resolves.toEqual(results)
  })

  it('throws an error for an unsuccessful HTTP response', async () => {
    stubFetchResponse({ message: 'Unavailable' }, 503)

    await expect(searchShows('Girls')).rejects.toThrow(
      'TVmaze search failed with HTTP 503',
    )
  })

  it('passes through network errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchShows('Girls')).rejects.toThrow('Failed to fetch')
  })
})