export function AboutPage() {
  return (
    <section className="page-content" aria-labelledby="about-title">
      <p className="page-eyebrow">About this project</p>
      <h1 id="about-title">About</h1>
      <p>
        TV Explorer helps you find television shows and explore details about a
        show you select.
      </p>
      <h2>Built with</h2>
      <p>React, TypeScript, and Vite.</p>
      <h2>Data source</h2>
      <p>
        Show information comes from the{' '}
        <a href="https://www.tvmaze.com/api">TVmaze public API</a>.
      </p>
    </section>
  )
}