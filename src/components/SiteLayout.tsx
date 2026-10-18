import { NavLink, Outlet } from 'react-router-dom'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `site-nav__link${isActive ? ' is-active' : ''}`

export function SiteLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink className="site-brand" to="/">
            TV Explorer
          </NavLink>
          <nav className="site-nav" aria-label="Main navigation">
            <NavLink className={navLinkClassName} end to="/">
              Explorer
            </NavLink>
            <NavLink className={navLinkClassName} to="/about">
              About
            </NavLink>
            <NavLink className={navLinkClassName} to="/help">
              Help
            </NavLink>
            <NavLink className={navLinkClassName} to="/compare">
              Compare
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer" aria-label="Data source and license">
        <p>
          Show data from <a href="https://www.tvmaze.com/">TVmaze</a>, under
          the <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0 license</a>.
        </p>
      </footer>
    </div>
  )
}