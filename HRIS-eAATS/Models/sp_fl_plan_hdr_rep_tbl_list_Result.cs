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
    
    public partial class sp_fl_plan_hdr_rep_tbl_list_Result
    {
        public string fl_plan_rep_ctrlno { get; set; }
        public string fl_plan_rep_year { get; set; }
        public string department_code { get; set; }
        public string department_short_name { get; set; }
        public string division_code { get; set; }
        public string division_name1 { get; set; }
        public string prepared_name { get; set; }
        public string prepare_desig { get; set; }
        public string approved_name { get; set; }
        public string approved_desig { get; set; }
        public string fl_plan_rep_status { get; set; }
        public string fl_plan_rep_status_descr { get; set; }
        public System.DateTime created_dttm { get; set; }
        public string user_created_dttm { get; set; }
        public string created_employee_name { get; set; }
        public int empl_cnt { get; set; }
        public string user_id_rlsd_employee_name { get; set; }
        public System.DateTime rlsd_dttm { get; set; }
        public string user_id_rcvd_employee_name { get; set; }
        public System.DateTime rcvd_dttm { get; set; }
    }
}
