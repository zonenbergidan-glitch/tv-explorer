import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-content" aria-labelledby="not-found-title">
      <p className="page-eyebrow">Page not found</p>
      <h1 id="not-found-title">That address does not exist</h1>
      <p>Check the address or return to the Explorer page.</p>
      <Link className="page-link" to="/">
        Go to Explorer
      </Link>
    </section>
  )
}