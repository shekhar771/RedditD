import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - Reddieprod",
  description: "Reddieprod terms and conditions",
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing Reddieprod, you agree to these Terms and our Privacy
          Policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. User Responsibilities
        </h2>
        <p className="mb-4">You agree not to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Post illegal or harmful content</li>
          <li>Harass other users</li>
          <li>Attempt to disrupt the service</li>
          <li>Create multiple accounts to evade restrictions</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Content Ownership</h2>
        <p className="mb-4">
          You retain ownership of your content, but grant Reddieprod a worldwide
          license to display and distribute it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Moderation</h2>
        <p className="mb-4">
          We reserve the right to remove content and suspend accounts at our
          discretion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          5. Limitation of Liability
        </h2>
        <p className="mb-4">
          Reddieprod is provided "as is" without warranties. We are not liable
          for:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Service interruptions</li>
          <li>User-generated content</li>
          <li>Third-party actions</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
        <p className="mb-4">
          We may update these Terms. Continued use constitutes acceptance of
          changes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
        <p className="mb-4">These Terms are governed by the laws of India.</p>
      </section>
    </div>
  );
}
