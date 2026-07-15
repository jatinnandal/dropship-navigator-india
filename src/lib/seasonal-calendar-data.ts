export type SaleEvent = {
  id: string;
  name: string;
  platforms: ("amazon" | "flipkart" | "meesho" | "all")[];
  startMonth: number; // 0-indexed
  startDay: number;
  durationDays: number;
  prepWeeks: number;
  category: "mega" | "major" | "moderate" | "niche";
  tips: string[];
};

export const SALE_EVENTS: SaleEvent[] = [
  // Mega
  {
    id: "diwali-bbd",
    name: "Diwali / Big Billion Days",
    platforms: ["flipkart", "amazon"],
    startMonth: 9,
    startDay: 5,
    durationDays: 10,
    prepWeeks: 6,
    category: "mega",
    tips: [
      "Stock 3-4x normal inventory for top SKUs",
      "Create festive bundles and combo offers",
      "Increase ad budget 3-4x - CPCs spike but conversion rate doubles",
      "Pre-list deals in platform deal portals by submission deadline",
      "Ensure all listings have 5+ images and A+ content",
    ],
  },
  {
    id: "great-indian-festival",
    name: "Amazon Great Indian Festival",
    platforms: ["amazon"],
    startMonth: 9,
    startDay: 8,
    durationDays: 10,
    prepWeeks: 6,
    category: "mega",
    tips: [
      "Enroll in Lightning Deals and Best Deals early",
      "Optimize for Amazon's 'Recommended' badge",
      "Prepare for Prime Early Access phase",
      "Set up coupons and Subscribe & Save offers",
      "Monitor competitor pricing daily during the event",
    ],
  },
  {
    id: "republic-day-sale",
    name: "Republic Day Sale",
    platforms: ["all"],
    startMonth: 0,
    startDay: 20,
    durationDays: 7,
    prepWeeks: 4,
    category: "mega",
    tips: [
      "Post-Diwali clearance + fresh winter stock",
      "Focus on electronics and home categories",
      "Create patriotic themed bundles",
      "Bid aggressively on category keywords",
    ],
  },
  {
    id: "independence-day-sale",
    name: "Independence Day Sale",
    platforms: ["all"],
    startMonth: 7,
    startDay: 8,
    durationDays: 7,
    prepWeeks: 4,
    category: "mega",
    tips: [
      "Strong fashion and electronics demand",
      "Pre-monsoon clearance for seasonal goods",
      "Freedom-themed messaging works well in creatives",
      "Back-to-school adjacent - stationery and bags move fast",
    ],
  },
  // Major
  {
    id: "flipkart-big-saving-q1",
    name: "Flipkart Big Saving Days (Q1)",
    platforms: ["flipkart"],
    startMonth: 2,
    startDay: 15,
    durationDays: 5,
    prepWeeks: 3,
    category: "major",
    tips: [
      "Focus on mobile accessories and fashion",
      "Register for Flipkart's deal portal early",
      "Maintain good SLA scores for visibility boost",
    ],
  },
  {
    id: "flipkart-big-saving-q3",
    name: "Flipkart Big Saving Days (Q3)",
    platforms: ["flipkart"],
    startMonth: 8,
    startDay: 1,
    durationDays: 5,
    prepWeeks: 3,
    category: "major",
    tips: [
      "Pre-festive warm-up - test your supply chain",
      "Good time to test new listings before Diwali rush",
      "Focus on home decor and electronics",
    ],
  },
  {
    id: "amazon-prime-day",
    name: "Amazon Prime Day",
    platforms: ["amazon"],
    startMonth: 6,
    startDay: 15,
    durationDays: 2,
    prepWeeks: 4,
    category: "major",
    tips: [
      "Only Prime-eligible listings get full visibility",
      "Submit Lightning Deals 4+ weeks before",
      "Focus on high-margin products - deep discounts expected",
      "Increase PPC budget 2-3x for these 48 hours",
    ],
  },
  {
    id: "navratri-sale",
    name: "Navratri Sale",
    platforms: ["all"],
    startMonth: 9,
    startDay: 1,
    durationDays: 9,
    prepWeeks: 3,
    category: "major",
    tips: [
      "Ethnic wear, jewellery, and puja items peak",
      "Color-of-the-day campaigns drive engagement",
      "Gift hampers and combo packs sell well",
    ],
  },
  {
    id: "holi-sale",
    name: "Holi Sale",
    platforms: ["all"],
    startMonth: 2,
    startDay: 20,
    durationDays: 5,
    prepWeeks: 3,
    category: "major",
    tips: [
      "Colors, water guns, whites/fashion dominate",
      "Skin and hair care products see a spike",
      "Gift packs and organic colors trending",
    ],
  },
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan Sale",
    platforms: ["all"],
    startMonth: 7,
    startDay: 15,
    durationDays: 5,
    prepWeeks: 3,
    category: "major",
    tips: [
      "Gift-focused categories: grooming, accessories, chocolates",
      "Rakhi + gift combos are top sellers",
      "Express delivery is a must - last-minute buyers dominate",
    ],
  },
  // Moderate
  {
    id: "valentines-day",
    name: "Valentine's Day Sale",
    platforms: ["all"],
    startMonth: 1,
    startDay: 7,
    durationDays: 7,
    prepWeeks: 2,
    category: "moderate",
    tips: [
      "Gifts, chocolates, fashion accessories peak",
      "Personalized products have higher margins",
      "Start ads from Feb 7 for the full week build-up",
    ],
  },
  {
    id: "mothers-day",
    name: "Mother's Day Sale",
    platforms: ["all"],
    startMonth: 4,
    startDay: 5,
    durationDays: 7,
    prepWeeks: 2,
    category: "moderate",
    tips: [
      "Home decor, kitchen appliances, wellness products",
      "Gift wrapping option boosts conversion",
      "Emotional messaging in creatives converts better",
    ],
  },
  {
    id: "fathers-day",
    name: "Father's Day Sale",
    platforms: ["all"],
    startMonth: 5,
    startDay: 10,
    durationDays: 7,
    prepWeeks: 2,
    category: "moderate",
    tips: [
      "Gadgets, grooming, wallets, watches move fast",
      "Bundle deals work well for gifting",
      "Target last-minute shoppers with express delivery",
    ],
  },
  {
    id: "back-to-school",
    name: "Back to School",
    platforms: ["amazon", "flipkart"],
    startMonth: 5,
    startDay: 20,
    durationDays: 14,
    prepWeeks: 3,
    category: "moderate",
    tips: [
      "Stationery, bags, uniforms, electronics for students",
      "Bulk/value packs convert well",
      "Target parent demographics in ads",
    ],
  },
  {
    id: "monsoon-sale",
    name: "Monsoon Sale",
    platforms: ["all"],
    startMonth: 6,
    startDay: 1,
    durationDays: 10,
    prepWeeks: 2,
    category: "moderate",
    tips: [
      "Rain gear, home improvement, indoor fitness",
      "Waterproofing products and umbrellas spike",
      "Apparel: raincoats, waterproof shoes",
    ],
  },
  {
    id: "summer-sale",
    name: "Summer Sale",
    platforms: ["all"],
    startMonth: 4,
    startDay: 1,
    durationDays: 14,
    prepWeeks: 3,
    category: "moderate",
    tips: [
      "Coolers, ACs, cotton clothing, sunscreen",
      "Outdoor and travel accessories move",
      "Clearance of winter inventory at deep discounts",
    ],
  },
  // Niche
  {
    id: "womens-day",
    name: "Women's Day Sale",
    platforms: ["all"],
    startMonth: 2,
    startDay: 5,
    durationDays: 5,
    prepWeeks: 2,
    category: "niche",
    tips: [
      "Beauty, fashion, wellness categories spike",
      "Women-owned brand angle resonates",
      "Self-care bundles and subscription boxes",
    ],
  },
  {
    id: "onam",
    name: "Onam Sale",
    platforms: ["amazon", "flipkart"],
    startMonth: 7,
    startDay: 25,
    durationDays: 10,
    prepWeeks: 3,
    category: "niche",
    tips: [
      "Strong in Kerala - electronics, gold, sarees",
      "Regional targeting in ads is essential",
      "Festive home decor and kitchen items",
    ],
  },
  {
    id: "pongal",
    name: "Pongal Sale",
    platforms: ["all"],
    startMonth: 0,
    startDay: 10,
    durationDays: 5,
    prepWeeks: 2,
    category: "niche",
    tips: [
      "Strong in Tamil Nadu - clothing, kitchen, gifts",
      "Regional language listings improve conversion",
      "Traditional items and modern gifting combos",
    ],
  },
  {
    id: "christmas-newyear",
    name: "Christmas & New Year Sale",
    platforms: ["all"],
    startMonth: 11,
    startDay: 20,
    durationDays: 12,
    prepWeeks: 3,
    category: "niche",
    tips: [
      "Gift items, party supplies, winter fashion",
      "New Year resolution products: fitness, planners",
      "Year-end clearance drives volume",
    ],
  },
  {
    id: "karwa-chauth",
    name: "Karwa Chauth Sale",
    platforms: ["all"],
    startMonth: 9,
    startDay: 20,
    durationDays: 5,
    prepWeeks: 2,
    category: "niche",
    tips: [
      "Jewellery, sarees, beauty products spike",
      "Gift sets and couple combos",
      "North India focused - target accordingly",
    ],
  },
];

