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
    
    public partial class sp_travelorder_hdr_tbl_list_Result
    {
        public string travel_order_no { get; set; }
        public string travel_datefiled { get; set; }
        public string travel_place_visit { get; set; }
        public string travel_purpose { get; set; }
        public string travel_details { get; set; }
        public string travel_justification { get; set; }
        public string travel_requestor_empl_id { get; set; }
        public string employee_name { get; set; }
        public string travel_form_type { get; set; }
        public string travel_type_code { get; set; }
        public Nullable<bool> travel_with_claims { get; set; }
        public Nullable<bool> posting_status { get; set; }
        public string approval_id { get; set; }
        public string department_code { get; set; }
        public string cancel_pending_comment { get; set; }
        public string approval_status { get; set; }
        public string travelorder_status_descr { get; set; }
        public string recappr_empl { get; set; }
        public string firstappr_empl_id { get; set; }
        public string finalappro_empl_id { get; set; }
        public bool ldnf { get; set; }
        public bool to_emergency { get; set; }
        public string late_justification { get; set; }
        public bool pa_initial { get; set; }
    }
}