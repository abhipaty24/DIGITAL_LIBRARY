import { Link } from 'react-router-dom'
export default function NotFound() { return <div className="state"><h2>404 – Page not found</h2><p>The page you requested doesn’t exist.</p><Link className="btn" to="/">Back to Home</Link></div> }
