import { Link } from 'react-router-dom';
import { Video, ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        {/* Header */}
        <header className="privacy-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          
          <div className="privacy-logo">
            <div className="logo-icon">
              <Video />
            </div>
            <h1>StreamHub Privacy Policy</h1>
          </div>
          
          <p className="privacy-updated">Last updated: May 2024</p>
        </header>

        {/* Content */}
        <div className="privacy-content">
          {/* Introduction */}
          <section className="privacy-section">
            <div className="section-icon">
              <Shield />
            </div>
            <h2>Introduction</h2>
            <p>
              Welcome to StreamHub. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our 
              website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          {/* Data Collection */}
          <section className="privacy-section">
            <div className="section-icon">
              <FileText />
            </div>
            <h2>Information We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
            <ul>
              <li><strong>Identity Data:</strong> First name, last name, username or similar identifier</li>
              <li><strong>Contact Data:</strong> Email address and telephone numbers</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, device information</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
              <li><strong>Profile Data:</strong> Your username, preferences, feedback and survey responses</li>
              <li><strong>Content Data:</strong> Videos, music, and other content you upload to our platform</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section className="privacy-section">
            <div className="section-icon">
              <Lock />
            </div>
            <h2>How We Use Your Information</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li>To register you as a new customer and manage your account</li>
              <li>To process and deliver your orders including managing payments and collecting money</li>
              <li>To manage our relationship with you including notifying you about changes</li>
              <li>To enable you to participate in promotions or complete surveys</li>
              <li>To deliver relevant content and advertisements to you</li>
              <li>To analyze and improve our services and user experience</li>
              <li>To protect our platform from fraud and abuse</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="privacy-section">
            <div className="section-icon">
              <Eye />
            </div>
            <h2>Data Sharing and Disclosure</h2>
            <p>
              We may share your personal data with third parties in the following circumstances:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> We work with companies that provide services on our behalf</li>
              <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you have given us explicit permission</li>
            </ul>
            <p className="highlight-text">
              We will never sell your personal data to third parties.
            </p>
          </section>

          {/* Security */}
          <section className="privacy-section">
            <h2>Data Security</h2>
            <p>
              We have implemented appropriate security measures to prevent your personal data from being 
              accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal 
              data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          {/* Your Rights */}
          <section className="privacy-section">
            <h2>Your Legal Rights</h2>
            <p>Under data protection laws, you have rights including:</p>
            <ul>
              <li><strong>Right to Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Request restriction of processing your data</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="privacy-section">
            <h2>Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold 
              certain information. Cookies are files with small amount of data which may include an anonymous 
              unique identifier. You can instruct your browser to refuse all cookies or to indicate when a 
              cookie is being sent.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="privacy-section">
            <h2>Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe that 
              your child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Changes */}
          <section className="privacy-section">
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
            </p>
          </section>

          {/* Contact */}
          <section className="privacy-section contact-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@streamhub.com</p>
              <p><strong>Address:</strong> 123 Stream Street, Media City, MC 12345</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="privacy-footer">
          <Link to="/login" className="footer-btn primary">
            I Agree - Continue to Login
          </Link>
          <Link to="/signup" className="footer-btn secondary">
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
