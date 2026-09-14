export function currency(n) {
  return "MVR " + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
