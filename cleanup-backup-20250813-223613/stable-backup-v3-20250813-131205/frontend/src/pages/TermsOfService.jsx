import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Tattooed World ("the Platform," "we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Tattooed World is a digital platform that connects clients with tattoo artists. Our services include:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Artist discovery and location services</li>
                <li>Portfolio browsing and artist profiles</li>
                <li>Review and rating system</li>
                <li>Messaging and booking facilitation</li>
                <li>Flash gallery and artwork showcase</li>
                <li>Studio location and information services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One person may not maintain more than one account</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Artist Verification</h3>
              <p className="text-gray-700 mb-4">
                Artists must undergo a verification process that includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Professional credentials verification</li>
                <li>Portfolio and work sample review</li>
                <li>Studio location and licensing confirmation</li>
                <li>Background and safety compliance checks</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct and Responsibilities</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Acceptable Use</h3>
              <p className="text-gray-700 mb-4">You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Violate any local, state, national, or international law</li>
                <li>Transmit or post any harmful, threatening, or offensive content</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Platform's functionality</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Use the Platform for commercial purposes without authorization</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Content Standards</h3>
              <p className="text-gray-700 mb-4">All content uploaded to the Platform must:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Be your original work or properly licensed</li>
                <li>Not violate any intellectual property rights</li>
                <li>Be appropriate for all audiences (no explicit content)</li>
                <li>Not contain false or misleading information</li>
                <li>Comply with professional tattooing standards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Artist Terms and Obligations</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Professional Standards</h3>
              <p className="text-gray-700 mb-4">Artists using the Platform agree to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Maintain current professional licenses and certifications</li>
                <li>Follow all health and safety regulations</li>
                <li>Provide accurate pricing and service information</li>
                <li>Respond professionally to client inquiries</li>
                <li>Honor agreed-upon appointments and pricing</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Portfolio and Content</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Only upload images of your own work</li>
                <li>Obtain proper consent for client tattoo photos</li>
                <li>Maintain professional quality in all uploaded content</li>
                <li>Update portfolio regularly to reflect current work</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment and Fees</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Platform Fees</h3>
              <p className="text-gray-700 mb-4">
                Tattooed World may charge fees for premium services, which will be clearly disclosed before any charges are incurred.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Artist-Client Transactions</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>All payments between artists and clients are independent transactions</li>
                <li>Tattooed World is not responsible for payment disputes</li>
                <li>Artists are responsible for their own tax obligations</li>
                <li>Refund policies are determined by individual artists</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">7.1 Your Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of any content you upload, but grant Tattooed World a license to use, display, and promote your content on the Platform.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.2 Platform Content</h3>
              <p className="text-gray-700">
                All Platform design, features, and functionality are owned by Tattooed World and protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Reviews and Ratings</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Reviews must be based on genuine experiences</li>
                <li>False or misleading reviews are prohibited</li>
                <li>We reserve the right to moderate and remove inappropriate reviews</li>
                <li>Artists may respond to reviews professionally</li>
                <li>Review manipulation or incentivized reviews are forbidden</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>, which also governs your use of the Platform, to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">10.1 Service Availability</h3>
              <p className="text-gray-700 mb-4">
                We strive to maintain Platform availability but cannot guarantee uninterrupted service. We reserve the right to modify or discontinue services with notice.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">10.2 Third-Party Services</h3>
              <p className="text-gray-700 mb-4">
                The Platform may integrate with third-party services. We are not responsible for the availability or content of these services.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">10.3 Limitation of Liability</h3>
              <p className="text-gray-700">
                Tattooed World shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless Tattooed World from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">12.1 By You</h3>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time by contacting us or using the account deletion feature.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">12.2 By Us</h3>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately for violations of these Terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                Any disputes arising from these Terms or your use of the Platform will be resolved through:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>First, good faith negotiation</li>
                <li>If necessary, binding arbitration</li>
                <li>Disputes will be governed by the laws of [Your Jurisdiction]</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or Platform notification. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@tattooedworld.com</p>
                <p className="text-gray-700"><strong>Address:</strong> Tattooed World Legal Team</p>
                <p className="text-gray-700 ml-16">123 Ink Street</p>
                <p className="text-gray-700 ml-16">Art District, AD 12345</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
