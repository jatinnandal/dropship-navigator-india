export type DecisionNode = {
  id: string;
  question: string;
  context?: string;
  options: { label: string; nextId: string | null; recommendation?: string }[];
};

export type DecisionTree = {
  id: string;
  title: string;
  description: string;
  icon: string;
  nodes: DecisionNode[];
  startNodeId: string;
};

export const DECISION_TREES: DecisionTree[] = [
  {
    id: "marketplace",
    title: "Which marketplace to start with?",
    description:
      "Find the best platform for your capital, product type, and experience level.",
    icon: "Store",
    startNodeId: "capital",
    nodes: [
      {
        id: "capital",
        question: "What's your starting capital?",
        context:
          "Your budget determines which platforms are realistic - some have hidden costs that eat into thin margins.",
        options: [
          { label: "Less than ₹10,000", nextId: "low-gst" },
          { label: "₹10,000 - ₹50,000", nextId: "mid-product" },
          { label: "More than ₹50,000", nextId: "high-experience" },
        ],
      },
      {
        id: "low-gst",
        question: "Do you have GST registration?",
        context:
          "Amazon and Flipkart require a GSTIN. Meesho also onboards sellers without one via a free Enrolment ID (intra-state sales only).",
        options: [
          {
            label: "Yes, I have GST",
            nextId: null,
            recommendation:
              "Start with Meesho - zero commission, zero risk. Build your reviews and learn the system before investing more.",
          },
          {
            label: "No, not yet",
            nextId: null,
            recommendation:
              "You can start on Meesho THIS WEEK without a GSTIN: get a free Enrolment ID from the GST portal (works for intra-state sales, turnover under ₹40L). Register a full GSTIN (free on gst.gov.in) in parallel - you'll need it for Amazon/Flipkart and to ship outside your state.",
          },
        ],
      },
      {
        id: "mid-product",
        question: "What product type are you selling?",
        context:
          "Each marketplace has different commission structures and buyer demographics by category.",
        options: [
          {
            label: "Fashion & Apparel",
            nextId: null,
            recommendation:
              "Start with Meesho (zero commission for fashion), build volume and reviews, then expand to Flipkart for higher-ticket fashion items.",
          },
          {
            label: "Electronics & Gadgets",
            nextId: null,
            recommendation:
              "Go with Amazon - buyers trust it more for electronics. Higher commission but better conversion rates and lower return rates for electronics.",
          },
          {
            label: "General / Home / Kitchen",
            nextId: null,
            recommendation:
              "Flipkart is your best bet - lower commission than Amazon for general categories, and strong buyer base in Tier 2-3 cities where these products sell most.",
          },
        ],
      },
      {
        id: "high-experience",
        question: "What's your e-commerce experience level?",
        context:
          "More capital doesn't always mean you should go to the hardest platform. Learning costs are real.",
        options: [
          {
            label: "Beginner - first time selling online",
            nextId: null,
            recommendation:
              "Start with Meesho to learn marketplace operations risk-free. Once you're comfortable with order management, listings, and returns - expand to Amazon/Flipkart within 2-3 months.",
          },
          {
            label: "Experienced - sold before or have retail background",
            nextId: null,
            recommendation:
              "Go directly to Amazon - highest margins if you can handle the complexity (FBA logistics, A+ content, advertising). Your experience lets you skip the learning curve that kills beginners.",
          },
        ],
      },
    ],
  },
  {
    id: "fba-vs-fbm",
    title: "FBA vs Self-fulfilled (FBM)?",
    description:
      "Should Amazon handle your shipping, or should you do it yourself?",
    icon: "Warehouse",
    startNodeId: "volume",
    nodes: [
      {
        id: "volume",
        question: "What's your monthly order volume?",
        context:
          "FBA has minimum fees that only make sense above a certain volume threshold.",
        options: [
          { label: "Less than 50 orders/month", nextId: null, recommendation: "Self-fulfill (FBM) - FBA minimum fees don't justify at this volume. You'd pay ₹30-50 per unit in storage even if orders are slow. Ship yourself and keep that margin." },
          { label: "50-200 orders/month", nextId: "mid-weight" },
          { label: "More than 200 orders/month", nextId: "high-ops" },
        ],
      },
      {
        id: "mid-weight",
        question: "What's your average product weight?",
        context:
          "FBA storage fees are weight and volume-based. Light products benefit most.",
        options: [
          {
            label: "Under 500g (accessories, small items)",
            nextId: null,
            recommendation:
              "FBA is worth it - storage is cheap for light items, and the Prime badge is a meaningful conversion booster. The math works in your favor.",
          },
          {
            label: "Over 1kg (electronics, kitchenware)",
            nextId: null,
            recommendation:
              "Self-fulfill - FBA storage for heavy items eats your margins fast. At ₹8-12 per kg/month in storage plus weight-based pick-pack fees, you're better off with your own 3PL.",
          },
        ],
      },
      {
        id: "high-ops",
        question: "Can you handle operations at scale?",
        context:
          "At 200+ orders, shipping logistics become a full-time job. Be honest about your capacity.",
        options: [
          {
            label: "Yes - I have a team or 3PL partner",
            nextId: null,
            recommendation:
              "Self-fulfill - fulfillment usually costs meaningfully less than FBA at this scale, and you keep control over packaging and customer experience. Use a reliable 3PL like Delhivery/Shiprocket.",
          },
          {
            label: "No - I'm a solo operator",
            nextId: null,
            recommendation:
              "Use FBA - let Amazon handle the logistics nightmare. Yes, it costs more, but trying to ship 200+ orders solo will destroy your customer ratings and your sanity. Focus on sourcing and marketing instead.",
          },
        ],
      },
    ],
  },
  {
    id: "product-niche",
    title: "Which product niche?",
    description:
      "Find the right niche based on your budget and risk appetite.",
    icon: "Package",
    startNodeId: "inventory-budget",
    nodes: [
      {
        id: "inventory-budget",
        question: "Your budget for first inventory order?",
        context:
          "Your first inventory should be a learning investment - don't over-commit before validating demand.",
        options: [
          {
            label: "Under ₹5,000",
            nextId: null,
            recommendation:
              "Focus on accessories, phone cases, or stationery - low cost per unit (₹20-80) means you can test 50-100 units across 3-4 SKUs. Learn what sells before investing more.",
          },
          { label: "₹5,000 - ₹20,000", nextId: "mid-interest" },
          { label: "Over ₹20,000", nextId: "high-risk" },
        ],
      },
      {
        id: "mid-interest",
        question: "What interests you? (Pick what you understand best)",
        context:
          "Selling in a category you understand helps you write better listings and identify quality issues.",
        options: [
          {
            label: "Fashion & Clothing",
            nextId: null,
            recommendation:
              "Fashion has high margins (3-5x) but also high returns (25-40%). Start with basics (t-shirts, kurtas) not trendy pieces. Source from Surat or Tirupur for best wholesale rates.",
          },
          {
            label: "Beauty & Personal Care",
            nextId: null,
            recommendation:
              "Beauty products have strong repeat purchase rates and decent margins (2-3x). Start with established Indian brands (not white-label) to avoid compliance headaches. Must have proper FSSAI/cosmetic licenses.",
          },
          {
            label: "Kitchen & Home",
            nextId: null,
            recommendation:
              "Kitchen products are evergreen with low return rates (5-10%). Focus on items under ₹500 for impulse purchases. Source from Rajkot (steel) or Delhi (plastic/melamine) wholesale markets.",
          },
          {
            label: "Electronics Accessories",
            nextId: null,
            recommendation:
              "Cables, chargers, phone accessories - high volume, moderate margins (2x). Extremely competitive but fast-moving. Source from Shenzhen via Alibaba or Delhi Gaffar Market for small lots.",
          },
        ],
      },
      {
        id: "high-risk",
        question: "What's your risk tolerance?",
        context:
          "Higher risk products can mean higher returns, but seasonal/trending items can also leave you with dead stock.",
        options: [
          {
            label: "Low - I want steady, predictable sales",
            nextId: null,
            recommendation:
              "Go with evergreen products - kitchen organizers, storage containers, bathroom accessories. They sell year-round with consistent demand. Boring but profitable.",
          },
          {
            label: "High - I'm okay with volatility for bigger wins",
            nextId: null,
            recommendation:
              "Trending and seasonal products can multiply your money fast - but timing is everything. Watch social media trends, festival seasons, and IPL/cricket merchandise windows. Keep a meaningful share of stock as evergreen backup.",
          },
        ],
      },
    ],
  },
  {
    id: "cod-prepaid",
    title: "COD or prepaid only?",
    description:
      "Should you offer Cash on Delivery, or push prepaid to reduce RTO?",
    icon: "Banknote",
    startNodeId: "price-point",
    nodes: [
      {
        id: "price-point",
        question: "What's your average product price point?",
        context:
          "Price determines buyer psychology - low-ticket buyers need COD for trust, high-ticket buyers are more committed.",
        options: [
          {
            label: "Under ₹300",
            nextId: null,
            recommendation:
              "COD is almost mandatory at this price - conversion falls off a cliff without it. Buyers won't prepay for cheap items they haven't tried. Budget a 15-20% RTO cost and price accordingly.",
          },
          { label: "₹300 - ₹1,000", nextId: "mid-category" },
          {
            label: "Over ₹1,000",
            nextId: null,
            recommendation:
              "Prepaid preferred - COD RTO at this price means ₹200-400 loss per failed delivery (forward + return shipping). Offer EMI options, pay-later (Simpl/LazyPay), and UPI discounts to incentivize prepaid.",
          },
        ],
      },
      {
        id: "mid-category",
        question: "What category are you selling in?",
        context:
          "Some categories have higher trial behavior (fashion) while others are more considered purchases (electronics).",
        options: [
          {
            label: "Fashion & Apparel",
            nextId: null,
            recommendation:
              "Keep COD enabled - fashion has high trial behavior (\"let me try before I pay\"). Expect 30-40% RTO. Mitigate with COD verification calls and slight COD price premium (₹30-50 extra).",
          },
          {
            label: "Electronics & Gadgets",
            nextId: null,
            recommendation:
              "Prepaid works fine here - electronics buyers research before purchasing, so intent is higher. Offer 5% prepaid discount. Your RTO will be much lower (10-15%) even with COD disabled.",
          },
          {
            label: "General / Mixed",
            nextId: null,
            recommendation:
              "Use a 60/40 COD/prepaid mix - enable COD but actively push prepaid with discounts (₹30-50 off for prepaid). Use automated order confirmation calls to reduce RTO on COD orders.",
          },
        ],
      },
    ],
  },
];
