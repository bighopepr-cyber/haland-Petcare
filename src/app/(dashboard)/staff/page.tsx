import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Staff - Haland Petcare",
};

export default function StaffDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Staff</h1>
      <p className="text-muted-foreground">Manajemen janji temu dan pembayaran</p>
    </div>
  );
}