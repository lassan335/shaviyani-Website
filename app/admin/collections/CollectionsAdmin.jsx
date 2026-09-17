"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { createCollection, updateCollection, deleteCollection } from "../../cmsActions";

function emptyForm() {
  return { slug: "", name: "", blurb: "", gradientFrom: "#0E2438", gradientTo: "#17A398", order: 0 };
}

function CollectionModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(
    initial
      ? {
          slug: initial.slug,
          name: initial.name,
          blurb: initial.blurb || "",
          gradientFrom: initial.gradientFrom,
          gradientTo: initial.gradientTo,
          order: initial.order,
        }
      : emptyForm()
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    setError(null);
    if (!form.slug || !form.name) {
      setError("Slug and name are required.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const res = isEdit ? await updateCollection(initial.id, fd) : await createCollection(fd);
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
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">{isEdit ? "Edit collection" : "New collection"}</div>
          <button className="iconBtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="formGrid">
          <label className="field">
            <span>Slug</span>
            <input value={form.slug} onChange={set("slug")} placeholder="club-kits" />
          </label>
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={set("name")} />
          </label>
          <label className="field full">
            <span>Blurb</span>
            <input value={form.blurb} onChange={set("blurb")} />
          </label>
          <label className="field">
            <span>Gradient from</span>
            <input type="color" value={form.gradientFrom} onChange={set("gradientFrom")} />
          </label>
          <label className="field">
            <span>Gradient to</span>
            <input type="color" value={form.gradientTo} onChange={set("gradientTo")} />
          </label>
          <label className="field">
            <span>Display order</span>
            <input type="number" value={form.order} onChange={set("order")} />
          </label>
        </div>

        {error && (
          <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)", marginTop: 10 }}>
            {error}
          </div>
        )}

        <button className="btn btnDark btnBlock" onClick={submit} disabled={submitting} style={{ marginTop: 12 }}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create collection"}
        </button>
      </div>
    </div>
  );
}

export default function CollectionsAdmin({ initialCollections }) {
  const [collections, setCollections] = useState(initialCollections);
  const [modal, setModal] = useState(null);
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  async function handleDelete(c) {
    if (!confirm(`Delete "${c.name}"? Products already assigned to it will keep the old collection name as plain text.`))
      return;
    await deleteCollection(c.id);
    setCollections((prev) => prev.filter((x) => x.id !== c.id));
  }

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div className="pageTitle">Collections</div>
          <p className="pageSub">{collections.length} collection(s).</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin" className="btn btnOutlineDark">
            ← Back to dashboard
          </Link>
          <button className="btn btnDark" onClick={() => setModal("new")}>
            <Plus size={15} /> New collection
          </button>
        </div>
      </div>

      <div className="orderList">
        {collections.map((c) => (
          <div className="orderRow" key={c.id} style={{ borderLeftColor: c.gradientFrom }}>
            <div className="orderMain" style={{ cursor: "default" }}>
              <div className="orderMainLeft">
                <div>
                  <div className="orderId">{c.name}</div>
                  <div className="orderProduct">
                    /{c.slug} · {c.blurb}
                  </div>
                </div>
              </div>
              <div className="orderMainRight" style={{ display: "flex", gap: 8 }}>
                <button className="iconBtn" onClick={() => setModal(c)}>
                  <Pencil size={15} />
                </button>
                <button className="iconBtn" onClick={() => handleDelete(c)}>
                  <Trash2 size={15} color="var(--red)" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {collections.length === 0 && (
          <div style={{ textAlign: "center", color: "#8A8F98", fontSize: 13, padding: 30 }}>No collections yet.</div>
        )}
      </div>

      {modal && (
        <CollectionModal initial={modal === "new" ? null : modal} onClose={() => setModal(null)} onSaved={refresh} />
      )}
    </div>
  );
}
