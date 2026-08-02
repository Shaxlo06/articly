import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Illustrative sample catalog only — Section 6 of the spec calls for a
// separately maintained, queryable journal dataset (in-house curated or a
// licensed source like Scopus/Crossref). Replace this seed before relying on
// match results for real submissions.
const JOURNALS = [
  { name: "Republic Journal of Applied Sciences", field: "multidisciplinary, applied sciences", quartile: null, impactFactor: null, citeScore: null, category: "OAK_REPUBLIC" as const, avgReviewWeeks: 6, websiteUrl: "https://example.org/rjas" },
  { name: "National Bulletin of Pedagogy and Psychology", field: "education, psychology", quartile: null, impactFactor: null, citeScore: null, category: "OAK_REPUBLIC" as const, avgReviewWeeks: 5, websiteUrl: "https://example.org/nbpp" },
  { name: "OAK Herald of Economics", field: "economics, management", quartile: null, impactFactor: null, citeScore: null, category: "OAK_REPUBLIC" as const, avgReviewWeeks: 8, websiteUrl: "https://example.org/ohe" },
  { name: "International Journal of Regional Studies", field: "geography, environmental science, urban studies", quartile: null, impactFactor: null, citeScore: 0.8, category: "OAK_INTERNATIONAL" as const, avgReviewWeeks: 10, websiteUrl: "https://example.org/ijrs" },
  { name: "Eurasian Review of Social Research", field: "sociology, political science", quartile: null, impactFactor: null, citeScore: 1.1, category: "OAK_INTERNATIONAL" as const, avgReviewWeeks: 9, websiteUrl: "https://example.org/ersr" },
  { name: "Journal of Environmental Psychology and Behavior", field: "environmental psychology, cognitive science, urban studies", quartile: "Q2", impactFactor: 3.4, citeScore: 5.1, category: "IMPACT_FACTOR" as const, avgReviewWeeks: 14, websiteUrl: "https://example.org/jepb" },
  { name: "Frontiers in Cognitive Neuroscience", field: "neuroscience, cognitive science, psychology", quartile: "Q1", impactFactor: 5.9, citeScore: 8.2, category: "IMPACT_FACTOR" as const, avgReviewWeeks: 16, websiteUrl: "https://example.org/fcn" },
  { name: "Applied Linguistics Quarterly", field: "linguistics, education, translation studies", quartile: "Q2", impactFactor: 2.1, citeScore: 3.3, category: "SCOPUS" as const, avgReviewWeeks: 12, websiteUrl: "https://example.org/alq" },
  { name: "Computational Materials Review", field: "materials science, computational physics, engineering", quartile: "Q1", impactFactor: 6.7, citeScore: 9.4, category: "SCOPUS" as const, avgReviewWeeks: 18, websiteUrl: "https://example.org/cmr" },
  { name: "Global Public Health Perspectives", field: "public health, epidemiology, medicine", quartile: "Q1", impactFactor: 7.8, citeScore: 10.5, category: "PRESTIGIOUS" as const, avgReviewWeeks: 20, websiteUrl: "https://example.org/gphp" },
  { name: "Annual Review of Environmental Studies", field: "environmental science, sustainability, urban studies", quartile: "Q1", impactFactor: 9.2, citeScore: 12.1, category: "PRESTIGIOUS" as const, avgReviewWeeks: 22, websiteUrl: "https://example.org/arves" },
  { name: "Nature-adjacent Journal of Data Science", field: "data science, statistics, machine learning", quartile: "Q1", impactFactor: 8.4, citeScore: 11.0, category: "PRESTIGIOUS" as const, avgReviewWeeks: 20, websiteUrl: "https://example.org/njds" },
];

async function main() {
  for (const journal of JOURNALS) {
    await prisma.journal.upsert({
      where: { id: journal.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: journal,
      create: { id: journal.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), ...journal },
    });
  }
  console.log(`Seeded ${JOURNALS.length} journals.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