export function getUpcomingEvents(
  fromDate: Date,
  count: number = 5
): (SaleEvent & { daysUntil: number; inPrepWindow: boolean })[] {
  const results: (SaleEvent & { daysUntil: number; inPrepWindow: boolean })[] = [];

  for (const event of SALE_EVENTS) {
    // Build event date for this year and next year
    const thisYear = fromDate.getFullYear();
    for (const year of [thisYear, thisYear + 1]) {
      const eventDate = new Date(year, event.startMonth, event.startDay);
      const diffMs = eventDate.getTime() - fromDate.getTime();
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysUntil >= -event.durationDays && daysUntil <= 365) {
        const prepStartDays = daysUntil - event.prepWeeks * 7;
        const inPrepWindow = daysUntil > 0 && prepStartDays <= 0;

        if (daysUntil >= 0) {
          results.push({ ...event, daysUntil, inPrepWindow });
        }
      }
    }
  }

  results.sort((a, b) => a.daysUntil - b.daysUntil);

  // Deduplicate by id (pick the soonest occurrence)
  const seen = new Set<string>();
  const unique: typeof results = [];
  for (const r of results) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      unique.push(r);
    }
  }

  return unique.slice(0, count);
}

export function getEventsForMonth(month: number): SaleEvent[] {
  return SALE_EVENTS.filter((e) => e.startMonth === month);
}
