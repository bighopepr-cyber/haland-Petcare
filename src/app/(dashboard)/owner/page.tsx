import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Owner - Haland Petcare",
};

export default function OwnerDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Owner</h1>
      <p className="text-muted-foreground">Overview bisnis dan laporan keuangan</p>
    </div>
  );
}