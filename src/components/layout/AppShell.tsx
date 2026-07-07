import { DesktopSidebar, BottomNav } from "./Navigation";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 md:px-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
