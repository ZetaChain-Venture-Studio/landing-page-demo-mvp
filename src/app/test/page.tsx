"use client";

import PrivyProvider from '@/providers/PrivyProvider';
import LandingPageSimplified from '@/components/LandingPageSimplified';
import { anumaSanctuary } from '@/lib/palettes';

export default function TestPage() {
  return (
    <PrivyProvider>
      <LandingPageSimplified palette={anumaSanctuary} paletteId="2" />
    </PrivyProvider>
  );
}
