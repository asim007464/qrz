import { DesktopSidebar, BottomNav, MobileTopBar } from "./Navigation";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] w-full max-w-[100vw]">
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <MobileTopBar />
        <main className="flex-1 app-main-pb min-w-0">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6 md:px-6 w-full">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
