import { getSiteContent } from "../../cmsActions";
import ContentAdmin from "./ContentAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Homepage Content — Shaviyani Pro Admin" };

export default async function ContentAdminPage() {
  const content = await getSiteContent();
  return <ContentAdmin initialContent={content} />;
}
