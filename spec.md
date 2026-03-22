# StockFlow

## Current State

StockFlow is a fully client-side React single-page application (SPA) for Indian logistics inventory management. The entire app is in `src/frontend/src/App.tsx` (~5800 lines). There is no backend persistence — all data lives in React state (with manual JSON export/import for backups).

### Architecture
- **Framework:** React with functional components and hooks only
- **UI:** Tailwind CSS + shadcn/ui components + lucide-react icons
- **State:** useState/useEffect only, no external state management
- **Storage:** In-memory React state; manual JSON backup/restore
- **AI:** Google Gemini API (user-provided key, stored in localStorage)
- **Auth:** Local username/password with roles: admin, staff, supplier

### Tabs (navigation)
1. **Dashboard (Inventory Hub)** — per-godown stock, threshold alerts (red for items at/below threshold with category/sub-categories/godown qty), item click opens timeline history
2. **Transit Ledger** — bilty entries with duplicate prevention, item category dropdown, Track Live button (if transport has URL configured), admin can rename columns/edit preset data, CSV import
3. **Arrival Queue** — bilty queue with auto-fill from Transit on bilty match, supplier/item category/item name fields, filters (date, name, category/item), Track button, Open Bale → switches to Inward tab with data pre-filled; saving bilty in Queue removes it from Transit
4. **Inward Processing** — bilty combo search (pulls from Queue + Transit), auto-fill all fields, Total Goods Qty field with distribution sum validation, item name combo box (dropdown+text, filtered by category, new items auto-saved to inventory), auto-fills sell/purchase price (overwritable), staff cannot see/add purchase price, no duplicate bilty allowed, saving removes bilty from both Transit and Queue
5. **Opening Stock** (admin only) — enter legacy/pre-app stock, item/category dropdown combo box, sell+purchase price fields
6. **Transfers** — product search showing item name, sub-categories, per-godown stock; transfer between godowns/shop; New Transfer refresh button; history recorded with person + date
7. **History Log** — all transactions (inward, transfers), shows bilty numbers, expandable detail view, date range + category/item filters, admin can edit all fields of inward entries (opens full inward form, bilty locked, rest editable, saves as overwrite)
8. **Admin Settings** — sub-tabs: Godowns (add/rename/delete), Transport Tracking (name→URL mapping), Tab Names (rename all 7 tabs), Transit Columns (rename headings + edit preset field data), Categories (add/edit/remove), Users (add/edit/remove), Bilty Prefixes, AI Settings (Gemini API key input)
9. **Stock Control** (admin only) — direct stock overwrite, global/per-item thresholds (applied to godown stock only, not shop)
10. **Sales Tab** — select multiple items/categories to record sales and reduce shop stock

### Key Data Types
- `InventoryItem`: sku, category, itemName, attributes (sub-categories), shop (qty), godowns (Record<godownName, qty>), saleRate, purchaseRate, businessId, minThreshold
- `TransitRecord`: id, biltyNo, transportName, supplierName, itemName, itemCategory, packages, date, addedBy, businessId, customData
- `PendingParcel` (Queue): id, biltyNo, transportName, packages, dateReceived, arrivalDate, businessId, itemName, category, itemCategory, supplier, customData
- `InwardRecord`: id, biltyNo, dateOpened, openedBy, transport, baleItems[], businessId, createdAt
- `Transaction`: id, type, biltyNo, businessId, date, user, transportName, itemsCount, sku, itemName, category, notes, fromLocation, toLocation, transferredBy, subCategory
- `AppUser`: username, password, role (admin/staff/supplier)
- `Business`: id, name
- `Category`: name, fields[] (CategoryField with name, type, options)

### Role Restrictions
- **supplier**: only sees own Transit entries; no access to Dashboard, Queue, Inward, Transfer, History, Settings
- **staff**: view-only in Transit (no add); no purchase price in Inward; no Opening Stock; no Admin Settings; no Stock Control
- **admin**: full access to all tabs and features

### Defaults
- Users: admin/password, staff/password, supplier/password
- Business: `{ id: 'default', name: 'StockManager Default' }`
- Categories: Safi, Lungi, Napkin
- Godowns: Main Godown, Side Godown
- Bilty Prefixes: sola, erob, cheb, 0

### AI Integration
- Gemini API: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=...`
- Used for: inventory insights, transaction audit, text-to-JSON extraction in Inward tab
- Key stored in localStorage, configurable in Admin Settings > AI Settings
- Graceful fallback messages if key missing

### Multi-Business
- Profile system with isolated data per business
- Create, edit, delete, switch businesses

---

## Requested Changes (Diff)

### Add
- (none — this is a summary reinitiation, no new features requested)

### Modify
- (none)

### Remove
- (none)

---

## Implementation Plan

This spec.md is a fresh summary reinitiation. No code changes are planned at this time. The current codebase reflects all previously implemented features as described in the Current State section above.

Next development iteration should reference this spec as the authoritative baseline.
