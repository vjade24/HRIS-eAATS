-- Run in the HRIS_ATS database. This script does not modify ledger or earning data.
-- Each row is a review event. Reopening an issue inserts another event.
IF OBJECT_ID(N'dbo.lv_ledger_discrepancy_review_tbl', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.lv_ledger_discrepancy_review_tbl
    (
        review_id BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_lv_ledger_discrepancy_review PRIMARY KEY,
        empl_id NVARCHAR(50) NOT NULL,
        -- BALANCE_VL / BALANCE_SL: identify the ledger row.
        -- DOUBLE_EARN: identify the monthly group using the fields in the supplied query.
        discrepancy_type VARCHAR(20) NOT NULL,
        ledger_ctrl_no NVARCHAR(50) NULL,
        gen_year SMALLINT NOT NULL,
        gen_month TINYINT NOT NULL,
        -- SHA-256 of the canonical issue identity (including employee/type/month).
        issue_key BINARY(32) NOT NULL,
        -- SHA-256 of the complete canonical evidence for this issue.
        -- Changed evidence must not inherit a previous OK decision.
        evidence_hash BINARY(32) NOT NULL,
        evidence_snapshot NVARCHAR(MAX) NOT NULL,
        review_status VARCHAR(10) NOT NULL,
        remarks NVARCHAR(2000) NOT NULL,
        reviewed_user_id NVARCHAR(50) NOT NULL,
        reviewed_dttm DATETIME2(3) NOT NULL
            CONSTRAINT DF_lv_ledger_discrepancy_review_date DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_lv_ledger_discrepancy_review_type
            CHECK (discrepancy_type IN ('BALANCE_VL', 'BALANCE_SL', 'DOUBLE_EARN')),
        CONSTRAINT CK_lv_ledger_discrepancy_review_status
            CHECK (review_status IN ('OK', 'REOPENED')),
        CONSTRAINT CK_lv_ledger_discrepancy_review_period
            CHECK (gen_year BETWEEN 1 AND 9999 AND gen_month BETWEEN 1 AND 12),
        CONSTRAINT CK_lv_ledger_discrepancy_review_remarks
            CHECK (LEN(LTRIM(RTRIM(remarks))) > 0),
        CONSTRAINT CK_lv_ledger_discrepancy_review_reviewer
            CHECK (LEN(LTRIM(RTRIM(reviewed_user_id))) > 0),
        CONSTRAINT CK_lv_ledger_discrepancy_review_evidence
            CHECK (LEN(LTRIM(RTRIM(evidence_snapshot))) > 0),
        CONSTRAINT CK_lv_ledger_discrepancy_review_ledger
            CHECK (discrepancy_type = 'DOUBLE_EARN'
                OR (ledger_ctrl_no IS NOT NULL AND LEN(LTRIM(RTRIM(ledger_ctrl_no))) > 0))
    );

    CREATE INDEX IX_lv_ledger_discrepancy_review_latest
        ON dbo.lv_ledger_discrepancy_review_tbl (empl_id, issue_key, review_id DESC)
        INCLUDE (evidence_hash, review_status, reviewed_user_id, reviewed_dttm);
END;
GO

-- Preserve the audit history: corrections and reopening use INSERT.
CREATE OR ALTER TRIGGER dbo.tr_lv_ledger_discrepancy_review_immutable
ON dbo.lv_ledger_discrepancy_review_tbl
INSTEAD OF UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    THROW 50001, 'Discrepancy reviews are append-only. Insert a new review event.', 1;
END;
GO
