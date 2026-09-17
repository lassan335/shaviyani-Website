"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { updateSiteContent } from "../../cmsActions";

export default function ContentAdmin({ initialContent }) {
  const [form, setForm] = useState({
    heroKicker: initialContent?.heroKicker || "",
    heroTitleLine1: initialContent?.heroTitleLine1 || "",
    heroTitleAccent: initialContent?.heroTitleAccent || "",
    heroBody: initialContent?.heroBody || "",
    heroTrustLine: initialContent?.heroTrustLine || "",
    campaignKicker: initialContent?.campaignKicker || "",
    campaignTitleLine1: initialContent?.campaignTitleLine1 || "",
    campaignTitleAccent: initialContent?.campaignTitleAccent || "",
    campaignBody: initialContent?.campaignBody || "",
  });
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [campaignImageFile, setCampaignImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (heroImageFile) fd.append("heroImage", heroImageFile);
    if (campaignImageFile) fd.append("campaignImage", campaignImageFile);

    const res = await updateSiteContent(fd);
    setSubmitting(false);
    if (res.error) {
      setMessage({ type: "warn", text: res.error });
      return;
    }
    setMessage({ type: "ok", text: "Homepage content updated." });
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div className="pageTitle">Homepage Content</div>
          <p className="pageSub">Edit the hero banner and campaign section text/images.</p>
        </div>
        <Link href="/admin" className="btn btnOutlineDark">
          ← Back to dashboard
        </Link>
      </div>

      <form onSubmit={submit}>
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div className="detailLabel" style={{ marginBottom: 10 }}>
            Hero banner
          </div>
          <div className="formGrid">
            <label className="field full">
              <span>Kicker (small line above the title)</span>
              <input value={form.heroKicker} onChange={set("heroKicker")} />
            </label>
            <label className="field">
              <span>Title — line 1</span>
              <input value={form.heroTitleLine1} onChange={set("heroTitleLine1")} />
            </label>
            <label className="field">
              <span>Title — accent line</span>
              <input value={form.heroTitleAccent} onChange={set("heroTitleAccent")} />
            </label>
            <label className="field full">
              <span>Body text</span>
              <textarea rows={3} value={form.heroBody} onChange={set("heroBody")} />
            </label>
            <label className="field full">
              <span>Trust line</span>
              <input value={form.heroTrustLine} onChange={set("heroTrustLine")} />
            </label>
            <label className="field full">
              <span>Hero image {initialContent?.heroImage ? "(replace)" : "(optional)"}</span>
              <input type="file" accept="image/*" onChange={(e) => setHeroImageFile(e.target.files[0] || null)} />
            </label>
            {initialContent?.heroImage && (
              <div className="field full">
                <Image src={initialContent.heroImage} alt="" width={200} height={120} style={{ objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div className="detailLabel" style={{ marginBottom: 10 }}>
            Campaign section
          </div>
          <div className="formGrid">
            <label className="field full">
              <span>Kicker</span>
              <input value={form.campaignKicker} onChange={set("campaignKicker")} />
            </label>
            <label className="field">
              <span>Title — line 1</span>
              <input value={form.campaignTitleLine1} onChange={set("campaignTitleLine1")} />
            </label>
            <label className="field">
              <span>Title — accent line</span>
              <input value={form.campaignTitleAccent} onChange={set("campaignTitleAccent")} />
            </label>
            <label className="field full">
              <span>Body text</span>
              <textarea rows={3} value={form.campaignBody} onChange={set("campaignBody")} />
            </label>
            <label className="field full">
              <span>Campaign image (replace)</span>
              <input type="file" accept="image/*" onChange={(e) => setCampaignImageFile(e.target.files[0] || null)} />
            </label>
            {initialContent?.campaignImage && (
              <div className="field full">
                <Image
                  src={initialContent.campaignImage}
                  alt=""
                  width={200}
                  height={120}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              </div>
            )}
          </div>
        </div>

        {message && (
          <div
            className="preorderNote"
            style={{
              background: message.type === "ok" ? "#EAF7EF" : "#FEECEC",
              color: message.type === "ok" ? "#2F8F6B" : "var(--red)",
              marginBottom: 12,
            }}
          >
            {message.text}
          </div>
        )}

        <button type="submit" className="btn btnDark" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
