import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Proyek from './pages/Projects/Proyek'
import Pekerja from './pages/Workers/Pekerja'
import InputAbsensi from './pages/Attendance/InputAbsensi'
import RekapAbsensi from './pages/Reports/RekapAbsensi'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="proyek" element={<Proyek />} />
                <Route path="pekerja" element={<Pekerja />} />
                <Route path="input-absensi" element={<InputAbsensi />} />
                <Route path="rekap-absensi" element={<RekapAbsensi />} />
              </Route>
            </Route>
            
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
