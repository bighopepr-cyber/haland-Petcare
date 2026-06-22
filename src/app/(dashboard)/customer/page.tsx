import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Customer - Haland Petcare",
};

export default function CustomerDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Customer</h1>
      <p className="text-muted-foreground">Data hewan peliharaan dan riwayat janji temu</p>
    </div>
  );
}