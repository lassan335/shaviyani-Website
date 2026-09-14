export const metadata = { title: "Size Chart — Shaviyani Pro" };

const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const ADULT_ROWS = [
  { label: "Width", values: [18, 19, 20, 21, 22, 23, 24] },
  { label: "Length", values: [26, 27, 28, 29, 30, 31, 32] },
  { label: "Long Sleeve Length", values: [22, 23, 24, 25, 26, 27, 28] },
];

const KID_SIZES = ["TOD", "XS", "S", "M", "L", "XL", "2XL"];
const KID_ROWS = [
  { label: "Width", values: [10, 11, 12, 13, 14, 15, 16] },
  { label: "Length", values: [15, 16, 17, 18, 19, 20, 21] },
  { label: "Long Sleeve Length", values: [12, 13, 14, 15, 16, 17, 18] },
];

function SizeTable({ title, sizes, rows }) {
  return (
    <div className="tableWrap">
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--navy)" }}>{title}</div>
      <table className="sizeTable">
        <thead>
          <tr>
            <th>Size</th>
            {sizes.map((s) => (
              <th key={s}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={{ fontWeight: 700, textAlign: "left" }}>{r.label}</td>
              {r.values.map((v, i) => (
                <td key={sizes[i]}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeChartPage() {
  return (
    <div>
      <div className="page">
        <div className="pageTitle">Official Apparel Size Guide</div>
        <p className="pageSub">
          All measurements in inches. Width is measured flat, armpit to armpit; Length from the
          shoulder seam to the hem; Long Sleeve Length from the shoulder seam to the cuff.
        </p>
      </div>

      <SizeTable title="Adult's Apparel Size" sizes={ADULT_SIZES} rows={ADULT_ROWS} />
      <div style={{ height: 24 }} />
      <SizeTable title="Kid's Apparel Size" sizes={KID_SIZES} rows={KID_ROWS} />

      <div className="page" style={{ paddingTop: 24 }}>
        <div className="proseBlock">
          <h2>How to measure</h2>
          <p>
            <strong>Width:</strong> lay the garment flat and measure straight across, armpit to armpit.
            <br />
            <strong>Length:</strong> measure from the highest point of the shoulder seam down to the
            bottom hem.
            <br />
            <strong>Long Sleeve Length:</strong> measure from the shoulder seam down to the end of the
            cuff.
          </p>
          <p>Still unsure? Message us on +960 933 8292 with your usual jersey size and we'll advise.</p>
        </div>
      </div>
    </div>
  );
}
