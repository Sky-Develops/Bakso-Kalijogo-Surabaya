import { BottomNav } from "@/components/bottom-nav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-6xl overflow-x-hidden bg-neutral-50 dark:bg-neutral-950">
      <main className="pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
