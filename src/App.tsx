import { Route, Routes } from 'react-router-dom'
import './App.css'
import { SiteLayout } from './components/SiteLayout'
import { AboutPage } from './pages/AboutPage'
import { ExplorerPage } from './pages/ExplorerPage'
import { HelpPage } from './pages/HelpPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ShowPage } from './pages/ShowPage'
import { SearchProvider } from './context/SearchProvider'
import { ComparePage } from './pages/ComparePage'

function App() {
  return (
    <SearchProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<ExplorerPage />} />
          <Route path="shows/:showId" element={<ShowPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </SearchProvider>
  )
}

export default App
