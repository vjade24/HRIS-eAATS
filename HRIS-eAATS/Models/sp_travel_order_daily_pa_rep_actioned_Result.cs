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
    
    public partial class sp_travel_order_daily_pa_rep_actioned_Result
    {
        public Nullable<long> row_nbr { get; set; }
        public string travel_order_no { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string position_title1 { get; set; }
        public string department_name1 { get; set; }
        public string department_short_name { get; set; }
        public string dtr_date { get; set; }
        public string travel_place_visit { get; set; }
        public string travel_purpose { get; set; }
        public string travel_requestor_empl_id { get; set; }
        public string travel_requestor_empl_name { get; set; }
        public string travel_type_code { get; set; }
        public string travel_type_descr { get; set; }
        public Nullable<bool> travel_with_claims { get; set; }
        public string travel_justification { get; set; }
        public string report_header_descr { get; set; }
        public string approval_status { get; set; }
        public string department_code { get; set; }
        public string approval_id { get; set; }
        public string travel_datefiled_original { get; set; }
        public string approved_status { get; set; }
        public Nullable<bool> pa_readonly { get; set; }
        public Nullable<bool> pa_writeonly { get; set; }
    }
}
