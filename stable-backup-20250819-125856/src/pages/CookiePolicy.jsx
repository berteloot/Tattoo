import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">
                Tattooed World uses cookies for various purposes to enhance your experience on our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>To keep you logged in during your session</li>
                <li>To remember your preferences and settings</li>
                <li>To analyze website traffic and usage patterns</li>
                <li>To provide personalized content and recommendations</li>
                <li>To improve our services and user experience</li>
                <li>To ensure the security of our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Essential Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 text-blue-700 text-sm">
                  <li>Authentication tokens</li>
                  <li>Session management</li>
                  <li>Security features</li>
                  <li>Load balancing</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Performance Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies collect information about how visitors use our website, helping us improve performance and user experience.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-green-800"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 text-green-700 text-sm">
                  <li>Page load times</li>
                  <li>Error tracking</li>
                  <li>Usage analytics</li>
                  <li>Performance monitoring</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Functional Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and choices.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-purple-800"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 text-purple-700 text-sm">
                  <li>Language preferences</li>
                  <li>Location settings</li>
                  <li>Search filters</li>
                  <li>Display preferences</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.4 Targeting/Advertising Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-orange-800"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 text-orange-700 text-sm">
                  <li>Ad personalization</li>
                  <li>Campaign tracking</li>
                  <li>Social media integration</li>
                  <li>Retargeting</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We may use third-party services that place their own cookies on your device. These include:
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Google Analytics</h4>
                  <p className="text-gray-700 text-sm">Helps us understand how users interact with our website</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Google Maps</h4>
                  <p className="text-gray-700 text-sm">Provides location services and mapping functionality</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Cloudinary</h4>
                  <p className="text-gray-700 text-sm">Manages image storage and delivery</p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Social Media Platforms</h4>
                  <p className="text-gray-700 text-sm">Enables social sharing and login features</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookie Duration</h2>
              <p className="text-gray-700 mb-4">
                Cookies can be temporary or persistent:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Session Cookies</h4>
                  <p className="text-gray-700 text-sm">
                    Temporary cookies that are deleted when you close your browser. Used for essential functions like keeping you logged in.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Persistent Cookies</h4>
                  <p className="text-gray-700 text-sm">
                    Remain on your device for a set period (typically 30 days to 2 years) or until you delete them. Used for preferences and analytics.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Managing Your Cookie Preferences</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Browser Settings</h3>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>View which cookies are stored on your device</li>
                <li>Delete existing cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies (may affect website functionality)</li>
                <li>Set cookies to be deleted when you close your browser</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Browser-Specific Instructions</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data
                </p>
                <p className="text-gray-700">
                  <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
                </p>
                <p className="text-gray-700">
                  <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                </p>
                <p className="text-gray-700">
                  <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Impact of Disabling Cookies</h2>
              <p className="text-gray-700 mb-4">
                While you can disable cookies, doing so may affect your experience on our platform:
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">⚠️ Potential Issues</h4>
                <ul className="list-disc pl-6 text-amber-700 text-sm">
                  <li>You may need to log in repeatedly</li>
                  <li>Your preferences may not be saved</li>
                  <li>Some features may not work properly</li>
                  <li>The website may load more slowly</li>
                  <li>You may see less relevant content</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Consent and Legal Basis</h2>
              <p className="text-gray-700 mb-4">
                We process cookies based on the following legal grounds:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>Consent:</strong> For non-essential cookies, we ask for your explicit consent</li>
                <li><strong>Legitimate Interest:</strong> For analytics and performance improvements</li>
                <li><strong>Contractual Necessity:</strong> For essential cookies required for service delivery</li>
                <li><strong>Legal Obligation:</strong> Where required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not intended for children under 18. We do not knowingly collect personal information from children through cookies. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. More Information</h2>
              <p className="text-gray-700 mb-4">
                For more information about cookies and privacy, you can visit:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Our <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link></li>
                <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">All About Cookies</a></li>
                <li><a href="https://www.cookiepro.com/knowledge/what-are-cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">CookiePro Guide</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@tattooedworld.com</p>
                <p className="text-gray-700"><strong>Subject:</strong> Cookie Policy Inquiry</p>
                <p className="text-gray-700"><strong>Address:</strong> Tattooed World Privacy Team</p>
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

export default CookiePolicy;
