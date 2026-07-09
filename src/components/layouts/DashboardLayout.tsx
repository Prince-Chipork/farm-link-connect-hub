import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/shared/Sidebar';
import { PageTransition } from '@/components/PageTransition';
import DashboardHeader from '@/components/shared/DashboardHeader';

export default function DashboardLayout() { 
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <Sidebar />
        </div>
      </div>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            <PageTransition>
                <Outlet />
            </PageTransition>
        </main>
      </div>
    </div>
  );
}