require("dotenv").config();

const connectDB = require("./config/db");
const Deal = require("./models/Deal");

const seedDeals = async () => {
  const deals = [
    {
      title: "Nimbus Cloud Credits",
      slug: "nimbus-cloud-credits",
      description:
        "$10,000 in cloud credits for early-stage founders building scalable infrastructure.",
      partnerName: "Nimbus Cloud",
      partnerLogoUrl: "https://dummyimage.com/160x80/111827/ffffff&text=Nimbus",
      category: "Cloud",
      accessLevel: "locked",
      eligibility: "Verified startup less than 24 months old.",
      perks: [
        "$10,000 credits",
        "24/7 priority support",
        "Dedicated solution architect",
      ],
      ctaText: "Apply for credits",
      claimInstructions: "Complete verification to unlock this benefit.",
    },
    {
      title: "Pulse Analytics Pro",
      slug: "pulse-analytics-pro",
      description:
        "6 months of product analytics with unlimited events and team seats.",
      partnerName: "Pulse",
      partnerLogoUrl: "https://dummyimage.com/160x80/111827/ffffff&text=Pulse",
      category: "Analytics",
      accessLevel: "public",
      eligibility: "Open to all early-stage teams.",
      perks: ["6 months free", "Unlimited events", "Growth dashboards"],
      ctaText: "Claim free months",
      claimInstructions: "Share your startup email to redeem.",
    },
    {
      title: "Orbit CRM Starter",
      slug: "orbit-crm-starter",
      description:
        "Kickstart your sales pipeline with 12 months of Orbit CRM Starter.",
      partnerName: "Orbit",
      partnerLogoUrl: "https://dummyimage.com/160x80/111827/ffffff&text=Orbit",
      category: "Sales",
      accessLevel: "public",
      eligibility: "Teams under 10 people.",
      perks: ["12 months free", "Team pipelines", "Automations"],
      ctaText: "Activate deal",
      claimInstructions: "Claim the deal and follow the onboarding steps.",
    },
    {
      title: "Spark Marketing Suite",
      slug: "spark-marketing-suite",
      description:
        "Run high-converting campaigns with 50% off Spark Marketing Suite.",
      partnerName: "Spark",
      partnerLogoUrl: "https://dummyimage.com/160x80/111827/ffffff&text=Spark",
      category: "Marketing",
      accessLevel: "locked",
      eligibility: "Verified startups with active product.",
      perks: ["50% off", "Conversion playbooks", "A/B testing"],
      ctaText: "Request access",
      claimInstructions: "Verification required before claiming.",
    },
    {
      title: "Foundry Notion Kit",
      slug: "foundry-notion-kit",
      description:
        "Free workspace templates for founders, product, and ops teams.",
      partnerName: "Foundry",
      partnerLogoUrl:
        "https://dummyimage.com/160x80/111827/ffffff&text=Foundry",
      category: "Productivity",
      accessLevel: "public",
      eligibility: "Open access.",
      perks: ["Founder OS", "Hiring tracker", "Investor updates"],
      ctaText: "Download templates",
      claimInstructions: "Instant access after claiming.",
    },
  ];

  await Deal.deleteMany({});
  await Deal.insertMany(deals);
};

const run = async () => {
  try {
    await connectDB();
    await seedDeals();
    // eslint-disable-next-line no-console
    console.log("Seed completed.");
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed", error);
    process.exit(1);
  }
};

run();
