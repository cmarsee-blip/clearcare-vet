import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Search from './pages/Search'
import VetDetail from './pages/VetDetail'
import ClinicDetail from './pages/ClinicDetail'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Compare from './pages/Compare'
import { PriceDetail, PriceIndex } from './pages/Prices'
import Legal from './pages/Legal'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'
import CompareBar from './components/CompareBar'
import PageSkeleton from './components/Skeleton'
import { ToastProvider } from './components/Toast'
import { useStore } from './context/StoreContext'

function RequireLogin({ children }) {
  const { user } = useStore()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { ready } = useStore()
  return (
    <ToastProvider>
      <ScrollToTop />
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        {!ready ? <PageSkeleton /> : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/vets/:id" element={<VetDetail />} />
          <Route path="/clinics/:id" element={<ClinicDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/prices" element={<PriceIndex />} />
          <Route path="/prices/:id" element={<PriceDetail />} />
          <Route path="/legal/:doc" element={<Legal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/notifications" element={<RequireLogin><Notifications /></RequireLogin>} />
          <Route path="/profile" element={<RequireLogin><Profile /></RequireLogin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        )}
      </main>
      <CompareBar />
      <Footer />
    </ToastProvider>
  )
}
