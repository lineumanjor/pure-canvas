import { useState, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BlogStatus from "@/components/BlogStatus";
import Categories from "@/components/Categories";
import FeaturedPartners from "@/components/FeaturedPartners";
import About from "@/components/About";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const partnersRef = useRef<HTMLDivElement>(null);

  const handleCategorySelect = (categoryName: string | null) => {
    setSelectedCategory(categoryName);
    // Scroll to partners section when a category is selected
    if (categoryName && partnersRef.current) {
      setTimeout(() => {
        partnersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <BlogStatus />
        <Categories 
          selectedCategory={selectedCategory} 
          onCategorySelect={handleCategorySelect} 
        />
        <div ref={partnersRef}>
          <FeaturedPartners 
            selectedCategory={selectedCategory}
            onClearFilter={() => setSelectedCategory(null)}
          />
        </div>
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
