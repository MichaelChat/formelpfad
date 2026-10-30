import { HashRouter, Route, Routes, useLocation } from 'react-router'
import { useEffect } from 'react'
import { StoreProvider } from './state/store'
import { CloudRoot } from './state/CloudRoot'
import { cloudEnabled } from './lib/cloud/config'
import { Layout } from './ui/Layout'
import Home from './pages/Home'
import Path from './pages/Path'
import Formulas, { FormulaDetail } from './pages/Formulas'
import Review from './pages/Review'
import Arena, { ExamSimulation } from './pages/Arena'
import ProgressPage from './pages/Progress'
import Settings from './pages/Settings'
import { ArenaTrainingPage, BossPage, LessonPage, PracticePage, ReviewStartPage } from './pages/Sessions'
import { ButtonLink, Empty } from './ui/kit'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="lernpfad" element={<Path />} />
          <Route path="lektion/:id" element={<LessonPage />} />
          <Route path="boss/:chapterId" element={<BossPage />} />
          <Route path="formeln" element={<Formulas />} />
          <Route path="formeln/:id" element={<FormulaDetail />} />
          <Route path="ueben/:formulaId" element={<PracticePage />} />
          <Route path="wiederholen" element={<Review />} />
          <Route path="wiederholen/start" element={<ReviewStartPage />} />
          <Route path="arena" element={<Arena />} />
          <Route path="arena/klausur/:id" element={<ExamSimulation />} />
          <Route path="arena/training" element={<ArenaTrainingPage />} />
          <Route path="fortschritt" element={<ProgressPage />} />
          <Route path="einstellungen" element={<Settings />} />
          <Route path="*" element={<Empty title="Seite nicht gefunden" text="Diese Adresse gibt es nicht." action={<ButtonLink to="/">Zur Startseite</ButtonLink>} />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  const routes = (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
  // Mit Firebase-Konfiguration: Anmeldung + Cloud-Speicher; sonst nur Browser-Speicher.
  return cloudEnabled ? <CloudRoot>{routes}</CloudRoot> : <StoreProvider>{routes}</StoreProvider>
}
