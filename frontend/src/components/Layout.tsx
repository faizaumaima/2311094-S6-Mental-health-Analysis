
import { Link, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate("/login", { replace: true })
  }

  return (
    <div>
      <header>
        <h1>Mental Health Analysis</h1>

        <nav>
          <Link to="/records">Records</Link>{" "}
          <Link to="/groups">Groups</Link>{" "}
          <Link to="/profile">Profile</Link>{" "}
          {user?.role === "admin" && (
            <Link to="/admin">Admin</Link>
          )}
        </nav>

        <p>Welcome, {user?.name}</p>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

