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
    
    public partial class sp_lv_ledger_earn_history_tbl_list_Result
    {
        public int id { get; set; }
        public string gen_year { get; set; }
        public string gen_month { get; set; }
        public string department_short_name { get; set; }
        public string empl_id { get; set; }
        public string earning_type { get; set; }
        public string earning_type_descr { get; set; }
        public string employee_name { get; set; }
        public string remarks_flag { get; set; }
        public string remarks_descr { get; set; }
        public string department_code { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public string created_user_id { get; set; }
        public string created_employee_name { get; set; }
    }
}