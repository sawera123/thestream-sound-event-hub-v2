import React from 'react';
import { Check, Zap } from 'lucide-react';
import './Subscription.css';

const Subscription = () => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      uploads: '5 music videos',
      features: [
        'Upload up to 5 music videos',
        'Basic analytics',
        'Standard quality streaming',
        'Community support'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$49',
      period: 'per year',
      uploads: '100 music videos',
      features: [
        'Upload up to 100 music videos',
        'Advanced analytics & insights',
        'HD quality streaming',
        'Priority support',
        'Custom branding',
        'Ad-free experience'
      ],
      buttonText: 'Upgrade to Premium',
      popular: true
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '$149',
      period: 'per year',
      uploads: '1000+ music videos',
      features: [
        'Unlimited music video uploads',
        'Real-time analytics dashboard',
        '4K quality streaming',
        '24/7 VIP support',
        'Advanced custom branding',
        'Ad-free experience',
        'API access',
        'Dedicated account manager'
      ],
      buttonText: 'Go Unlimited',
      popular: false
    }
  ];

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1 className="subscription-title">
          Choose Your <span className="text-gradient">Perfect Plan</span>
        </h1>
        <p className="subscription-subtitle">
          Unlock unlimited creativity with our premium subscription plans
        </p>
      </div>

      <div className="plans-container">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">
                <Zap size={14} fill="currentColor" />
                Most Popular
              </div>
            )}
            
            <div className="plan-header">
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">/{plan.period}</span>
              </div>
              <p className="plan-uploads">{plan.uploads}</p>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <Check className="check-icon" size={20} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button className={`plan-button ${plan.popular ? 'premium' : ''}`}>
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="comparison-section">
        <h2 className="comparison-title">Compare All Features</h2>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Features</th>
                <th>Free</th>
                <th>Premium</th>
                <th>Unlimited</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Music Video Uploads</td>
                <td>5</td>
                <td>100</td>
                <td>1000+</td>
              </tr>
              <tr>
                <td>Video Quality</td>
                <td>Standard</td>
                <td>HD</td>
                <td>4K</td>
              </tr>
              <tr>
                <td>Analytics</td>
                <td>Basic</td>
                <td>Advanced</td>
                <td>Real-time</td>
              </tr>
              <tr>
                <td>Support</td>
                <td>Community</td>
                <td>Priority</td>
                <td>24/7 VIP</td>
              </tr>
              <tr>
                <td>Custom Branding</td>
                <td>✗</td>
                <td>✓</td>
                <td>✓ Advanced</td>
              </tr>
              <tr>
                <td>API Access</td>
                <td>✗</td>
                <td>✗</td>
                <td>✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
