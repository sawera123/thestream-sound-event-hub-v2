import React, { useState, useEffect } from "react"; // useEffect bhi add kiya gaya
import { Check, Zap } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // useMutation hata diya gaya
import { supabase } from "../lib/supabase"; // Adjust path as needed
import "./Subscription.css";

const Subscription = () => {
  const queryClient = useQueryClient();

  // --- Naya State: Loading state for Stripe Checkout ---
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch current user's subscription
  const { data: userSubscription, isLoading } = useQuery({
    queryKey: ["userSubscription"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_plan, subscription_expires_at")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    // Check session state for initial rendering without full session loading
    enabled: !!supabase.auth.getSession(),
  });

  // --- DUMMY MUTATION HATA DIYA GAYA ---
  // Agar aap FREE plan par switch karne ki backend logic (e.g., paid plan cancel karna) chahte hain,
  // toh aapko ek naya function ya Edge function banana hoga.

  // --- SUBSCRIPTION HANDLER: STRIPE CHECKOUT INTEGRATION ---
  const handleSubscribe = async (planId) => {
    const currentPlan = userSubscription?.subscription_plan || "free";

    if (planId === currentPlan) {
      alert("You are already on this plan.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to change your subscription.");
      return;
    }

    // 1. FREE Plan par switch karne ka dummy logic (Backend integration required)
    if (planId === "free") {
      alert(
        "Switching to Free plan (Requires proper backend cancellation logic).",
      );

      // Yahan aapko backend mein subscription cancel karne ki logic implement karni hogi.
      await supabase
        .from("profiles")
        .update({ subscription_plan: "free", subscription_expires_at: null })
        .eq("id", user.id);
      queryClient.invalidateQueries(["userSubscription"]);
      return;
    }

    // 2. PAID Plan (Standard/Premium) ke liye Stripe Checkout shuru karein
    setIsSubscribing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "stripe-checkout",
        {
          body: {
            plan_id: planId,
            userId: user.id,
            origin: window.location.origin,
            success_url: `${window.location.origin}/dashboard?checkout=success`,
            cancel_url: `${window.location.origin}/subscription?checkout=cancelled`,
          },
        },
      );

      if (error) throw error;

      // Cleaned up redirection logic
      const sessionUrl = data?.url || data?.stripe_session_url;

      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error("Failed to get Stripe session URL from function.");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert(`Payment initialization failed: ${err.message}`);
    } finally {
      // Processing complete hone par loading state band karein (Bhaley hi redirect hone wala ho)
      setIsSubscribing(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      uploads: "3 music videos",
      features: [
        "Upload up to 3 music videos",
        "Basic analytics",
        "Standard quality streaming",
        "Community support",
      ],
      buttonText: "Get Started",
      popular: false,
    },
    {
      id: "standard",
      name: "Standard",
      price: "$49",
      period: "per year",
      uploads: "10 music videos",
      features: [
        "Upload up to 10 music videos",
        "Advanced analytics & insights",
        "HD quality streaming",
        "Priority support",
        "Custom branding",
        "Ad-free experience",
      ],
      buttonText: "Upgrade to Standard",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$149",
      period: "per year",
      uploads: "Unlimited music videos",
      features: [
        "Unlimited music video uploads",
        "Real-time analytics dashboard",
        "4K quality streaming",
        "24/7 VIP support",
        "Advanced custom branding",
        "Ad-free experience",
        "API access",
        "Dedicated account manager",
      ],
      buttonText: "Go Premium",
      popular: false,
    },
  ];

  if (isLoading) return <div>Loading subscription...</div>;

  const currentPlan = userSubscription?.subscription_plan || "free";

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1 className="subscription-title">
          Choose Your <span className="text-gradient">Perfect Plan</span>
        </h1>
        <p className="subscription-subtitle">
          Unlock unlimited creativity with our premium subscription plans
        </p>
        <p className="current-plan">
          Current Plan:{" "}
          {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
        </p>
      </div>

      <div className="plans-container">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? "popular" : ""} ${plan.id === currentPlan ? "current" : ""}`}
          >
            {plan.popular && (
              <div className="popular-badge">
                <Zap size={14} fill="currentColor" />
                Most Popular
              </div>
            )}
            {plan.id === currentPlan && (
              <div className="current-badge">Current Plan</div>
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
              className={`plan-button ${plan.popular ? "premium" : ""}`}
              onClick={() => handleSubscribe(plan.id)}
              // disabled state ko isSubscribing par depend karaya
              disabled={isSubscribing || plan.id === currentPlan}
            >
              {/* Button text ko loading state ke mutabik badla */}
              {isSubscribing ? "Processing..." : plan.buttonText}
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
