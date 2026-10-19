# Ledger discrepancy review

The SQL script creates a separate review history table. Marking an issue OK acknowledges it with remarks; it does not correct balances, delete duplicate earnings, or change approved or payroll-transmitted transactions. The script has not been applied to a database. The application review controls are not implemented yet.

## Report behavior

| State | Status in the report | Highlight | Action |
| --- | --- | --- | --- |
| Discrepancy without a matching review | Needs Review | Red for balance, orange for double earn | Mark as OK; remarks required |
| Latest review is OK and its evidence matches | OK (Reviewed) | Green with visible remarks | View review history or reopen with remarks |
| Latest review is REOPENED, or evidence has changed | Needs Review | Red/orange | Review again |

Keep reviewed issues visible. Show separate counts for unresolved issues and reviewed OK issues; the Show Discrepancy badge should count unresolved issues. An unreviewed row with no discrepancy can retain its ordinary OK label. Review VL and SL independently if both differ on the same row. A monthly double-earn review covers its group and highlights each ledger row belonging to that group.

## Issue identity and evidence

For BALANCE_VL and BALANCE_SL, build `issue_key` from employee ID, discrepancy type, ledger control number, and earning period. The evidence snapshot contains the reported old balance, earned amount, deduction, expected balance, actual balance, discrepancy, and the ordered source entries used to calculate the running balance. This ensures a change in preceding ledger entries invalidates the decision. Keep the report range and view mode as context in the snapshot; use the same calculation context when comparing evidence.

For DOUBLE_EARN, build `issue_key` from employee ID, earning type, department, year, month, remarks description, and earning creator, matching the supplied query's grouping. The snapshot contains the sorted earning history IDs, ledger control numbers, record count, amounts, and relevant source fields. A new or changed earning record invalidates the decision.

Use versioned, deterministic serialization for identity and evidence, with stable property order, invariant decimal formatting, explicit null values, and sorted source records. Hash the UTF-8 serialization with SHA-256 in the application. Do not hash display text or rounded balances.

## Saving and displaying a review

1. Validate the authenticated user's existing leave-administration permission for the employee/department on the server. Get the reviewer ID from the session.
2. Recalculate the issue and its evidence on the server. Reject a stale modal submission if its evidence differs from the current data. Do not trust submitted balances or hashes.
3. Insert an OK event with mandatory remarks and the server-generated identity/evidence. Reopening inserts a REOPENED event with remarks. Preserve all earlier events.
4. For each current issue, select the latest event by `empl_id` and `issue_key`, ordered by `review_id DESC`. Apply OK only when that latest event is OK and its `evidence_hash` matches. Do not search older events for a matching OK.
5. Include status, remarks, reviewer, and review time in the modal and CSV export. Store UTC timestamps and display them in the application's local time.

No foreign key to a payroll table is proposed because the review does not alter payroll and the payroll transmission relationship has not been established in this design. Record the source approval/transmission context in the evidence when integrating the application. Reuse the same review table for Monthly Earnings and Ledger Posting/Adjustment so both pages show the same decision for the same issue.
