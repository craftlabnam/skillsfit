import { Navbar } from "@/components/layout/Navbar";

const DashboardPage = () => {
  return (
    <>
      <Navbar signedIn />
      <main className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm text-center rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">Coming soon.</p>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
