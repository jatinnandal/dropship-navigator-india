export type WhatsAppTemplate = {
  id: string;
  category:
    | "order-confirm"
    | "shipping"
    | "delivery"
    | "rto-prevention"
    | "review-request"
    | "reorder";
  title: string;
  message: string;
  placeholders: string[];
  bestPractice: string;
  timing: string;
};

export const WHATSAPP_CATEGORIES: {
  id: WhatsAppTemplate["category"];
  label: string;
}[] = [
  { id: "order-confirm", label: "Order Confirmation" },
  { id: "shipping", label: "Shipping Updates" },
  { id: "delivery", label: "Delivery" },
  { id: "rto-prevention", label: "RTO Prevention" },
  { id: "review-request", label: "Review Request" },
  { id: "reorder", label: "Reorder" },
];

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  // Order Confirmation
  {
    id: "oc-1",
    category: "order-confirm",
    title: "Order Confirmed - Warm",
    message:
      "Hi {{name}}! 🎉 Your order #{{orderId}} for {{product}} is confirmed. We're packing it with care! You'll get tracking info within 24hrs. Questions? Reply here.",
    placeholders: ["name", "orderId", "product"],
    bestPractice:
      "Send within 5 minutes of order placement. Immediate confirmation reduces cancellation anxiety.",
    timing: "Immediately after order placed",
  },
  {
    id: "oc-2",
    category: "order-confirm",
    title: "Payment Received + Dispatch ETA",
    message:
      "Thank you {{name}}! Payment received for {{product}}. Dispatching within {{hours}} hours. Track here: {{link}}",
    placeholders: ["name", "product", "hours", "link"],
    bestPractice:
      "Setting clear dispatch expectations reduces 'where is my order' messages by 40%.",
    timing: "Immediately after payment confirmation",
  },
  {
    id: "oc-3",
    category: "order-confirm",
    title: "COD Order Confirmed",
    message:
      "Hi {{name}}! Your COD order for {{product}} (₹{{amount}}) is confirmed. Please keep ₹{{amount}} ready at delivery. We'll share tracking soon!",
    placeholders: ["name", "product", "amount"],
    bestPractice:
      "For COD, always restate the amount. Reduces RTO from 'I didn't know the price' excuse.",
    timing: "Immediately after order placed",
  },

  // Shipping
  {
    id: "sh-1",
    category: "shipping",
    title: "Shipped - With Courier Details",
    message:
      "Hi {{name}}! Your order is on the way 🚚 Tracking: {{trackingId}} via {{courier}}. Expected delivery: {{date}}. Any issues? Just reply!",
    placeholders: ["name", "trackingId", "courier", "date"],
    bestPractice:
      "Include courier name - customers often confuse which delivery person to expect.",
    timing: "Within 1 hour of dispatch",
  },
  {
    id: "sh-2",
    category: "shipping",
    title: "Left Warehouse Update",
    message:
      "Quick update: Your package left our warehouse. ETA {{date}}. You can track anytime: {{link}}",
    placeholders: ["date", "link"],
    bestPractice:
      "Short and direct. Don't over-message - one shipping update is enough unless delayed.",
    timing: "When order leaves warehouse/fulfillment center",
  },
  {
    id: "sh-3",
    category: "shipping",
    title: "Delay Notification",
    message:
      "Hi {{name}}, your order is slightly delayed due to {{reason}}. New expected date: {{date}}. Sorry for the wait - we're on it! Reply if you have questions.",
    placeholders: ["name", "reason", "date"],
    bestPractice:
      "Proactive delay messages reduce negative reviews by 50%. Always give a new ETA.",
    timing: "As soon as delay is detected",
  },

  // Delivery
  {
    id: "dl-1",
    category: "delivery",
    title: "Delivered - With Support Window",
    message:
      "Delivered! ✅ Your {{product}} should be with you now. Any issues in the next {{days}} days? Just message us. Enjoy!",
    placeholders: ["product", "days"],
    bestPractice:
      "Mentioning support window builds trust and reduces marketplace complaints.",
    timing: "30 minutes after delivery confirmation",
  },
  {
    id: "dl-2",
    category: "delivery",
    title: "Delivery Confirmation Request",
    message:
      "Hi {{name}}! Our records show your {{product}} was delivered. Did you receive it? Reply YES if all good, or let us know if there's any issue.",
    placeholders: ["name", "product"],
    bestPractice:
      "Confirming delivery helps catch theft/misdelivery early and shows you care.",
    timing: "1-2 hours after delivery",
  },

  // RTO Prevention
  {
    id: "rto-1",
    category: "rto-prevention",
    title: "COD Out for Delivery - Amount Reminder",
    message:
      "Hi {{name}}! Your COD order (₹{{amount}}) is out for delivery today. Please keep the exact amount ready. If you need to reschedule, reply NOW to avoid return.",
    placeholders: ["name", "amount"],
    bestPractice:
      "This single message can reduce RTO by 15-20%. Send morning of delivery day.",
    timing: "Morning of delivery day (7-9 AM)",
  },
  {
    id: "rto-2",
    category: "rto-prevention",
    title: "Failed Delivery - Options",
    message:
      "We noticed delivery couldn't be completed. Would you like to: 1️⃣ Reschedule for tomorrow 2️⃣ Change address 3️⃣ Cancel order. Reply with number!",
    placeholders: [],
    bestPractice:
      "Give clear numbered options. 60% of failed deliveries convert when you offer reschedule.",
    timing: "Within 1 hour of failed delivery attempt",
  },
  {
    id: "rto-3",
    category: "rto-prevention",
    title: "Delivery Reminder - Answer the Call",
    message:
      "Friendly reminder: Your order arrives today! The delivery person will call. Please answer to confirm. If unavailable, we'll try again tomorrow.",
    placeholders: [],
    bestPractice:
      "Many RTOs happen because customer doesn't answer unknown numbers. This primes them.",
    timing: "Morning of delivery day",
  },
  {
    id: "rto-4",
    category: "rto-prevention",
    title: "Address Verification (High-Risk)",
    message:
      "Hi {{name}}! We're preparing your order for {{pincode}}. Please confirm your full address is correct: {{address}}. Reply CORRECT or send updated address.",
    placeholders: ["name", "pincode", "address"],
    bestPractice:
      "Use for high-value COD or remote pincodes. Catches wrong-address RTOs before dispatch.",
    timing: "Before dispatch (for flagged orders)",
  },

  // Review Request
  {
    id: "rv-1",
    category: "review-request",
    title: "Review Request - Friendly",
    message:
      "Hi {{name}}! Hope you're loving your {{product}}! 🌟 Could you take 30 seconds to leave a review? It helps other buyers like you: {{link}}",
    placeholders: ["name", "product", "link"],
    bestPractice:
      "Ask 3-5 days after delivery. Too early feels pushy, too late they've forgotten.",
    timing: "3-5 days after delivery",
  },
  {
    id: "rv-2",
    category: "review-request",
    title: "Review Request - With Issue Catch",
    message:
      "Hey {{name}}! How's the {{product}} working out? If happy, a quick review means the world to us: {{link}}. Issues? Reply and we'll fix it.",
    placeholders: ["name", "product", "link"],
    bestPractice:
      "Offering to fix issues BEFORE they review prevents negative ratings on marketplace.",
    timing: "5-7 days after delivery",
  },

  // Reorder
  {
    id: "ro-1",
    category: "reorder",
    title: "Reorder Reminder - With Discount",
    message:
      "Hi {{name}}! It's been {{weeks}} weeks since you got {{product}}. Running low? Reorder here with {{discount}}% off: {{link}}",
    placeholders: ["name", "weeks", "product", "discount", "link"],
    bestPractice:
      "Time this based on product consumption cycle. Skincare: 4-6 weeks, supplements: 3-4 weeks.",
    timing: "Based on product consumption cycle",
  },
  {
    id: "ro-2",
    category: "reorder",
    title: "Restock Alert - No Discount",
    message:
      "Hi {{name}}! Your {{product}} might be running low. We've kept stock aside for you - reorder anytime: {{link}}",
    placeholders: ["name", "product", "link"],
    bestPractice:
      "Don't always discount. 'Kept stock aside' creates urgency without eroding margins.",
    timing: "Based on product consumption cycle",
  },
];
