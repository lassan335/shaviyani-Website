import { listProducts, listCollections } from "../../cmsActions";
import ProductsAdmin from "./ProductsAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products — Shaviyani Pro Admin" };

export default async function ProductsAdminPage() {
  const [products, collections] = await Promise.all([listProducts(), listCollections()]);
  return <ProductsAdmin initialProducts={products} collections={collections} />;
}
