import type { CrisisProtocol, CrisisType } from "@/lib/crisis/types";

export const CRISIS_PROTOCOLS: Record<CrisisType, CrisisProtocol> = {
  account_suspended: {
    type: "account_suspended",
    label: "Account suspended",
    steps: [
      {
        title: "Don't argue in the first ticket",
        body: "Marketplace bots flag emotional replies. Open one case, state facts only, and wait 24 hours before escalating. Arguing in tickets often extends suspensions by weeks.",
        timerLabel: "Wait at least 24h before follow-up",
      },
      {
        title: "Find the trigger metric",
        body: "Check Seller Central / Seller Hub for dispatch rate, late shipment rate, IP complaints, or policy violations. Most suspensions cite one metric — you need the exact number before writing an appeal.",
        actionHref: "/app/tasks/channel-launch",
        actionLabel: "Open account protection guide",
      },
      {
        title: "Write your Plan of Action",
        body: "Use the editor below — pre-filled with your business details. Be specific about root cause, fixes already done, and prevention. Generic POAs get rejected.",
        templateId: "paos",
      },
      {
        title: "Submit appeal with evidence",
        body: "Attach: GST certificate, bank proof, dispatch logs (last 30 days), updated listing screenshots, and supplier SLA if relevant. Submit once — duplicate appeals reset the queue.",
      },
      {
        title: "Follow-up cadence",
        body: "Day 3: polite status check referencing ticket ID. Day 7: escalate with new evidence if no response. Day 14: formal grievance letter. Do not open parallel tickets on the same issue.",
        timerLabel: "Day 3 · Day 7 · Day 14",
      },
    ],
  },
  supplier_oos: {
    type: "supplier_oos",
    label: "Supplier out of stock",
    steps: [
      {
        title: "Within 1 hour — pause listings",
        body: "Do NOT cancel customer orders. Pause or deactivate affected SKUs on every channel. Cancelling damages account metrics; pausing stops new orders while you assess.",
        timerLabel: "Do this first — within 1 hour",
      },
      {
        title: "Within 2 hours — get ETA in writing",
        body: "WhatsApp or email your supplier. You need a written ETA and restock date — verbal promises won't help in marketplace disputes.",
        templateId: "supplier_eta",
      },
      {
        title: "Within 4 hours — hold unshipped orders",
        body: "If ETA is more than 72 hours, contact your courier to hold unshipped parcels. Prevents RTO charges on orders you can't fulfil.",
        timerLabel: "Only if ETA exceeds 72 hours",
      },
      {
        title: "Within 24 hours — message customers",
        body: "Proactive WhatsApp to buyers with pending orders. Honest delay messages reduce cancellations and bad reviews compared to silence.",
        templateId: "customer_whatsapp",
      },
    ],
  },
};

export function getCrisisProtocol(type: CrisisType): CrisisProtocol {
  return CRISIS_PROTOCOLS[type];
}
