import SubscriptionPlans from "@/components/SubscriptionPlans";

export const revalidate = 3600;

// Subscribe: its hero (the subscribe text from Hero Texts), the
// subscription plans, then the subscribe screen
export default function Subscribe() {
  return (
    <div className="relative flex flex-col">
      {/* The subscription plans, each leading to the checkout */}
      <SubscriptionPlans />
    </div>
  );
}
