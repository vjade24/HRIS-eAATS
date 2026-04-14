# Leave Balance Discrepancy Modal - UPDATED Implementation

## Overview
This implementation adds a notification modal that displays leave balance discrepancies in the Leave Ledger tab. 

**NEW:** Modal now shows **only ONE consolidated row for VL and ONE row for SL** using their final/last running balances.

## Changes Made

### 1. JavaScript Logic (ng-cLeaveLedger.js)
**Function:** `CheckBalanceDiscrepancies()`

**What Changed:**
- ✅ Iterates through ALL grid rows to find the **LAST balance** for each leave type
- ✅ Consolidates data to show only final VL balance and final SL balance
- ✅ Inherits previous balance if current is blank or zero
- ✅ Displays 2 rows maximum (one VL, one SL)
- ✅ Removed period_covered and previous_balance from data

**Result:** Cleaner, simpler modal showing final balances

### 2. HTML Modal (Index.cshtml)
**Modal ID:** `balance_discrepancy_modal`

**Table Structure - UPDATED:**
```
┌─────────────────────────────────────────────────┐
│  Earned | Abs/Und WP | Running Balance | Status  │
├─────────────────────────────────────────────────┤
│ VL      │    2.00    │      4.50       │ ⚠️      │
│ 1.50    │            │                 │         │
├─────────────────────────────────────────────────┤
│ SL      │    1.50    │      2.75       │ ✓       │
│ 0.75    │            │                 │         │
└─────────────────────────────────────────────────┘
```

**Changes:**
- ❌ Removed "Leave Type" column header
- ❌ Removed "Previous Balance" column
- ✅ Leave Type shown as content (with Earned below it)
- ✅ Only 4 columns now
- ✅ Only 2 rows (VL + SL)

## Discrepancy Thresholds

| Running Balance | Status | Badge |
|-----------------|--------|-------|
| > 1.25 days | Excessive Balance | 🔴 WARNING |
| < 0 days | Negative Balance | 🔴 WARNING |
| 0 ≤ to ≤ 1.25 | OK | 🟢 SUCCESS |

## Example Output

**Modal shows only if there are discrepancies:**

```
Employee: John Doe (ID: EMP001)
Period: 6/2024

────────────────────────────────────────
Earned | Abs/Und WP | Running Balance | Status
────────────────────────────────────────
VL     |    0.50    |      1.50       | ⚠️ Excessive
1.00   |            |                 | Balance
────────────────────────────────────────
SL     |    1.00    |      0.75       | ✓ OK
0.25   |            |                 |
────────────────────────────────────────

Discrepancy Details:
• VL Balance: 1.50 (Excessive Balance) - Balance exceeds 1.25 days
```

## How It Works

1. **Iterate Rows:** Go through datalist_grid from top to bottom
2. **Find Last:** Keep track of the last VL and SL balance found
3. **Inherit:** If balance is blank/zero, use previous balance
4. **Check:** Evaluate final balance against thresholds
5. **Show Modal:** Display only if discrepancies exist

## Usage

```javascript
// After loading datalist_grid
s.ValidateBalanceOnLoad();

// Or call manually
s.CheckBalanceDiscrepancies();

// View details button
s.btn_view_ledger_details(); // Navigate to ledger tab
```

## Files Updated

1. ✅ **ng-cLeaveLedger.js**
   - Modified `CheckBalanceDiscrepancies()` function
   - Uses last balance instead of per-row display

2. ✅ **Index.cshtml**
   - Added modal with new table structure
   - 4 columns only (no Leave Type column header)
   - Leave Type shown in first cell with Earned value

## Key Improvements

| Before | After |
|--------|-------|
| Multiple rows per period | 2 rows total (VL + SL) |
| Shows all periods | Shows final balance only |
| Leave Type in header | Leave Type in cell content |
| Complex table layout | Simple 4-column table |
| Harder to scan | Easier to understand at a glance |

## Testing

✓ Modal displays only on discrepancy
✓ Shows VL and SL final balances
✓ Excessive balance flagged (>1.25)
✓ Negative balance flagged (<0)
✓ OK status for normal balances
✓ Leave type + earned in first column
✓ Build successful
✓ No compile errors

## Notes

- Modal uses `backdrop: 'static'` - cannot dismiss by clicking outside
- Gets LAST balance from grid rows
- If all balances blank, inherits from first valid value
- Color-coded: Red warnings, Green success
- Period info shown at top for reference
