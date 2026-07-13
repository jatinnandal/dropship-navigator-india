"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Phone,
  RotateCcw,
  ChevronRight,
  Check,
  X,
  Truck,
  AlertTriangle,
  MessageSquare,
  Star,
} from "lucide-react";
import {
  COD_SCENARIOS,
  type Scenario,
  type ReplyOption,
  type Localized,
  type ScenarioLanguage,
} from "@/lib/cod-scenarios";

const LANG_KEY = "dni-scenario-lang";

/** Wrap language-invariant text (context, coaching) in the Localized shape. */
const asLocalized = (s: string): Localized => ({ en: s, hinglish: s });

type ChatMessage = {
  role: "customer" | "seller" | "system";
  text: Localized;
  quality?: ReplyOption["quality"];
};

type ScenarioState = {
  scenarioId: string;
  turnIndex: number;
  score: number;
  maxScore: number;
  messages: ChatMessage[];
  phase: "playing" | "reacting" | "outcome";
  chosenOptions: ReplyOption[];
};

function difficultyLabel(d: number) {
  if (d === 1) return "Easy";
  if (d === 2) return "Medium";
  return "Hard";
}

function difficultyColor(d: number) {
  if (d === 1) return "oklch(0.75 0.16 155)";
  if (d === 2) return "oklch(0.8 0.14 85)";
  return "oklch(0.75 0.15 25)";
}

