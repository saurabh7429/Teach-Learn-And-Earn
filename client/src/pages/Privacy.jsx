import { Link } from 'react-router-dom';
import AuthTopBar from '../components/AuthTopBar';

/**
 * Privacy Policy — /privacy
 * Public route. No authentication required.
 * Effective Version: 1.0
 *
 * Items marked [TODO: OWNER REVIEW] require review and completion
 * by the platform operator before production deployment.
 */
export default function Privacy() {
  return (
    <>
      <AuthTopBar />
      <main id="main-content" tabIndex={-1} className="auth-legal-page page-enter">
        <h1>Privacy Policy</h1>
        <p className="auth-legal-meta">
          Version 1.0 &nbsp;·&nbsp; Last updated: September 2026
          <br />
          <span className="auth-legal-todo">
            [TODO: OWNER REVIEW] Update the effective date before production launch.
          </span>
        </p>

        <section className="auth-legal-section" aria-labelledby="pp-intro">
          <h2 id="pp-intro">1. Introduction</h2>
          <p>
            <strong>Teach, Learn &amp; Earn</strong> ("we", "us", or "our") is committed to
            protecting your personal information. This Privacy Policy explains what data we collect,
            how we use it, and your rights with respect to that data.
          </p>
          <p>
            By registering for or using the Platform, you agree to the collection and use of
            information in accordance with this Privacy Policy.
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Identify the data controller (company name, registration number,
            and registered address).
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-collect">
          <h2 id="pp-collect">2. Information We Collect</h2>
          <p>We collect the following categories of personal data:</p>
          <ul>
            <li>
              <strong>Registration data:</strong> your name, username, email address, and password
              (stored as a bcrypt hash — we never store plain-text passwords).
            </li>
            <li>
              <strong>Consent record:</strong> whether you accepted these terms, the version of the
              legal documents you agreed to, and the timestamp of your consent.
            </li>
            <li>
              <strong>Usage data:</strong> skills you post, learning requests you make, messages
              you send, and your learning progress records.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, and access timestamps,
              collected automatically through standard server logs.
            </li>
            <li>
              <strong>Communications:</strong> content of chat messages sent via the Platform.
            </li>
          </ul>
          <p>We do not collect payment information directly.</p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] If payment processing is added in future, update this section.
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-use">
          <h2 id="pp-use">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Operate and improve the peer-to-peer skill exchange features of the Platform.</li>
            <li>Enable real-time communication between users.</li>
            <li>Provide AI-powered learning assistance (your queries may be sent to a third-party
              AI provider — see Section 5).</li>
            <li>Send transactional emails such as password reset instructions.</li>
            <li>Ensure the security and integrity of the Platform.</li>
            <li>Comply with legal obligations.</li>
          </ul>
          <p>We do not sell your personal data to third parties.</p>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-legal-basis">
          <h2 id="pp-legal-basis">4. Legal Basis for Processing</h2>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] If operating in the EU/EEA, UK, or similar jurisdictions, specify
            the legal basis for each processing activity (e.g., contract performance, legitimate
            interests, consent) to comply with GDPR or equivalent regulations.
          </div>
          <p>
            We process your personal data on the basis of the contract between you and us (i.e.,
            your account agreement), our legitimate interests in operating the Platform securely,
            and your explicit consent where required.
          </p>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-third-party">
          <h2 id="pp-third-party">5. Third-Party Services</h2>
          <p>
            We may share limited data with the following categories of third-party service providers
            to operate the Platform:
          </p>
          <ul>
            <li>
              <strong>Cloud infrastructure / hosting:</strong> servers and databases where your data
              is stored.
            </li>
            <li>
              <strong>Email delivery:</strong> transactional email providers used to send password
              reset and notification emails.
            </li>
            <li>
              <strong>AI services:</strong> when you use the Teach Devta AI assistant, your query
              is transmitted to a third-party AI provider to generate a response.
            </li>
          </ul>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Name specific third-party providers (e.g., Google Cloud, SendGrid,
            Google Gemini) and link to their respective privacy policies.
          </div>
          <p>
            All third-party providers are contractually required to handle your data in accordance
            with applicable data protection laws and this Privacy Policy.
          </p>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-storage">
          <h2 id="pp-storage">6. Data Storage &amp; Security</h2>
          <p>
            Your data is stored on secured servers protected by industry-standard measures
            including encrypted connections (TLS), access controls, and regular security reviews.
          </p>
          <p>
            Passwords are stored as bcrypt hashes. Password reset tokens are stored only as
            SHA-256 hashes and expire after one hour.
          </p>
          <p>
            While we take reasonable precautions to protect your data, no method of electronic
            transmission or storage is 100% secure.
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Specify data retention periods (e.g., how long inactive accounts
            or deleted data is retained before permanent erasure).
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-rights">
          <h2 id="pp-rights">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification:</strong> request correction of inaccurate or incomplete data.</li>
            <li><strong>Erasure:</strong> request deletion of your personal data ("right to be forgotten").</li>
            <li><strong>Portability:</strong> request your data in a structured, machine-readable format.</li>
            <li><strong>Restriction:</strong> request that we restrict processing of your data in certain circumstances.</li>
            <li><strong>Objection:</strong> object to processing based on legitimate interests.</li>
            <li><strong>Withdraw consent:</strong> where processing is based on consent, withdraw it at any time.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the details in Section 9.
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Confirm which rights apply in your jurisdiction and add the name
            of the supervisory authority users may lodge complaints with (e.g., ICO in the UK).
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-cookies">
          <h2 id="pp-cookies">8. Cookies &amp; Local Storage</h2>
          <p>
            The Platform uses browser <strong>localStorage</strong> to store your authentication
            token (JWT) on your device. This token is used to keep you signed in between sessions.
            It is never transmitted to third parties.
          </p>
          <p>
            We do not currently use advertising or tracking cookies.
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] If analytics or advertising cookies are added in future, a cookie
            consent banner will be required in applicable jurisdictions (e.g., EU/UK ePrivacy).
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-children">
          <h2 id="pp-children">9. Children's Privacy</h2>
          <p>
            The Platform is not directed to children under 13 years of age (or the minimum age of
            digital consent in your jurisdiction). We do not knowingly collect personal data from
            children. If you believe a child has provided us with personal data, please contact us
            so we can delete it promptly.
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Confirm minimum age and jurisdiction-specific requirements.
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="pp-contact">
          <h2 id="pp-contact">10. Contact &amp; Complaints</h2>
          <p>
            For questions about this Privacy Policy or to exercise your rights, please contact us at:
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Add contact email, postal address, and Data Protection Officer
            details if required by applicable law.
          </div>
        </section>

        <nav className="auth-legal-nav" aria-label="Legal page navigation">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/signup">← Back to Sign Up</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/">Home</Link>
        </nav>
      </main>
    </>
  );
}
