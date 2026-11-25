
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom"

import { AuthProvider, useAuth } from "./context/AuthContext"
import RequireAuth from "./components/RequireAuth"
import Layout from "./components/Layout"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Records from "./pages/Records"
import Profile from "./pages/Profile"
import Groups from "./pages/Groups"
import Admin from "./pages/Admin"
import NotFound from "./pages/NotFound"

function RequireAdmin() {
  const { user } = useAuth()

  if (user?.role !== "admin") {
    return <Navigate to="/records" replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/records" element={<Records />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/groups" element={<Groups />} />

              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/records" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
