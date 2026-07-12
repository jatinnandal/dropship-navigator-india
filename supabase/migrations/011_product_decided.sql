-- Track whether the seller has actually chosen a product category.
-- "I don't know yet" stores product_type = 'general' (for the fee/RTO engines)
-- but product_decided = false, so personalization stays gated until they decide.
-- Default true so every existing profile is treated as decided (no regression).

alter table public.seller_profiles
  add column if not exists product_decided boolean not null default true;
