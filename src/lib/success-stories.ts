import type { PrimaryChannel } from "./mvp-data";

export type SuccessStory = {
  id: string;
  name: string;
  city: string;
  channel: PrimaryChannel;
  productCategory: string;
  monthsActive: number;
  stats: { monthlyRevenue: string; profitMargin: string; ordersPerDay: string };
  journey: string;
  tip: string;
  initials: string;
  accentColor: string;
};

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "priya-s",
    name: "Priya S.",
    city: "Jaipur",
    channel: "meesho",
    productCategory: "Fashion",
    monthsActive: 4,
    stats: { monthlyRevenue: "₹1.2L", profitMargin: "18%", ordersPerDay: "8" },
    journey:
      "Started with just ₹8,000 selling ethnic dupattas on Meesho. Hit consistent daily orders within 6 weeks by focusing on trending prints and fast restocking.",
    tip: "Start with one product category you understand — don't scatter across 10 niches.",
    initials: "PS",
    accentColor: "#f59e0b",
  },
  {
    id: "rahul-m",
    name: "Rahul M.",
    city: "Delhi",
    channel: "amazon",
    productCategory: "Electronics accessories",
    monthsActive: 8,
    stats: { monthlyRevenue: "₹3.5L", profitMargin: "22%", ordersPerDay: "20" },
    journey:
      "Quit his BPO job after 3 months of part-time selling phone cables and chargers. Amazon FBA handles fulfillment so he focuses entirely on sourcing and listings.",
    tip: "FBA removes logistics headache — invest that time in product research instead.",
    initials: "RM",
    accentColor: "#22d3ee",
  },
  {
    id: "sneha-k",
    name: "Sneha K.",
    city: "Bangalore",
    channel: "flipkart",
    productCategory: "Beauty",
    monthsActive: 5,
    stats: { monthlyRevenue: "₹80K", profitMargin: "24%", ordersPerDay: "6" },
    journey:
      "Runs her dropshipping store as a side hustle alongside a full-time IT job. Automated order processing means she spends only 30 minutes daily on the business.",
    tip: "Automate everything you can — your time is the scarcest resource as a side hustler.",
    initials: "SK",
    accentColor: "#34d399",
  },
  {
    id: "amit-p",
    name: "Amit P.",
    city: "Surat",
    channel: "meesho",
    productCategory: "Textiles",
    monthsActive: 12,
    stats: { monthlyRevenue: "₹5L", profitMargin: "15%", ordersPerDay: "35" },
    journey:
      "Leveraged his family's textile connections for factory-direct pricing. Volume play with thin margins but massive order counts — now employs 3 people for packing.",
    tip: "If you have supplier connections, use them. Direct sourcing beats middlemen every time.",
    initials: "AP",
    accentColor: "#f59e0b",
  },
  {
    id: "kavya-r",
    name: "Kavya R.",
    city: "Mumbai",
    channel: "amazon",
    productCategory: "Kitchen",
    monthsActive: 6,
    stats: { monthlyRevenue: "₹2L", profitMargin: "28%", ordersPerDay: "12" },
    journey:
      "Found a gap in premium kitchen organizers on Amazon. Higher price points mean fewer orders needed to hit revenue targets, with better margins than commodity products.",
    tip: "Don't compete on price — find products where customers value quality over cheapness.",
    initials: "KR",
    accentColor: "#fb7185",
  },
  {
    id: "deepak-t",
    name: "Deepak T.",
    city: "Lucknow",
    channel: "amazon",
    productCategory: "Phone accessories",
    monthsActive: 10,
    stats: { monthlyRevenue: "₹4L", profitMargin: "20%", ordersPerDay: "25" },
    journey:
      "Started with ₹15,000 buying phone cases in bulk from Guangzhou via Alibaba. Now sources 12 SKUs and reinvests profits monthly to expand the catalogue.",
    tip: "Reinvest profits for the first 6 months — compounding inventory is how you scale.",
    initials: "DT",
    accentColor: "#22d3ee",
  },
  {
    id: "meera-j",
    name: "Meera J.",
    city: "Chennai",
    channel: "shopify",
    productCategory: "Organic food",
    monthsActive: 7,
    stats: { monthlyRevenue: "₹1.5L", profitMargin: "32%", ordersPerDay: "8" },
    journey:
      "Built her own Shopify store for organic snacks targeting health-conscious urban buyers. Premium pricing and Instagram marketing drive consistent direct orders.",
    tip: "Own your customer relationship — marketplace dependency kills long-term margins.",
    initials: "MJ",
    accentColor: "#34d399",
  },
  {
    id: "vikram-s",
    name: "Vikram S.",
    city: "Pune",
    channel: "flipkart",
    productCategory: "Sports & Fitness",
    monthsActive: 9,
    stats: { monthlyRevenue: "₹2.8L", profitMargin: "19%", ordersPerDay: "15" },
    journey:
      "Seasonal strategy expert — ramps up resistance bands and yoga mats before New Year, shifts to outdoor gear in summer. Inventory planning is his competitive edge.",
    tip: "Plan inventory 2 months ahead of seasonal demand — stockouts during peaks are lost money.",
    initials: "VS",
    accentColor: "#fb7185",
  },
];