export function CodSimulator() {
  const [state, setState] = useState<ScenarioState | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("dni-cod-completed");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [lang, setLang] = useState<ScenarioLanguage>(() => {
    if (typeof window === "undefined") return "en";
    try {
      return localStorage.getItem(LANG_KEY) === "hinglish" ? "hinglish" : "en";
    } catch {
      return "en";
    }
  });
  const changeLang = useCallback((l: ScenarioLanguage) => {
    setLang(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // localStorage unavailable - session-only preference
    }
  }, []);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state?.messages.length]);

  const startScenario = useCallback((scenario: Scenario) => {
    const firstTurn = scenario.turns[0];
    setState({
      scenarioId: scenario.id,
      turnIndex: 0,
      score: 0,
      maxScore: scenario.turns.length * 2,
      messages: [
        {
          role: "system",
          text: asLocalized(scenario.context),
        },
        {
          role: "customer",
          text: firstTurn.customerMessage,
        },
      ],
      phase: "playing",
      chosenOptions: [],
    });
  }, []);

  const handleChoice = useCallback(
    (option: ReplyOption) => {
      if (!state) return;
      const scenario = COD_SCENARIOS.find((s) => s.id === state.scenarioId)!;
      const newScore = state.score + option.points;
      const newMessages: ChatMessage[] = [
        ...state.messages,
        { role: "seller", text: option.text, quality: option.quality },
      ];

      setState({
        ...state,
        messages: newMessages,
        score: newScore,
        phase: "reacting",
        chosenOptions: [...state.chosenOptions, option],
      });

      setTimeout(() => {
        const reactionMessages: ChatMessage[] = [
          ...newMessages,
          { role: "customer", text: option.reaction },
        ];

        const nextTurnIndex = state.turnIndex + 1;
        const hasNextTurn = nextTurnIndex < scenario.turns.length;

        if (hasNextTurn) {
          const nextTurn = scenario.turns[nextTurnIndex];
          setTimeout(() => {
            setState((prev) =>
              prev
                ? {
                    ...prev,
                    turnIndex: nextTurnIndex,
                    messages: [
                      ...reactionMessages,
                      { role: "customer", text: nextTurn.customerMessage },
                    ],
                    phase: "playing",
                    score: newScore,
                  }
                : null,
            );
          }, 800);
        } else {
          setTimeout(() => {
            setState((prev) =>
              prev
                ? {
                    ...prev,
                    messages: reactionMessages,
                    phase: "outcome",
                    score: newScore,
                  }
                : null,
            );
            setCompletedIds((prev) => {
              const next = new Set(prev);
              next.add(scenario.id);
              localStorage.setItem(
                "dni-cod-completed",
                JSON.stringify([...next]),
              );
              return next;
            });
          }, 800);
        }

        setState((prev) =>
          prev ? { ...prev, messages: reactionMessages } : null,
        );
      }, 600);
    },
    [state],
  );

  const reset = useCallback(() => setState(null), []);

  if (!state) {
    return (
      <ScenarioSelector
        onSelect={startScenario}
        completedIds={completedIds}
        lang={lang}
        onLangChange={changeLang}
      />
    );
  }

  const scenario = COD_SCENARIOS.find((s) => s.id === state.scenarioId)!;
  const currentTurn =
    state.phase === "playing" ? scenario.turns[state.turnIndex] : null;
  const shipped = state.score >= scenario.shipThreshold;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderRadius: 14,
          background: "#060606",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Phone size={16} style={{ color: "var(--muted)" }} />
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                letterSpacing: "-0.01em",
              }}
            >
              {scenario.title[lang]}
            </p>
            <p
              className="font-mono"
              style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.08em" }}
            >
              {scenario.product} · ₹{scenario.orderValue.toLocaleString("en-IN")} · ship at{" "}
              {scenario.shipThreshold}+/{state.maxScore} pts
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LangToggle lang={lang} onChange={changeLang} />
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              color: difficultyColor(scenario.difficulty),
            }}
          >
            {difficultyLabel(scenario.difficulty).toUpperCase()}
          </span>
          <button
            onClick={reset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "var(--muted)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
            }}
          >
            <RotateCcw size={12} />
            Exit
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div
        style={{
          borderRadius: 16,
          background: "#060606",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          padding: "20px",
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {state.messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} lang={lang} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Reply options */}
        {state.phase === "playing" && currentTurn && (
          <div style={{ marginTop: 16 }}>
            {currentTurn.hint && (
              <p
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: "oklch(0.8 0.14 85)",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <AlertTriangle size={11} />
                {currentTurn.hint}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentTurn.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(opt)}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#d4d4d4",
                    fontSize: 13,
                    lineHeight: 1.5,
                    cursor: "pointer",
                    transition: "border-color 150ms, background 150ms",
                    fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ChevronRight size={14} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
                    {opt.text[lang]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reacting indicator */}
        {state.phase === "reacting" && (
          <div
            className="font-mono"
            style={{
              marginTop: 16,
              fontSize: 11,
              color: "var(--text-faint)",
              textAlign: "center",
              letterSpacing: "0.06em",
            }}
          >
            Customer is responding...
          </div>
        )}
      </div>

      {/* Outcome */}
      {state.phase === "outcome" && (
        <OutcomeCard
          scenario={scenario}
          score={state.score}
          maxScore={state.maxScore}
          shipped={shipped}
          onRestart={() => startScenario(scenario)}
          onExit={reset}
        />
      )}
    </div>
  );
}

function LangToggle({
  lang,
  onChange,
}: {
  lang: ScenarioLanguage;
  onChange: (l: ScenarioLanguage) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        padding: 2,
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {(["en", "hinglish"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
            background: lang === l ? "rgba(255,255,255,0.12)" : "transparent",
            color: lang === l ? "#fff" : "var(--muted)",
          }}
        >
          {l === "en" ? "English" : "Hinglish"}
        </button>
      ))}
    </div>
  );
}

