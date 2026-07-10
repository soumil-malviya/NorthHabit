import { LegalLayout } from '../components/legal/LegalLayout';
import { LegalSection } from '../components/legal/LegalSection';
import type { TocItem } from '../components/legal/TableOfContents';

const LAST_UPDATED = '2026-07-10';

const TERMS_TOC: TocItem[] = [
  { id: 'acceptance-of-terms', title: 'Acceptance of Terms' },
  { id: 'description-of-service', title: 'Description of Service' },
  { id: 'user-accounts', title: 'User Accounts' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'user-responsibilities', title: 'User Responsibilities' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'availability', title: 'Availability' },
  { id: 'no-warranty', title: 'No Warranty' },
  { id: 'limitation-of-liability', title: 'Limitation of Liability' },
  { id: 'account-suspension', title: 'Account Suspension' },
  { id: 'termination', title: 'Termination' },
  { id: 'third-party-services', title: 'Third Party Services' },
  { id: 'privacy', title: 'Privacy' },
  { id: 'updates', title: 'Updates' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'contact', title: 'Contact' },
];

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      eyebrow="Terms"
      description="The terms that govern access to NorthHabit, a calm productivity app for habits, tasks, calendar planning, and focus."
      lastUpdated={LAST_UPDATED}
      toc={TERMS_TOC}
    >
      <LegalSection id="acceptance-of-terms" title="Acceptance of Terms">
        <p>
          By accessing or using NorthHabit, you agree to these Terms of Service. If you do not agree
          to these terms, do not use the service.
        </p>
      </LegalSection>

      <LegalSection id="description-of-service" title="Description of Service">
        <p>
          NorthHabit is intended as a productivity application. It helps users track habits, manage
          todos, view calendar-oriented planning, configure Pomodoro sessions, and understand
          personal productivity patterns through simple statistics.
        </p>
        <p>
          The service may change over time. Features may be added, refined, limited, or removed as
          the product evolves.
        </p>
      </LegalSection>

      <LegalSection id="user-accounts" title="User Accounts">
        <p>
          Some features require an account. You are responsible for maintaining access to your
          account, keeping your sign-in methods secure, and ensuring the information associated with
          your account is accurate.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable Use">
        <p>You agree not to misuse NorthHabit or its infrastructure. Prohibited activity includes:</p>
        <ul>
          <li>Abuse, harassment, spam, or malicious usage.</li>
          <li>Illegal activity or attempts to violate applicable laws.</li>
          <li>Reverse engineering, scraping, automated extraction, or unauthorized probing.</li>
          <li>Attempts to disrupt, overload, or bypass the service or its security controls.</li>
          <li>Using NorthHabit to store or transmit harmful, infringing, or deceptive material.</li>
        </ul>
      </LegalSection>

      <LegalSection id="user-responsibilities" title="User Responsibilities">
        <p>
          Users are responsible for their own data, decisions, routines, and use of the product.
          NorthHabit is a planning and productivity tool; it does not replace professional,
          medical, financial, or legal advice.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="Intellectual Property">
        <p>
          NorthHabit, including its interface, product design, branding, and original software, is
          owned by Soumil Malviya unless otherwise noted. You retain ownership of the habits, todos,
          notes, settings, and productivity data you create in the app.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="Availability">
        <p>
          NorthHabit is provided as a web application and may depend on browser behavior, network
          access, Firebase, Cloudflare Pages, and other infrastructure. There is no guarantee of
          uninterrupted availability, error-free operation, or permanent access to any feature.
        </p>
      </LegalSection>

      <LegalSection id="no-warranty" title="No Warranty">
        <p>
          NorthHabit is provided on an “as is” and “as available” basis. To the fullest extent
          permitted by law, no warranties are made regarding reliability, fitness for a particular
          purpose, data availability, or uninterrupted operation.
        </p>
      </LegalSection>

      <LegalSection id="limitation-of-liability" title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, NorthHabit and its developer will not be liable
          for indirect, incidental, consequential, special, or punitive damages, or for loss of data,
          productivity, goodwill, or business opportunity arising from use of the service.
        </p>
      </LegalSection>

      <LegalSection id="account-suspension" title="Account Suspension">
        <p>
          Accounts may be suspended or restricted if they are associated with abuse, illegal
          activity, attempts to harm the service, or violations of these terms.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Termination">
        <p>
          You may stop using NorthHabit at any time. NorthHabit may terminate or restrict access if
          continued use creates risk, violates these terms, or is no longer supported by the
          service.
        </p>
      </LegalSection>

      <LegalSection id="third-party-services" title="Third Party Services">
        <p>
          NorthHabit relies on third-party services including Firebase, Google Authentication, and
          Cloudflare Pages. These services are governed by their own terms and policies. NorthHabit
          is not responsible for outages, changes, or failures caused by third-party providers.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="Privacy">
        <p>
          Use of NorthHabit is also governed by the
          {' '}
          <a href="/privacy">Privacy Policy</a>, which explains how account, workspace, and device
          data are handled.
        </p>
      </LegalSection>

      <LegalSection id="updates" title="Updates">
        <p>
          These terms may be updated as the product changes. Continued use of NorthHabit after an
          update means you accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing Law">
        <p>
          These terms are governed by applicable laws where the developer operates, without regard
          to conflict of law principles, unless a mandatory local law provides otherwise.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about these terms can be sent to Soumil Malviya at
          {' '}
          <a href="mailto:soumil.malviya@icloud.com">soumil.malviya@icloud.com</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
