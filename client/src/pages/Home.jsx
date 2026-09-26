import React from 'react';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import PopularCities from '../components/PopularCities';
import HowItWorks from '../components/HowItWorks';
import BusinessCTA from '../components/BusinessCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <PopularCities />
      <HowItWorks />
      <BusinessCTA />
    </>
  );
}
