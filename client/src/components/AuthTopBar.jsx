import { Link } from 'react-router-dom';

/**
 * AuthTopBar — compact brand + home navigation shown on all standalone auth pages.
 * Accessible: keyboard-navigable, proper aria-label, visible focus ring.
 */
export default function AuthTopBar() {
  return (
    <nav className="auth-top-bar" aria-label="Authentication navigation">
      <Link to="/" className="auth-top-bar__home" aria-label="Back to home page">
        <span className="auth-top-bar__logo" aria-hidden="true">TL&amp;E</span>
        <span className="auth-top-bar__back-label">Back to Home</span>
      </Link>
    </nav>
  );
}
