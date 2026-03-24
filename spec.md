# StockFlow

## Current State
StockFlow is a ~11,000 line single-file React app (App.tsx) for Indian logistics inventory management. It has Transit, Queue, Inward, Inward Saved, Inventory/Dashboard, Transfers, History, Analytics, Godown Stock, Sales, and Admin Settings tabs. All data is in-memory with JSON export/import. The app currently has the following issues:
- Queue tab allows duplicate bilty entries (no cross-tab duplicate check like Transit has)
- Inward tab has no refresh/reset icon
- Transit 'Add New Entry' form is hidden behind a button (not open by default)
- User session is not persisted to localStorage so refreshing or pressing back logs the user out
- Admin Field Labels tab updates state but the labels are not actually consumed in the navigation tab forms (TransitTab, QueueTab, InwardTab) to replace default field names

## Requested Changes (Diff)

### Add
- Refresh/reset icon in Inward tab header to clear the form for a new entry
- Download Backup button (prominent) in Admin tab
- Upload/Restore Backup button (prominent) in Admin tab  
- Morning backup reminder: when admin logs in for the first time each day, show a prompt reminding them to download a backup
- Logout button visible in the app (already exists but ensure it works)
- Session persistence: save logged-in user to localStorage so refresh/back-press doesn't log out

### Modify
- **Queue duplicate check**: Add the same strict cross-tab bilty uniqueness check that TransitTab has. Before allowing a Queue entry, check: (1) is base bilty already in Queue? (2) is it in Transit? (3) is any postfix variant in Inward history (transactions with type=INWARD)? (4) is it in Inward Saved? Block entry with clear error if found in any.
- **Inward duplicate check**: Before allowing an Inward entry, check Transit, Queue, and Inward Saved for the base bilty number. If already fully saved in Inward Saved, block entry. If in Transit or Queue, allow auto-fill. If a specific bale postfix is already in Inward history/transactions, lock that bale tab.
- **Transit 'Log New' form**: Set `showForm` initial state to `true` so the form is open by default. The collapse button remains so user can hide it.
- **Admin Field Labels**: The `fieldLabels` state is set correctly but the labels are NEVER consumed in the actual form renders (TransitTab, QueueTab, InwardTab). Fix this by passing `fieldLabels` to these components and using `fieldLabels['transit']?.['biltyNo'] || 'Bilty No'` etc. for all labeled fields in those tabs.
- **Session persistence**: On login, save `currentUser` to `localStorage`. On app load, read from `localStorage` and restore session. On logout (`setCurrentUser(null)`), clear localStorage.

### Remove
- Nothing removed

## Implementation Plan
1. Add localStorage session persistence: on login save user JSON to `localStorage.setItem('stockflow_user', ...)`, on app mount use `useState(() => { try { return JSON.parse(localStorage.getItem('stockflow_user') || 'null') } catch { return null } })`, on logout call `localStorage.removeItem('stockflow_user')`
2. Fix Queue duplicate check: copy the same 4-check pattern from TransitTab's `handleAdd` into the Queue form submission handler. Check base bilty against: transitGoods, pendingParcels (Queue itself), transactions (INWARD type), inwardSaved.
3. Fix Inward duplicate check: at bilty entry/search in InwardTab, after resolving the base bilty, check inwardSaved for exact base number match; if found, show error and block. Check each bale postfix against existing INWARD transactions to lock those tabs.
4. Add refresh icon in Inward tab: add a `RefreshCw` icon button in the InwardTab header that resets all inward form state (biltyNo, packages, baleData, etc.) back to defaults.
5. Transit form open by default: change `useState(false)` to `useState(true)` for `showForm` in TransitTab.
6. Field labels propagation: pass `fieldLabels` prop to TransitTab, QueueTab, InwardTab. In each tab, replace hardcoded label strings like "Bilty No", "Transport", "Supplier", "Item Category", "Item Name", "Packages", "Total Qty in Bale" etc. with `fieldLabels?.['transit']?.['biltyNo'] || 'Bilty No'` pattern.
7. Backup buttons: In AdminSettings, add a prominent "Download Backup" button (calls `exportDatabase`) and "Upload/Restore Backup" button (triggers file input for `importDatabase`). Style them as large colored action buttons, not subtle links.
8. Morning backup reminder: track `lastBackupReminder` in localStorage. On admin login, if today's date differs from stored date, show a `confirmDialog`-style prompt reminding to backup. Update stored date after showing.
