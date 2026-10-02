import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* /blog/:slug lands once Blog CRUD + detail view are built (Phase 1-2) */}
      </Routes>
    </BrowserRouter>
  )
}
