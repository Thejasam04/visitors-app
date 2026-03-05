import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Visitor Pages
import Landing      from './pages/visitor/Landing'
import Auth         from './pages/visitor/Auth'
import VisitForm    from './pages/visitor/VisitForm'
import Dashboard    from './pages/visitor/Dashboard'
import VisitorPass  from './pages/visitor/VisitorPass'

// Admin Pages
import AdminLogin      from './pages/admin/AdminLogin'
import AdminDashboard  from './pages/admin/AdminDashboard'
import HostsManagement from './pages/admin/HostsManagement'
import AllVisitors     from './pages/admin/AllVisitors'

// Route Guards
const VisitorRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/auth" />
}

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  return token ? children : <Navigate to="/admin/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Visitor Routes */}
        <Route path="/"          element={<Landing />} />
        <Route path="/auth"      element={<Auth />} />
        <Route path="/visit"     element={<VisitorRoute><VisitForm /></VisitorRoute>} />
        <Route path="/dashboard" element={<VisitorRoute><Dashboard /></VisitorRoute>} />
        <Route path="/pass/:id"  element={<VisitorRoute><VisitorPass /></VisitorRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/login"     element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/hosts"     element={<AdminRoute><HostsManagement /></AdminRoute>} />
        <Route path="/admin/visitors"  element={<AdminRoute><AllVisitors /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App