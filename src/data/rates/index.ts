import type { RateCard } from "@/lib/rate-card";
import { RATES_2026_Q1 } from "@/data/rates/2026-q1";
import { RATES_2026_Q3 } from "@/data/rates/2026-q3";

/** The card every fee computation uses by default. */
export const CURRENT_RATES: RateCard = RATES_2026_Q3;

/** The card immediately before CURRENT — used for snapshot impact diffs. */
export const PREVIOUS_RATES: RateCard = RATES_2026_Q1;

/** Newest first. */
export const ALL_RATE_CARDS: RateCard[] = [RATES_2026_Q3, RATES_2026_Q1];
