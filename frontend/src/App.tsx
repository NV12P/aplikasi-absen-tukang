import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Proyek from './pages/Proyek'
import Pekerja from './pages/Pekerja'
import InputAbsensi from './pages/InputAbsensi'
import RekapAbsensi from './pages/RekapAbsensi'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="proyek" element={<Proyek />} />
              <Route path="pekerja" element={<Pekerja />} />
              <Route path="input-absensi" element={<InputAbsensi />} />
              <Route path="rekap-absensi" element={<RekapAbsensi />} />
            </Route>
          </Route>
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
