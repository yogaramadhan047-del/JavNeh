import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb";

export default function AdminProfilePage() {
  return (
    <>
      <AdminBreadcrumb items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Profile" }]} />
      <h1 className="text-3xl font-bold text-white mb-6">Admin Profile</h1>
      <div className="bg-card-dark border border-border-dark rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <p className="text-gray-400 mb-4">Profile management interface goes here.</p>
      </div>
    </>
  );
}
