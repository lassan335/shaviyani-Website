"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { currency } from "../../../lib/format";
import { createProduct, updateProduct, deleteProduct } from "../../cmsActions";

function emptyForm() {
  return {
    slug: "",
    name: "",
    team: "",
    collection: "",
    league: "",
    mode: "instant",
    price: "",
    preorderEta: "",
    description: "",
    gradientFrom: "#0E2438",
    gradientTo: "#17A398",
    materials: "",
    sizes: "",
    featured: false,
  };
}

function ProductModal({ initial, collections, onClose, onSaved }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(
    initial
      ? {
          slug: initial.slug,
          name: initial.name,
          team: initial.team,
          collection: initial.collection,
          league: initial.league || "",
          mode: initial.mode,
          price: initial.price,
          preorderEta: initial.preorderEta || "",
          description: initial.description || "",
          gradientFrom: initial.gradientFrom,
          gradientTo: initial.gradientTo,
          materials: initial.materials || "",
          sizes: initial.sizes || "",
          featured: initial.featured,
        }
      : emptyForm()
  );
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setError(null);
    if (!form.slug || !form.name || !form.team || !form.collection) {
      setError("Slug, name, team and collection are required.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "featured") return;
      fd.append(k, v);
    });
    if (form.featured) fd.append("featured", "on");
    if (imageFile) fd.append("image", imageFile);

    const res = isEdit ? await updateProduct(initial.id, fd) : await createProduct(fd);
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modalHeader">
          <div className="modalTitle">{isEdit ? "Edit product" : "New product"}</div>
          <button className="iconBtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="formGrid">
          <label className="field">
            <span>Slug</span>
            <input value={form.slug} onChange={set("slug")} placeholder="red-snappers-away-kit" />
          </label>
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={set("name")} />
          </label>
          <label className="field">
            <span>Team</span>
            <input value={form.team} onChange={set("team")} />
          </label>
          <label className="field">
            <span>Collection</span>
            <select value={form.collection} onChange={set("collection")}>
              <option value="">Select…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>League (optional)</span>
            <input value={form.league} onChange={set("league")} />
          </label>
          <label className="field">
            <span>Mode</span>
            <select value={form.mode} onChange={set("mode")}>
              <option value="instant">Instant purchase</option>
              <option value="preorder">Pre-order</option>
            </select>
          </label>
          <label className="field">
            <span>Price (MVR)</span>
            <input type="number" value={form.price} onChange={set("price")} />
          </label>
          {form.mode === "preorder" && (
            <label className="field">
              <span>Pre-order ETA</span>
              <input value={form.preorderEta} onChange={set("preorderEta")} placeholder="e.g. 3-4 weeks" />
            </label>
          )}
          <label className="field full">
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={set("description")} />
          </label>
          <label className="field">
            <span>Materials (comma-separated)</span>
            <input value={form.materials} onChange={set("materials")} placeholder="Match Grade, Pro Interlock" />
          </label>
          <label className="field">
            <span>Sizes (comma-separated)</span>
            <input value={form.sizes} onChange={set("sizes")} placeholder="S, M, L, XL" />
          </label>
          <label className="field">
            <span>Card gradient from</span>
            <input type="color" value={form.gradientFrom} onChange={set("gradientFrom")} />
          </label>
          <label className="field">
            <span>Card gradient to</span>
            <input type="color" value={form.gradientTo} onChange={set("gradientTo")} />
          </label>
          <label className="field full">
            <span>Image {initial?.image ? "(replace)" : ""}</span>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0] || null)} />
          </label>
          <label className="field full" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              style={{ width: "auto" }}
            />
            <span style={{ textTransform: "none", fontWeight: 400, fontSize: 13 }}>Featured on homepage</span>
          </label>
        </div>

        {error && (
          <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)", marginTop: 10 }}>
            {error}
          </div>
        )}

        <button className="btn btnDark btnBlock" onClick={submit} disabled={submitting} style={{ marginTop: 12 }}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
      </div>
    </div>
  );
}

export default function ProductsAdmin({ initialProducts, collections }) {
  const [products, setProducts] = useState(initialProducts);
  const [modal, setModal] = useState(null); // null | "new" | product object
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  async function handleDelete(p) {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    await deleteProduct(p.id);
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div className="pageTitle">Products</div>
          <p className="pageSub">{products.length} product(s).</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin" className="btn btnOutlineDark">
            ← Back to dashboard
          </Link>
          <button className="btn btnDark" onClick={() => setModal("new")}>
            <Plus size={15} /> New product
          </button>
        </div>
      </div>

      <div className="orderList">
        {products.map((p) => (
          <div className="orderRow" key={p.id} style={{ borderLeftColor: p.gradientFrom }}>
            <div className="orderMain" style={{ cursor: "default" }}>
              <div className="orderMainLeft">
                <div>
                  <div className="orderId">{p.name}</div>
                  <div className="orderProduct">
                    {p.team} · {p.collection} · {currency(p.price)}
                  </div>
                </div>
              </div>
              <div className="orderMainRight" style={{ display: "flex", gap: 8 }}>
                {p.featured && <span className="badge">Featured</span>}
                <button className="iconBtn" onClick={() => setModal(p)}>
                  <Pencil size={15} />
                </button>
                <button className="iconBtn" onClick={() => handleDelete(p)}>
                  <Trash2 size={15} color="var(--red)" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{ textAlign: "center", color: "#8A8F98", fontSize: 13, padding: 30 }}>No products yet.</div>
        )}
      </div>

      {modal && (
        <ProductModal
          initial={modal === "new" ? null : modal}
          collections={collections}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
