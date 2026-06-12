import Sidebar from "./Sidebar";

function AppShell({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground md:pl-64">
      <Sidebar />
      <main className="min-h-screen w-full min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

export default AppShell;
