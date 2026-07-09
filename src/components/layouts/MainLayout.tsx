import { Outlet } from 'react-router-dom';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { PageTransition } from '../PageTransition';

export default function MainLayout() { 
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <PageTransition><Outlet /></PageTransition>
      </main>
      <Footer />
    </div>
  );
}