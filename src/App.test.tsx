import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

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
})