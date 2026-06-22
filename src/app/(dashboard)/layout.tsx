import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardClientLayout } from "./client-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Re-verify user is active
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  if (!user || !user.isActive) {
    redirect("/login");
  }

  return (
    <DashboardClientLayout
      role={user.role}
      userName={user.name}
      clinicName="VetCare"
    >
      {children}
    </DashboardClientLayout>
  );
}