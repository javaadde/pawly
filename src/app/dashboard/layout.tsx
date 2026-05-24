import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <SessionProvider session={session}>
      <div style={{ display: 'flex' }}>
        <DashboardSidebar user={session.user} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
