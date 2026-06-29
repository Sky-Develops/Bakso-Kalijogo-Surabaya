import { BottomNav } from "@/components/bottom-nav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 max-w-lg mx-auto relative">
      <main className="pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
