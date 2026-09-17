import { listCollections } from "../../cmsActions";
import CollectionsAdmin from "./CollectionsAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collections — Shaviyani Pro Admin" };

export default async function CollectionsAdminPage() {
  const collections = await listCollections();
  return <CollectionsAdmin initialCollections={collections} />;
}
