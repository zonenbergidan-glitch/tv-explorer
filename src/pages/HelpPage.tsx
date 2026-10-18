export function HelpPage() {
  return (
    <section className="page-content" aria-labelledby="help-title">
      <p className="page-eyebrow">Using TV Explorer</p>
      <h1 id="help-title">Help</h1>
      <p>
        Search for a show by name, then choose a result to see its details.
      </p>
      <ol>
        <li>Enter a show name in the search field and choose Search.</li>
        <li>
          Use Tab to move through the results, then press Enter or Space to
          select a show. You can also select a result with a pointer.
        </li>
        <li>The selected show&apos;s details appear beside the results.</li>
      </ol>
      <h2>Search messages</h2>
      <ul>
        <li>Before searching, the page prompts you to enter a show name.</li>
        <li>If no shows match, try a different search.</li>
        <li>If a search fails, choose Try again to repeat it.</li>
      </ul>
      <h2>Missing information</h2>
      <p>
        Some shows do not have every detail or an image. Missing values are
        shown as Not available, No image, or No summary available.
      </p>
    </section>
  )
}