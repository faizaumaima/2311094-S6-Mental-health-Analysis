
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <main>
      <h2>404 - Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/records">Go to Records</Link>
    </main>
  )
}
