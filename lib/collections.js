export const COLLECTIONS = [
  {
    slug: "national-team",
    name: "National Team",
    blurb: "Official Maldives National Team kits",
    gradient: "linear-gradient(135deg, #0E2438, #17A398)",
  },
  {
    slug: "club-kits",
    name: "Club Kits",
    blurb: "Domestic league club jerseys",
    gradient: "linear-gradient(135deg, #17A398, #0E2438)",
  },
  {
    slug: "match-officials",
    name: "Match Officials",
    blurb: "Referee and official match sets",
    gradient: "linear-gradient(135deg, #0E2438, #F2703C)",
  },
  {
    slug: "corporate-apparel",
    name: "Corporate Apparel",
    blurb: "Branded polos and corporate jerseys",
    gradient: "linear-gradient(135deg, #14181C, #17A398)",
  },
  {
    slug: "trophies-awards",
    name: "Trophies & Awards",
    blurb: "Custom trophies, medals and plaques",
    gradient: "linear-gradient(135deg, #D9A441, #14181C)",
  },
];

export function collectionSlugToName(slug) {
  const c = COLLECTIONS.find((c) => c.slug === slug);
  return c ? c.name : slug;
}

export function collectionNameToSlug(name) {
  const c = COLLECTIONS.find((c) => c.name === name);
  return c ? c.slug : name.toLowerCase().replace(/\s+/g, "-");
}