function ChatBubble({ message, lang }: { message: ChatMessage; lang: ScenarioLanguage }) {
  if (message.role === "system") {
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 12.5,
          lineHeight: 1.6,
          color: "var(--muted)",
          fontStyle: "italic",
        }}
      >
        <MessageSquare
          size={12}
          style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "var(--text-faint)" }}
        />
        {message.text[lang]}
      </div>
    );
  }

  const isCustomer = message.role === "customer";
  const qualityBorder =
    message.quality === "best"
      ? "oklch(0.72 0.13 165 / 0.4)"
      : message.quality === "bad"
        ? "oklch(0.72 0.17 20 / 0.4)"
        : message.quality === "ok"
          ? "oklch(0.8 0.14 85 / 0.4)"
          : undefined;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isCustomer ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          borderRadius: 12,
          background: isCustomer
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.1)",
          border: `1px solid ${qualityBorder ?? "rgba(255,255,255,0.08)"}`,
          fontSize: 13,
          lineHeight: 1.55,
          color: isCustomer ? "#c4c4c4" : "#e8e8e8",
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.12em",
            color: isCustomer ? "var(--text-faint)" : "var(--text-faintest)",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 4,
          }}
        >
          {isCustomer ? "Customer" : "You"}
          {message.quality && (
            <span
              style={{
                marginLeft: 8,
                color:
                  message.quality === "best"
                    ? "oklch(0.72 0.13 165)"
                    : message.quality === "bad"
                      ? "oklch(0.72 0.17 20)"
                      : "oklch(0.8 0.14 85)",
              }}
            >
              {message.quality === "best" ? "✓ BEST" : message.quality === "bad" ? "✗ WEAK" : "~ OK"}
            </span>
          )}
        </span>
        {message.text[lang]}
      </div>
    </div>
  );
}

