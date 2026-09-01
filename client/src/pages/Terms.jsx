import { Link } from 'react-router-dom';
import AuthTopBar from '../components/AuthTopBar';

/**
 * Terms of Service — /terms
 * Public route. No authentication required.
 * Effective Version: 1.0
 *
 * Items marked [TODO: OWNER REVIEW] require review and completion
 * by the platform operator before production deployment.
 */
export default function Terms() {
  return (
    <>
      <AuthTopBar />
      <main id="main-content" tabIndex={-1} className="auth-legal-page page-enter">
        <h1>Terms of Service</h1>
        <p className="auth-legal-meta">
          Version 1.0 &nbsp;·&nbsp; Last updated: September 2026
          <br />
          <span className="auth-legal-todo">
            [TODO: OWNER REVIEW] Update the effective date before production launch.
          </span>
        </p>

        <section className="auth-legal-section" aria-labelledby="tos-acceptance">
          <h2 id="tos-acceptance">1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong>Teach, Learn &amp; Earn</strong> ("the Platform", "we",
            "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do
            not agree to these Terms, please do not use the Platform.
          </p>
          <p>
            We may update these Terms from time to time. Continued use of the Platform after
            changes constitutes acceptance of the revised Terms. We will notify registered users of
            material changes via email or an in-app notification.
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Specify the operator name, legal entity, and registered address.
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-description">
          <h2 id="tos-description">2. Description of Service</h2>
          <p>
            Teach, Learn &amp; Earn is a peer-to-peer skill exchange platform that connects
            individuals who want to teach skills they possess with individuals who want to learn
            those skills. Users may post skill offerings, make learning requests, engage in
            real-time chat, and track their learning progress.
          </p>
          <p>
            The Platform may integrate with third-party AI services to provide learning assistance.
            Responses from AI features are for informational purposes only and should not be treated
            as professional advice.
          </p>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-accounts">
          <h2 id="tos-accounts">3. User Accounts</h2>
          <p>
            To access most features, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information during registration.</li>
            <li>Maintain and promptly update your account information.</li>
            <li>Keep your password confidential and not share access with others.</li>
            <li>Notify us immediately of any unauthorised use of your account.</li>
            <li>Be at least 13 years of age (or the minimum age of digital consent in your jurisdiction).</li>
          </ul>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Confirm minimum age requirement for your jurisdiction.
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-conduct">
          <h2 id="tos-conduct">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Platform for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Post or transmit content that is harmful, offensive, harassing, defamatory, or
              violates the rights of third parties.</li>
            <li>Attempt to gain unauthorised access to any part of the Platform or its systems.</li>
            <li>Scrape, harvest, or collect data from the Platform without express written permission.</li>
            <li>Distribute malware, spam, or other malicious content.</li>
            <li>Impersonate another person or entity.</li>
          </ul>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-ip">
          <h2 id="tos-ip">5. Intellectual Property</h2>
          <p>
            The Platform and its original content (excluding user-generated content) are the
            exclusive property of the Platform operator and are protected by applicable intellectual
            property laws.
          </p>
          <p>
            By posting content on the Platform, you grant us a non-exclusive, royalty-free,
            worldwide licence to display, distribute, and promote that content in connection with
            operating the Platform. You retain ownership of your content.
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Confirm the licence scope and whether you wish to include
            sub-licensing rights.
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-privacy">
          <h2 id="tos-privacy">6. Privacy</h2>
          <p>
            Your use of the Platform is also governed by our{' '}
            <Link to="/privacy" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference.
          </p>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-disclaimer">
          <h2 id="tos-disclaimer">7. Disclaimers &amp; Limitation of Liability</h2>
          <p>
            The Platform is provided on an "as is" and "as available" basis without warranties of
            any kind, either express or implied, including but not limited to fitness for a
            particular purpose or non-infringement.
          </p>
          <p>
            To the fullest extent permitted by law, we shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising out of or related to
            your use of the Platform.
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Review limitation of liability language with a qualified attorney
            for your jurisdiction.
          </div>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-termination">
          <h2 id="tos-termination">8. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account and access to the Platform at
            our sole discretion, without notice, for conduct that we believe violates these Terms or
            is harmful to other users, the Platform, or third parties.
          </p>
          <p>
            You may delete your account at any time by contacting us. Upon deletion, your personal
            data will be handled in accordance with our Privacy Policy.
          </p>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-governing">
          <h2 id="tos-governing">9. Governing Law &amp; Disputes</h2>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Specify governing law jurisdiction, venue for disputes, and
            whether you wish to include an arbitration clause.
          </div>
          <p>
            Any disputes arising under these Terms shall be governed by and construed in accordance
            with the applicable laws of the jurisdiction in which the Platform operator is registered.
          </p>
        </section>

        <section className="auth-legal-section" aria-labelledby="tos-contact">
          <h2 id="tos-contact">10. Contact</h2>
          <p>
            If you have questions about these Terms, please contact us at:
          </p>
          <div className="auth-legal-todo">
            [TODO: OWNER REVIEW] Add contact email, mailing address, and any designated legal
            contact details.
          </div>
        </section>

        <nav className="auth-legal-nav" aria-label="Legal page navigation">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/signup">← Back to Sign Up</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/">Home</Link>
        </nav>
      </main>
    </>
  );
}
