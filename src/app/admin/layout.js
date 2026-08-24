import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/getSession";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin - Midwave Productions",
};

export default async function AdminLayout({ children }) {
  const { session, profile } = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-svh bg-bg flex">
      <AdminSidebar />
      <main className="flex-1 border-l border-border overflow-auto">
        {children}
      </main>
    </div>
  );
}
