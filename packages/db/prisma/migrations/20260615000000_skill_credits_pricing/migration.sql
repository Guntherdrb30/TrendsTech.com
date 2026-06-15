-- Change all skill prices to $10 (credit-based model)
UPDATE "Skill" SET "priceMonthly" = 10;

-- Update GlobalSettings markup to 50% (company keeps 50% of AI spend as margin)
UPDATE "GlobalSettings" SET "tokenMarkupPercent" = 50 WHERE id = 1;
