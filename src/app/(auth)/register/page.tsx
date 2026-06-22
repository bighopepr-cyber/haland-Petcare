import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Haland Petcare",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Haland Petcare</h1>
          <p className="mt-2 text-muted-foreground">Buat akun baru</p>
        </div>
        <div className="rounded-lg border p-6 shadow-sm">
          <p className="text-center text-sm text-muted-foreground">
            Halaman registrasi akan diimplementasikan
          </p>
        </div>
      </div>
    </div>
  );
}