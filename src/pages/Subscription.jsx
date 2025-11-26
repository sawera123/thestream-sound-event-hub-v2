import React from 'react';
import { Check, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase'; // Adjust path as needed
import './Subscription.css';

const Subscription = () => {
  const queryClient = useQueryClient();

  // Fetch current user's subscription
  const { data: userSubscription, isLoading } = useQuery({
    queryKey: ['userSubscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_expires_at')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!supabase.auth.getSession(), // Only fetch if logged in
  });

  // Mutation to update subscription (dummy - in real, integrate Stripe)
  const updateSubscription = useMutation({
    mutationFn: async (newPlan) => {
      const { data: { user } } = await supabase.auth.getUser();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year for paid plans
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_plan: newPlan,
          subscription_expires_at: newPlan === 'free' ? null : expiresAt.toISOString() 
        })
        .eq('id', user.id);
      if (error) throw error;
      
      // Optional: Insert to subscriptions table
      await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan: newPlan,
        status: 'active',
        current_period_end: newPlan === 'free' ? null : expiresAt.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userSubscription']);
      alert('Subscription updated successfully!');
    },
    onError: (error) => {
      console.error('Subscription update error:', error);
      alert(`Error: ${error.message}`);
    },
  });

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      uploads: '3 music videos',
      features: [
        'Upload up to 3 music videos',
        'Basic analytics',
        'Standard quality streaming',
        'Community support'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$49',
      period: 'per year',
      uploads: '10 music videos',
      features: [
        'Upload up to 10 music videos',
        'Advanced analytics & insights',
        'HD quality streaming',
        'Priority support',
        'Custom branding',
        'Ad-free experience'
      ],
      buttonText: 'Upgrade to Standard',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$149',
      period: 'per year',
      uploads: 'Unlimited music videos',
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
      buttonText: 'Go Premium',
      popular: false
    }
  ];

  if (isLoading) return <div>Loading subscription...</div>;

  const currentPlan = userSubscription?.subscription_plan || 'free';

  const handleSubscribe = (planId) => {
    if (planId === currentPlan) {
      alert('You are already on this plan.');
      return;
    }
    updateSubscription.mutate(planId);
  };

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1 className="subscription-title">
          Choose Your <span className="text-gradient">Perfect Plan</span>
        </h1>
        <p className="subscription-subtitle">
          Unlock unlimited creativity with our premium subscription plans
        </p>
        <p className="current-plan">Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</p>
      </div>

      <div className="plans-container">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.id === currentPlan ? 'current' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">
                <Zap size={14} fill="currentColor" />
                Most Popular
              </div>
            )}
            {plan.id === currentPlan && (
              <div className="current-badge">
                Current Plan
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

            <button 
              className={`plan-button ${plan.popular ? 'premium' : ''}`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={updateSubscription.isLoading || plan.id === currentPlan}
            >
              {updateSubscription.isLoading ? 'Updating...' : plan.buttonText}
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
                <th>Standard</th>
                <th>Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Music Video Uploads</td>
                <td>3</td>
                <td>10</td>
                <td>Unlimited</td>
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