export type ResourceLink = {
  name: string;
  url: string;
  description: string;
};

export type ResourceCategory = {
  id: string;
  title: string;
  description: string;
  links: ResourceLink[];
};

export const RESOURCE_CATALOG: ResourceCategory[] = [
  {
    id: "legal-gst",
    title: "Legal & GST",
    description: "Registration, compliance, and tax tools referenced in your documentation module.",
    links: [
      {
        name: "GST Portal",
        url: "https://www.gst.gov.in/",
        description: "Official GST registration, returns, and compliance.",
      },
      {
        name: "ClearTax",
        url: "https://cleartax.in/",
        description: "GST filing and registration support for small sellers.",
      },
      {
        name: "TheGSTCo",
        url: "https://www.thegstco.com/",
        description: "GST registration and compliance services.",
      },
      {
        name: "ClearTax HSN Finder",
        url: "https://cleartax.in/s/hsn-code-finder",
        description: "Look up HSN codes before listing - wrong codes trigger rejections.",
      },
    ],
  },
  {
    id: "product",
    title: "Product research",
    description: "Validate demand and margin before you commit to a hero SKU.",
    links: [
      {
        name: "Google Trends",
        url: "https://trends.google.com/",
        description: "Spot rising product categories in India.",
      },
      {
        name: "Helium 10",
        url: "https://www.helium10.com/",
        description: "Amazon-focused product research and keyword tools.",
      },
      {
        name: "SellerSprite",
        url: "https://www.sellersprite.com/",
        description: "Marketplace analytics for competitive niches.",
      },
    ],
  },
  {
    id: "sourcing",
    title: "Sourcing & suppliers",
    description: "Find domestic suppliers and dropship partners - always verify samples first.",
    links: [
      {
        name: "IndiaMART",
        url: "https://www.indiamart.com/",
        description: "B2B supplier directory - negotiate MOQ and samples before paying.",
      },
      {
        name: "TradeIndia",
        url: "https://www.tradeindia.com/",
        description: "Alternate B2B marketplace for product sourcing.",
      },
      {
        name: "BaapStore",
        url: "https://www.baapstore.com/",
        description: "India-focused dropshipping catalog for beginners.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & COD",
    description: "Logistics partners that affect RTO rates and delivery speed.",
    links: [
      {
        name: "Shiprocket",
        url: "https://www.shiprocket.in/",
        description: "Multi-carrier shipping with COD remittance tracking.",
      },
      {
        name: "Delhivery",
        url: "https://www.delhivery.com/",
        description: "Large courier network - compare rates for your pin codes.",
      },
      {
        name: "Confirmify",
        url: "https://confirmify.in/",
        description: "COD order confirmation to reduce RTO before dispatch.",
      },
    ],
  },
  {
    id: "marketplaces",
    title: "Marketplace seller hubs",
    description: "Official onboarding and seller support for Indian channels.",
    links: [
      {
        name: "Amazon Seller Central India",
        url: "https://sellercentral.amazon.in/",
        description: "Amazon India seller registration and listings.",
      },
      {
        name: "Flipkart Seller Hub",
        url: "https://seller.flipkart.com/",
        description: "Flipkart onboarding and catalog management.",
      },
      {
        name: "Meesho Supplier Panel",
        url: "https://supplier.meesho.com/",
        description: "Meesho supplier registration - lower barrier for beginners.",
      },
    ],
  },
  {
    id: "ads",
    title: "Ads & growth",
    description: "Paid channels - only scale after break-even ROAS is known.",
    links: [
      {
        name: "Meta Ads Manager",
        url: "https://www.facebook.com/business/tools/ads-manager",
        description: "Facebook and Instagram ads for D2C and Shopify.",
      },
      {
        name: "Amazon Ads",
        url: "https://advertising.amazon.in/",
        description: "Sponsored products for Amazon India listings.",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & tracking",
    description: "Settlement reconciliation and margin tracking as you scale.",
    links: [
      {
        name: "eVanik",
        url: "https://www.evanik.com/",
        description: "Marketplace settlement and inventory reconciliation.",
      },
      {
        name: "eCominess",
        url: "https://ecominess.com/",
        description: "Profit tracking across marketplaces.",
      },
      {
        name: "TrackEcom",
        url: "https://trackecom.com/",
        description: "Order and settlement analytics for sellers.",
      },
    ],
  },
];
