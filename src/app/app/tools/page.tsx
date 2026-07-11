import Link from "next/link";
import { Calculator, ShieldCheck } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { PLAN_LABELS, planCovers, requiredPlanForTool, type Plan } from "@/lib/entitlements";
import { getCurrentPlan } from "@/lib/plan";

type CardProps = React.ComponentProps<typeof ToolCard>;

function gatedCard(plan: Plan) {
  return function GatedToolCard(props: CardProps) {
    const slug = props.href?.split("/").pop() ?? "";
    const required = requiredPlanForTool(slug);
    const locked = !planCovers(plan, required);
    return (
      <ToolCard
        {...props}
        status={locked ? "locked" : props.status}
        statusLabel={locked ? `${PLAN_LABELS[required]} plan` : props.statusLabel}
      />
    );
  };
}

export default async function ToolsIndexPage() {
  const plan = await getCurrentPlan();
  const GatedToolCard = gatedCard(plan);
  return (
    <div style={{ maxWidth: "76rem", margin: "0 auto", padding: "0 16px 48px" }}>
      {/* ── Header ── */}
      <div style={{ padding: "0 4px 22px" }}>
        <p className="eyebrow">The toolkit</p>
        <h1
          style={{
            fontSize: 27,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "white",
            lineHeight: 1.25,
            marginTop: 6,
          }}
        >
          Practice the expensive lessons{" "}
          <span className="font-serif-accent">for free.</span>
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: "var(--muted)",
            maxWidth: "40rem",
            marginTop: 10,
          }}
        >
          Every tool here replaces a mistake that costs ₹5,000–₹50,000 to learn
          the hard way. Run the numbers, rehearse the calls, vet the suppliers —
          before a single rupee leaves your account.
        </p>
      </div>

      {/* ── Featured: For your stage ── */}
      <div
        className="panel-raised"
        style={{ padding: "22px 26px", borderRadius: 18 }}
      >
        {/* Section label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "white",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            className="font-mono"
            style={{
              fontSize: "10.5px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "white",
            }}
          >
            For your stage &middot; Product selection
          </span>
        </div>

        {/* Featured cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {/* Profit margin calculator */}
          <Link
            href="/app/tools/margin-calculator"
            className="block"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                borderRadius: 15,
                padding: "20px 22px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.16)",
                    boxShadow: "0 0 18px -4px rgba(255,255,255,0.12)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Calculator size={18} className="text-white" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "white",
                      lineHeight: 1.3,
                    }}
                  >
                    Profit margin calculator
                  </h3>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--text-faint)",
                    }}
                  >
                    ~5 min per product
                  </span>
                </div>
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--muted)",
                }}
              >
                Plug in your product cost, marketplace fees, shipping, and RTO
                rate — see the real margin after every deduction, across every
                channel.
              </p>
            </div>
          </Link>

          {/* Supplier scorecard */}
          <Link
            href="/app/tools/supplier-scorecard"
            className="block"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                borderRadius: 15,
                padding: "20px 22px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.16)",
                    boxShadow: "0 0 18px -4px rgba(255,255,255,0.12)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "white",
                      lineHeight: 1.3,
                    }}
                  >
                    Supplier scorecard
                  </h3>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--text-faint)",
                    }}
                  >
                    ~10 min per supplier
                  </span>
                </div>
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--muted)",
                }}
              >
                Score IndiaMART and Alibaba suppliers on 18 weighted criteria —
                catch the red flags that cause 60–70% of early failures, before
                you pay an advance.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Group 1: Money & margins ── */}
      <section style={{ marginTop: 26 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            padding: "0 4px 12px",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Money &amp; margins
          </h2>
          <span
            className="font-mono"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faintest)",
            }}
          >
            product &middot; payout
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 12,
          }}
        >
          <GatedToolCard
            href="/app/tools/margin-calculator"
            title="Margin calculator"
            description="Fees, TCS, RTO-weighted margins per channel."
            icon="Calculator"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/cashflow-simulator"
            title="Cashflow simulator"
            description="Meta bills today, COD pays day 5-7 — see if you survive week one."
            icon="BarChart3"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/cod-prepaid-simulator"
            title="COD vs prepaid impact"
            description="Exact margin cost of your COD mix and RTO rate, in rupees."
            icon="Repeat"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/payout-reconciliation"
            title="Payout reconciliation"
            description="Upload a settlement CSV — expected vs received per order, plus unclaimed TCS."
            icon="Landmark"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/settlement-timeline"
            title="Settlement timeline"
            description="When each marketplace actually pays, and the buffer you need."
            icon="Receipt"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/shipping-estimator"
            title="Shipping estimator"
            description="Real courier costs — advertised vs. actual, across 5 carriers."
            icon="Truck"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/product-scorecard"
            title="Product scorecard"
            description="Score products on competition, margins, fragility, and returns."
            icon="Target"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/breakeven-roas"
            title="Break-even ROAS"
            description="Your ad-spend floor, computed from real unit economics."
            icon="TrendingUp"
            status="open"
          />
        </div>
      </section>

      {/* ── Group 2: Vetting & decisions ── */}
      <section style={{ marginTop: 26 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            padding: "0 4px 12px",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Vetting &amp; decisions
          </h2>
          <span
            className="font-mono"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faintest)",
            }}
          >
            supplier &middot; launch
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 12,
          }}
        >
          <GatedToolCard
            href="/app/tools/supplier-scorecard"
            title="Supplier scorecard"
            description="Vet IndiaMART suppliers — catch the red flags systematically."
            icon="ShieldCheck"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/decision-trees"
            title="Decision wizards"
            description="Which marketplace? FBA or FBM? COD or prepaid? Answer in minutes."
            icon="GitBranch"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/whatsapp-templates"
            title="WhatsApp templates"
            description="Proven scripts for order confirmation, delivery, and reviews."
            icon="MessageSquare"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/cod-simulator"
            title="COD call simulator"
            description="Practice the confirmation call that decides ship vs. return."
            icon="Phone"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/sourcing-game"
            title="Sourcing swipe game"
            description="Real supplier chats — swipe trap or legit, learn the patterns."
            icon="Gamepad2"
            status="open"
          />
        </div>
      </section>

      {/* ── Group 3: Compliance & documents ── */}
      <section style={{ marginTop: 26 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            padding: "0 4px 12px",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Compliance &amp; documents
          </h2>
          <span
            className="font-mono"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faintest)",
            }}
          >
            docs &middot; gst
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 12,
          }}
        >
          <GatedToolCard
            href="/app/tools/gst-calendar"
            title="GST filing calendar"
            description="GSTR-1, GSTR-3B, TCS reconciliation with prep checklists."
            icon="Calendar"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/verification-checklist"
            title="Verification checklist"
            description="GSTIN and PAN format checks, cross-document name matching."
            icon="ClipboardCheck"
            status="open"
          />
          <GatedToolCard
            href="/app/tools/document-checker"
            title="Document checker"
            description="Pre-submission validation — the #1 cause of KYC rejection."
            icon="FolderCheck"
            status="open"
          />
        </div>
      </section>

      {/* ── Group 4: Growth & planning ── */}
      <section style={{ marginTop: 26 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            padding: "0 4px 12px",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Growth &amp; planning
          </h2>
          <span
            className="font-mono"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faintest)",
            }}
          >
            seasons &middot; proof
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 12,
          }}
        >
          <GatedToolCard
            href="/app/tools/seasonal-calendar"
            title="Seasonal calendar"
            description="21 Indian sale events with prep timelines and budget multipliers."
            icon="CalendarDays"
            status="open"
          />
        </div>
      </section>

    </div>
  );
}
