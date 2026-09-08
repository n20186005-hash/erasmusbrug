import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import BasicInfo from '@/components/BasicInfo';
import WeatherSection from '@/components/WeatherSection';
import HoursSection from '@/components/HoursSection';
import TicketsSection from '@/components/TicketsSection';
import TransportSection from '@/components/TransportSection';
import AmenitiesSection from '@/components/AmenitiesSection';
import InfoSection from '@/components/InfoSection';
import RouteSection from '@/components/RouteSection';
import PhotoSpotsSection from '@/components/PhotoSpotsSection';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import MapEmbed from '@/components/MapEmbed';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Intro />
        <BasicInfo />
        <WeatherSection />
        <HoursSection />
        <TicketsSection />
        <TransportSection />
        <AmenitiesSection />
        <InfoSection />
        <RouteSection />
        <PhotoSpotsSection />
        <Gallery />
        <Reviews />
        <MapEmbed />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
