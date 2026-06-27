import { AdminGuard, AdminNav } from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-background">
        <AdminNav />
        <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
      </div>
    </AdminGuard>
  );
}
