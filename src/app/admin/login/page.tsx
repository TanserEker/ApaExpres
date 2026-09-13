import AdminLoginForm from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Apa Expres — Admin Girişi</h1>
      <AdminLoginForm />
    </div>
  );
}
