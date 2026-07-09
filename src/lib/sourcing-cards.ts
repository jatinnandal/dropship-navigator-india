export type CardVerdict = "legit" | "trap";

export type SupplierCard = {
  id: number;
  supplierName: string;
  platform: "IndiaMART" | "Alibaba" | "TradeIndia" | "JustDial";
  product: string;
  chatSnippet: string;
  redFlags: string[];
  greenFlags: string[];
  verdict: CardVerdict;
  explanation: string;
};

export const SOURCING_CARDS: SupplierCard[] = [
  {
    id: 1,
    supplierName: "Shri Balaji Enterprises",
    platform: "IndiaMART",
    product: "Phone cases (TPU)",
    chatSnippet:
      "Sir we can do 500 pcs minimum. ₹18/pc all inclusive. Payment 100% advance via Google Pay. No GST bill, will give kaccha bill. Delivery 3 days guaranteed.",
    redFlags: ["100% advance via Google Pay", "No GST bill", "Kaccha bill"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "100% advance on Google Pay with no GST invoice is a classic scam pattern. Legitimate suppliers accept bank transfer and provide proper GST invoices.",
  },
  {
    id: 2,
    supplierName: "Nexgen Polymers Pvt Ltd",
    platform: "IndiaMART",
    product: "Phone cases (TPU)",
    chatSnippet:
      "MOQ 200 units. ₹22/pc + GST. 50% advance via NEFT, balance before dispatch. Will share GST invoice and test report. Lead time 7-10 working days.",
    redFlags: [],
    greenFlags: ["GST invoice", "NEFT payment", "Test report offered", "Pvt Ltd entity"],
    verdict: "legit",
    explanation:
      "Proper payment terms (NEFT, not UPI/GPay), GST compliance, test reports, and realistic lead time. Pvt Ltd registration adds credibility.",
  },
  {
    id: 3,
    supplierName: "Ali Trading Co",
    platform: "Alibaba",
    product: "LED ring lights",
    chatSnippet:
      "Friend, special price only for you! $2.50/pc, MOQ just 10 pieces. We ship DHL free. Pay by Western Union for best discount. Quality A+++.",
    redFlags: ["Western Union payment", "MOQ 10 pcs", "Free DHL shipping", "A+++ quality claim"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "Western Union is irreversible — zero buyer protection. MOQ of 10 is unrealistically low for a manufacturer. Free DHL on tiny orders is a bait price.",
  },
  {
    id: 4,
    supplierName: "Rajdhani Kitchen Supplies",
    platform: "IndiaMART",
    product: "Stainless steel lunch boxes",
    chatSnippet:
      "We are manufacturer since 2008. GSTIN: 07AABCR1234M1Z5. MOQ 500 pcs. ₹85/pc + GST. 30% advance, 70% against LR copy. Can visit our factory in Wazirpur, Delhi.",
    redFlags: [],
    greenFlags: ["GSTIN shared", "Factory visit offered", "Manufacturer since 2008", "Payment against LR"],
    verdict: "legit",
    explanation:
      "Shares GSTIN upfront, offers factory visit, established since 2008, and payment against lorry receipt (LR) shows confidence in delivery.",
  },
  {
    id: 5,
    supplierName: "Global Sourcing Hub",
    platform: "IndiaMART",
    product: "Bluetooth earbuds",
    chatSnippet:
      "We have exact same product as boAt. ₹120/pc. Brand name printing free. No MOQ. We handle everything — just send money to Paytm.",
    redFlags: ["Exact copy of branded product", "No MOQ", "Paytm payment", "Brand name printing free"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "Selling branded knockoffs is trademark infringement. No MOQ + Paytm-only is a scam signal. Marketplace will delist and possibly ban your account.",
  },
  {
    id: 6,
    supplierName: "Sunrise Textiles",
    platform: "IndiaMART",
    product: "Cotton kurtis",
    chatSnippet:
      "We do private label. MOQ 300 pcs per design. ₹280/pc for cotton, ₹220 for poly-cotton. GST extra. Lead time 15-20 days. Sample charges ₹500 adjustable against order.",
    redFlags: [],
    greenFlags: ["Private label capability", "Sample charges adjustable", "Material options specified", "Realistic lead time"],
    verdict: "legit",
    explanation:
      "Reasonable MOQ, sample charges adjusted against bulk order (industry standard), multiple material options, and realistic production time.",
  },
  {
    id: 7,
    supplierName: "Lucky Star Imports",
    platform: "Alibaba",
    product: "Smart watches",
    chatSnippet:
      "New model just launched! 100% same as Apple Watch. $8/pc. We put any logo. Ship to India no customs problem guaranteed. Pay 100% TT advance.",
    redFlags: ["Counterfeit product", "Customs guarantee", "100% TT advance", "Any logo printing"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "Counterfeit Apple Watch copy — customs will seize it. No supplier can 'guarantee' customs clearance. 100% advance with no trade assurance is high risk.",
  },
  {
    id: 8,
    supplierName: "Maharashtra Agro Products",
    platform: "TradeIndia",
    product: "Organic honey",
    chatSnippet:
      "FSSAI licensed. 500ml jar MOQ 200. ₹145/jar including jar and label. FSSAI number on every jar. Can provide NABL test report. Payment: 40% advance, 60% COD.",
    redFlags: [],
    greenFlags: ["FSSAI licensed", "NABL test report", "COD option", "Labeling compliance mentioned"],
    verdict: "legit",
    explanation:
      "FSSAI license is mandatory for food products. NABL test report shows quality commitment. Offering COD shows confidence.",
  },
  {
    id: 9,
    supplierName: "Priya Collections",
    platform: "IndiaMART",
    product: "Women's handbags",
    chatSnippet:
      "Sir, I am reseller. I buy from Sadar Bazar and supply. Same quality, best price ₹150/pc. No bill. Minimum 50 pcs. Delivery by bus parcel.",
    redFlags: ["Reseller not manufacturer", "No bill", "Bus parcel delivery"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "Reseller with no invoice means no recourse if quality is bad. Bus parcel has no tracking. You cannot verify quality consistency across batches.",
  },
  {
    id: 10,
    supplierName: "Dongguan Yifeng Electronics",
    platform: "Alibaba",
    product: "Wireless chargers",
    chatSnippet:
      "We are Gold Supplier 8 years. BIS certified for India market. MOQ 500. $3.20/pc FOB Shenzhen. Trade Assurance accepted. Can share BIS certificate and factory audit.",
    redFlags: [],
    greenFlags: ["Gold Supplier 8 years", "BIS certified", "Trade Assurance", "Factory audit available"],
    verdict: "legit",
    explanation:
      "Long-standing Gold Supplier with BIS certification (required for electronics in India). Trade Assurance provides payment protection. Factory audit report adds transparency.",
  },
  {
    id: 11,
    supplierName: "Krishna Enterprises",
    platform: "JustDial",
    product: "Yoga mats",
    chatSnippet:
      "WhatsApp pe baat karo sir. JustDial pe detail nahi de sakte. Hamara number 98XXX-XXXXX. Sab best price milega, trust karo.",
    redFlags: ["Moves conversation off-platform", "No details shared", "Trust karo pressure"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "Moving off-platform immediately avoids any record trail. Refusing to share details on the listing itself is a red flag. Legitimate suppliers share pricing openly.",
  },
  {
    id: 12,
    supplierName: "Surat Saree Emporium",
    platform: "IndiaMART",
    product: "Georgette sarees",
    chatSnippet:
      "Running unit in Surat since 2015. MOQ 100 pcs mixed designs. ₹450/pc + GST + packing. Video call available for factory tour. Past clients include Myntra sellers.",
    redFlags: [],
    greenFlags: ["Running since 2015", "Video call factory tour", "References to known sellers", "Transparent pricing breakdown"],
    verdict: "legit",
    explanation:
      "Established unit, offers video factory tour (great for remote verification), references to marketplace sellers, and transparent cost structure.",
  },
  {
    id: 13,
    supplierName: "Fast Deal Traders",
    platform: "IndiaMART",
    product: "Power banks",
    chatSnippet:
      "Imported from China. ₹199/pc flat. 10000mAh guaranteed. No BIS but nobody checks. Running offer — ends today. Minimum 1000 pcs, full advance.",
    redFlags: ["No BIS certification", "Nobody checks claim", "Today-only urgency", "1000 pc MOQ with full advance"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "Power banks require BIS certification in India. Selling without it risks product seizure and legal action. Urgency tactics + full advance on high MOQ = scam pattern.",
  },
  {
    id: 14,
    supplierName: "Tirupur Knits Co-op",
    platform: "IndiaMART",
    product: "Cotton t-shirts",
    chatSnippet:
      "Co-operative society of 12 knitting units. MOQ 500/color. ₹110/pc for 180 GSM cotton. Oeko-Tex certified yarn. Payment: LC or 50% advance. Samples ₹300 + courier.",
    redFlags: [],
    greenFlags: ["Co-operative of 12 units", "Oeko-Tex certified", "LC payment accepted", "GSM specified"],
    verdict: "legit",
    explanation:
      "Tirupur is India's knitwear capital. Co-op structure, Oeko-Tex certification, LC acceptance, and specifying GSM weight shows genuine manufacturer.",
  },
  {
    id: 15,
    supplierName: "Royal Gadgets",
    platform: "IndiaMART",
    product: "CCTV cameras",
    chatSnippet:
      "Sir we have Hikvision at 60% discount. Original with box. Cash payment only. No warranty card but product is original. Can deliver anywhere in India.",
    redFlags: ["60% discount on branded goods", "Cash only", "No warranty card", "Claims original"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "Hikvision at 60% off with no warranty card = stolen or counterfeit goods. Cash-only avoids any transaction trail. Legitimate distributors don't sell without warranty.",
  },
  {
    id: 16,
    supplierName: "Jaipur Blue Pottery Works",
    platform: "IndiaMART",
    product: "Blue pottery home decor",
    chatSnippet:
      "Artisan collective, 8 craftsmen. Each piece handmade, slight variations normal. MOQ 50 pcs assorted. ₹350-800/pc depending on size. GI tagged. Fragile — special packing ₹15/pc extra.",
    redFlags: [],
    greenFlags: ["Artisan collective", "GI tagged", "Honest about variations", "Fragile packing mentioned"],
    verdict: "legit",
    explanation:
      "GI (Geographical Indication) tag means authentic Jaipur blue pottery. Honesty about handmade variations and charging for fragile packing shows genuine artisan business.",
  },
  {
    id: 17,
    supplierName: "Mega Wholesale Zone",
    platform: "IndiaMART",
    product: "Kitchen chopper",
    chatSnippet:
      "Same product as viral reel. ₹45/pc. MOQ only 100. Payment PhonePe. Ready stock, ship today. We supply to 500+ Amazon sellers already.",
    redFlags: ["Viral product bandwagon", "PhonePe only", "Claims 500+ Amazon sellers"],
    greenFlags: ["Ready stock", "Low MOQ"],
    verdict: "trap",
    explanation:
      "Chasing viral products means saturated competition. PhonePe-only payment has no business protection. '500+ Amazon sellers' claim is unverifiable and means you will face extreme competition.",
  },
  {
    id: 18,
    supplierName: "Moradabad Brass House",
    platform: "IndiaMART",
    product: "Brass decorative items",
    chatSnippet:
      "3rd generation brass artisans. Export quality — we supply to Pottery Barn via agent. MOQ 200 pcs. ₹280/pc for 500g items. Can customize designs. MSME registered. Payment by cheque or NEFT.",
    redFlags: [],
    greenFlags: ["3rd generation", "Export quality with reference", "MSME registered", "Cheque/NEFT payment"],
    verdict: "legit",
    explanation:
      "Moradabad is India's brass city. Multi-generational business with export credentials, MSME registration, and proper payment channels. Strong signals.",
  },
  {
    id: 19,
    supplierName: "Quick Import Solutions",
    platform: "Alibaba",
    product: "Silicone kitchen utensils",
    chatSnippet:
      "We are trading company, not factory. But we handle everything — sourcing, QC, shipping. MOQ 1000 pcs. $1.80/pc CIF Mumbai. FDA + LFGB certified. Alibaba Trade Assurance.",
    redFlags: [],
    greenFlags: ["Transparent about being trading co", "QC handling", "CIF pricing", "FDA + LFGB certified", "Trade Assurance"],
    verdict: "legit",
    explanation:
      "Honest about being a trading company (not pretending to be factory). Handling QC, providing CIF pricing (includes shipping to Mumbai), and food-safety certifications. Trade Assurance adds protection.",
  },
  {
    id: 20,
    supplierName: "Diamond Electronics",
    platform: "IndiaMART",
    product: "USB cables",
    chatSnippet:
      "Sir we have all types cables. MRP ₹299 wala cable ₹12 me milega. Printing ready with barcode. No BIS needed for cables. 100% advance. We are based in Gaffar Market.",
    redFlags: ["₹12 for MRP ₹299 product", "Gaffar Market (grey market)", "No BIS claim", "MRP manipulation"],
    greenFlags: [],
    verdict: "trap",
    explanation:
      "Gaffar Market is known for grey market goods. ₹12 cost for MRP ₹299 suggests extremely low quality or counterfeit. Pre-printed inflated MRP is an unfair trade practice under Consumer Protection Act.",
  },
];
