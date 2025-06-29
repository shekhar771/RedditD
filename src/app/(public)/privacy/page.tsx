import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Reddieprod",
  description: "Learn how Reddieprod handles your data",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          1. Information We Collect
        </h2>
        <p className="mb-4">When you use Reddieprod, we may collect:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Basic account information (username, email)</li>
          <li>Content you submit (posts, comments, votes)</li>
          <li>Technical data (IP address, browser type, device information)</li>
          <li>OAuth data from third-party providers (GitHub/Google)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. How We Use Your Information
        </h2>
        <p className="mb-4">We use collected information to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Provide and maintain our service</li>
          <li>Improve user experience</li>
          <li>Moderate content</li>
          <li>Prevent abuse</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Data Sharing</h2>
        <p className="mb-4">
          We do not sell your personal data. We may share information:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>With service providers necessary for operation</li>
          <li>When required by law</li>
          <li>To protect rights and safety</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Access your personal data</li>
          <li>Request deletion of your account</li>
          <li>Opt-out of certain data collection</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
        <p className="mb-4">
          For privacy-related inquiries, please contact: privacy@reddieprod.com
        </p>
      </section>
    </div>
  );
}