function OutcomeCard({
  scenario,
  score,
  maxScore,
  shipped,
  onRestart,
  onExit,
}: {
  scenario: Scenario;
  score: number;
  maxScore: number;
  shipped: boolean;
  onRestart: () => void;
  onExit: () => void;
}) {
  const rtoCost = scenario.shippingCost * 2;
  const stars = Math.round((score / maxScore) * 5);

  return (
    <div className="space-y-4">
      {/* Result banner */}
      <div
        style={{
          borderRadius: 16,
          padding: "24px",
          background: shipped
            ? "linear-gradient(165deg, rgba(0,80,50,0.15), #060606)"
            : "linear-gradient(165deg, rgba(100,20,20,0.15), #060606)",
          border: `1px solid ${shipped ? "oklch(0.72 0.13 165 / 0.3)" : "oklch(0.72 0.17 20 / 0.3)"}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: shipped
                ? "oklch(0.72 0.13 165 / 0.15)"
                : "oklch(0.72 0.17 20 / 0.15)",
              border: `1px solid ${shipped ? "oklch(0.72 0.13 165 / 0.3)" : "oklch(0.72 0.17 20 / 0.3)"}`,
              display: "grid",
              placeItems: "center",
            }}
          >
            {shipped ? (
              <Truck size={20} style={{ color: "oklch(0.72 0.13 165)" }} />
            ) : (
              <X size={20} style={{ color: "oklch(0.72 0.17 20)" }} />
            )}
          </div>
          <div>
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: shipped ? "oklch(0.82 0.13 165)" : "oklch(0.82 0.17 20)",
              }}
            >
              {shipped ? "ORDER SHIPS" : "ORDER RETURNS"}
            </p>
            <p className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
              {shipped
                ? `₹${scenario.orderValue.toLocaleString("en-IN")} delivered successfully`
                : `RTO cost: ₹${rtoCost} round-trip shipping lost`}
            </p>
          </div>
        </div>

        {/* Score */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                fill={s <= stars ? (shipped ? "oklch(0.8 0.14 85)" : "oklch(0.72 0.17 20)") : "transparent"}
                style={{
                  color: s <= stars ? (shipped ? "oklch(0.8 0.14 85)" : "oklch(0.72 0.17 20)") : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
            {score}/{maxScore} points
          </span>
        </div>

        {/* Debrief */}
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#b8b8b8" }}>
          {shipped ? scenario.shipDebrief : scenario.returnDebrief}
        </p>
      </div>

      {/* Key takeaway */}
      <div
        style={{
          borderRadius: 14,
          padding: "18px 20px",
          background: "#060606",
          border: "1px solid rgba(255,255,255,0.1)",
          borderLeft: "3px solid oklch(0.8 0.14 85)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "oklch(0.8 0.14 85)",
            marginBottom: 8,
          }}
        >
          KEY TAKEAWAY
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "#d4d4d4" }}>
          {scenario.keyTakeaway}
        </p>
      </div>

      {/* ₹ Impact summary */}
      <div
        style={{
          borderRadius: 14,
          padding: "16px 20px",
          background: "#060606",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-faint)", marginBottom: 12 }}
        >
          ₹ IMPACT
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <p className="font-mono" style={{ fontSize: 10, color: "var(--text-faintest)" }}>ORDER VALUE</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "white", marginTop: 2 }}>
              ₹{scenario.orderValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="font-mono" style={{ fontSize: 10, color: "var(--text-faintest)" }}>SHIPPING COST</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--muted)", marginTop: 2 }}>
              ₹{scenario.shippingCost}
            </p>
          </div>
          <div>
            <p className="font-mono" style={{ fontSize: 10, color: "var(--text-faintest)" }}>RTO COST IF RETURNED</p>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: shipped ? "var(--text-faint)" : "oklch(0.72 0.17 20)",
                marginTop: 2,
                textDecoration: shipped ? "line-through" : "none",
              }}
            >
              ₹{rtoCost}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onRestart}
          className="btn-primary"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 44,
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RotateCcw size={14} />
          Try again
        </button>
        <button
          onClick={onExit}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 44,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "transparent",
            color: "#d4d4d4",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
          }}
        >
          All scenarios
        </button>
      </div>
    </div>
  );
}

function ScenarioSelector({
  onSelect,
  completedIds,
  lang,
  onLangChange,
}: {
  onSelect: (s: Scenario) => void;
  completedIds: Set<string>;
  lang: ScenarioLanguage;
  onLangChange: (l: ScenarioLanguage) => void;
}) {
  const totalCompleted = COD_SCENARIOS.filter((s) => completedIds.has(s.id)).length;

  return (
    <div className="space-y-5">
      {/* Why this exists + language */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 18px",
          borderRadius: 14,
          background: "#060606",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div>
          <p
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-faint)", marginBottom: 6 }}
          >
            WHY THIS EXISTS
          </p>
          <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)", maxWidth: "42rem" }}>
            COD customers can refuse at the door - and you pay shipping both ways.
            A 30-second confirmation call before dispatch is how sellers catch bad
            addresses, cash problems and buyer&apos;s remorse early. Each scenario is one
            real refusal pattern. Best replies score 2 points, weak ones 0 - reach a
            scenario&apos;s ship threshold and the order delivers.
          </p>
        </div>
        <LangToggle lang={lang} onChange={onLangChange} />
      </div>

      {/* Progress bar */}
      {totalCompleted > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 18px",
            borderRadius: 12,
            background: "#060606",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 5,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: "white",
                width: `${(totalCompleted / COD_SCENARIOS.length) * 100}%`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>
            {totalCompleted}/{COD_SCENARIOS.length}
          </span>
        </div>
      )}

      {/* Scenario cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {COD_SCENARIOS.map((scenario) => {
          const done = completedIds.has(scenario.id);
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              style={{
                textAlign: "left",
                padding: "20px",
                borderRadius: 16,
                background: "#060606",
                border: `1px solid ${done ? "oklch(0.72 0.13 165 / 0.25)" : "rgba(255,255,255,0.1)"}`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                cursor: "pointer",
                transition: "border-color 200ms, transform 200ms",
                fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = done
                  ? "oklch(0.72 0.13 165 / 0.25)"
                  : "rgba(255,255,255,0.1)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#101010",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Phone size={16} className="text-white" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {done && <Check size={14} style={{ color: "oklch(0.72 0.13 165)" }} />}
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 9.5,
                      letterSpacing: "0.1em",
                      color: difficultyColor(scenario.difficulty),
                    }}
                  >
                    {difficultyLabel(scenario.difficulty).toUpperCase()}
                  </span>
                </div>
              </div>
              <h3
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                  color: "#e8e8e8",
                  lineHeight: 1.3,
                }}
              >
                {scenario.title[lang]}
              </h3>
              <p
                className="font-mono"
                style={{
                  marginTop: 4,
                  fontSize: 10.5,
                  color: "var(--text-faint)",
                  letterSpacing: "0.04em",
                }}
              >
                {scenario.rtoCause}
              </p>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  color: "#7a7a7a",
                }}
              >
                {scenario.product} · ₹{scenario.orderValue.toLocaleString("en-IN")}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
