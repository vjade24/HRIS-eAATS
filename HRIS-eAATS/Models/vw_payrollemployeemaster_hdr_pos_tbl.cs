//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace HRIS_eAATS.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class vw_payrollemployeemaster_hdr_pos_tbl
    {
        public string empl_id { get; set; }
        public string employment_type { get; set; }
        public System.DateTime effective_date { get; set; }
        public Nullable<decimal> monthly_rate { get; set; }
        public Nullable<decimal> daily_rate { get; set; }
        public Nullable<decimal> hourly_rate { get; set; }
        public string rate_basis { get; set; }
        public Nullable<System.DateTime> period_from { get; set; }
        public Nullable<System.DateTime> period_to { get; set; }
        public string payroll_group_nbr { get; set; }
        public Nullable<bool> emp_rcrd_status { get; set; }
        public string department_code { get; set; }
        public string subdepartment_code { get; set; }
        public string division_code { get; set; }
        public string section_code { get; set; }
        public string function_code { get; set; }
        public string fund_code { get; set; }
        public bool flag_expt_gsis { get; set; }
        public bool flag_expt_hdmf { get; set; }
        public bool flag_expt_phic { get; set; }
        public decimal hdmf_fix_rate { get; set; }
        public System.DateTime date_of_assumption { get; set; }
        public string item_no { get; set; }
        public string salary_grade { get; set; }
        public string position_code { get; set; }
        public string position_long_title { get; set; }
        public string employee_name { get; set; }
    }
}