import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminDrawerMenu } from "@/components/admin/admin-drawer";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <AdminSidebar />
      <AdminDrawerMenu />
      {children}
    </div>
  );
}
