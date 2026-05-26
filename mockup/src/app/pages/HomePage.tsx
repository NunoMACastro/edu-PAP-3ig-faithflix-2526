import { Layout } from "../components/Layout";
import { HeroSection } from "../components/HeroSection";
import { CatalogSection } from "../components/CatalogSection";
import { SubscriptionPlans } from "../components/SubscriptionPlans";

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <CatalogSection />
      <SubscriptionPlans />
    </Layout>
  );
}