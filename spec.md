# StockFlow

## Current State
Version 16 is deployed. The app has Transit, Queue, Inward, Transfer, History, Dashboard, Sales, and Admin tabs. Inward tab has per-bale tracking with postfixed bilty numbers. Known bugs include: "Not Received" bales in Inward showing wrong 'already opened' message instead of transferring to Transit/Queue.

## Requested Changes (Diff)

### Add
- New "Inward Saved" navigation tab showing all bilties fully completed through Inward
  - Bilty number click opens full history panel (same as History tab)
  - Admin-only edit rights (same pattern as History tab admin edit)
  - Once a bilty is in Inward Saved, it is blocked from re-entry in Transit, Queue, and Inward tabs

### Modify
- **Inward tab (packages > 1):**
  - Remove standalone "Total Qty in this bale" top-level field
  - Main inward form becomes inactive/disabled when packages > 1 -- only per-bale add-item section is active
  - Each bale tab is independent (unique postfix bilty, own item list)
  - "Add Item to Bale List" form fields: Category, Item Name, "+New Item" checkbox (reveals text input for new item name), Total Qty (placed after item name -- used for validation), Distribution (godown/shop), Sale Rate, Purchase Rate
  - Validation: sum of all items qty in bale must equal total qty before saving bale
- **Queue tab:**
  - Block all entries where base bilty matches any postfixed entry (e.g. if sola1011X5(1) exists, block sola1011 and sola1011X5)
- **Bug fix -- "Not Received" in Inward:**
  - Show correct message: "Bale transferred to [Transit/Queue]"
  - Actually move bilty to the selected tab
  - Check for duplicates before inserting into Transit/Queue

### Remove
- Nothing removed

## Implementation Plan
1. Fix "Not Received" bale logic in InwardTab: remove the incorrect 'already opened' check path for not-received bales, add correct transfer logic with duplicate check and success message
2. Add inward form inactive state when packages > 1 -- disable all top-level fields, show per-bale sections only
3. Update "Add Item to Bale List" form fields to include: Category, Item Name, +New Item checkbox/textbox, Total Qty (after item name), Distribution, Sale Rate, Purchase Rate; enforce qty validation
4. Add Queue tab duplicate guard: block entry if base bilty matches any postfixed entry in Queue or Inward Saved
5. Add new "Inward Saved" tab component showing completed inward bilties
6. Wire Inward save to populate the inwardSaved state list
7. Block Transit/Queue/Inward from accepting bilty numbers that exist in Inward Saved
8. Inward Saved bilty click → history panel (reuse existing BiltyHistoryPanel)
9. Admin-only edit in Inward Saved tab (same pattern as History tab)
