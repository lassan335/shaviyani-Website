import { currentAdminUser, listAdminUsers } from "../../actions";
import AdminSettings from "./AdminSettings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Settings — Shaviyani Pro" };

export default async function AdminSettingsPage() {
  const { username } = await currentAdminUser();
  const users = await listAdminUsers();
  return <AdminSettings currentUsername={username} initialUsers={users} />;
}
