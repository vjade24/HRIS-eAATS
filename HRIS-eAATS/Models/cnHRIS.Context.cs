﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class HRIS_DEVEntities : DbContext
    {
        public HRIS_DEVEntities()
            : base("name=HRIS_DEVEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<vw_departments_tbl_list> vw_departments_tbl_list { get; set; }
        public virtual DbSet<vw_personnelnames_tbl> vw_personnelnames_tbl { get; set; }
        public virtual DbSet<vw_personnelnames2_tbl> vw_personnelnames2_tbl { get; set; }
        public virtual DbSet<vw_payrollemployeemaster_hdr_tbl> vw_payrollemployeemaster_hdr_tbl { get; set; }
        public virtual DbSet<transactionsref_tbl> transactionsref_tbl { get; set; }
        public virtual DbSet<vw_approvalworkflow_tbl> vw_approvalworkflow_tbl { get; set; }
        public virtual DbSet<payrollemployeemaster_hdr_tbl> payrollemployeemaster_hdr_tbl { get; set; }
        public virtual DbSet<departments_tbl> departments_tbl { get; set; }
        public virtual DbSet<usersprofile_tbl> usersprofile_tbl { get; set; }
        public virtual DbSet<personnel_tbl> personnel_tbl { get; set; }
        public virtual DbSet<approvalstatus_tbl> approvalstatus_tbl { get; set; }
        public virtual DbSet<payrollemployeemaster_pos_tbl> payrollemployeemaster_pos_tbl { get; set; }
        public virtual DbSet<positions_tbl> positions_tbl { get; set; }
        public virtual DbSet<vw_payrollemployeemaster_hdr_pos_tbl> vw_payrollemployeemaster_hdr_pos_tbl { get; set; }
        public virtual DbSet<user_prime_token_tbl> user_prime_token_tbl { get; set; }
        public virtual DbSet<personnelstatutory_tbl> personnelstatutory_tbl { get; set; }
    
        public virtual ObjectResult<sp_user_login_ATS_Result> sp_user_login_ATS(string par_user_id, string par_user_password)
        {
            var par_user_idParameter = par_user_id != null ?
                new ObjectParameter("par_user_id", par_user_id) :
                new ObjectParameter("par_user_id", typeof(string));
    
            var par_user_passwordParameter = par_user_password != null ?
                new ObjectParameter("par_user_password", par_user_password) :
                new ObjectParameter("par_user_password", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_user_login_ATS_Result>("sp_user_login_ATS", par_user_idParameter, par_user_passwordParameter);
        }
    
        public virtual ObjectResult<sp_user_menu_access_role_list_ATS_Result> sp_user_menu_access_role_list_ATS(string par_user_id)
        {
            var par_user_idParameter = par_user_id != null ?
                new ObjectParameter("par_user_id", par_user_id) :
                new ObjectParameter("par_user_id", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_user_menu_access_role_list_ATS_Result>("sp_user_menu_access_role_list_ATS", par_user_idParameter);
        }
    
        public virtual ObjectResult<Nullable<bool>> sp_update_transaction_in_approvalworkflow_tbl(string par_approval_id, string par_user_id, string par_approval_status, string par_comments)
        {
            var par_approval_idParameter = par_approval_id != null ?
                new ObjectParameter("par_approval_id", par_approval_id) :
                new ObjectParameter("par_approval_id", typeof(string));
    
            var par_user_idParameter = par_user_id != null ?
                new ObjectParameter("par_user_id", par_user_id) :
                new ObjectParameter("par_user_id", typeof(string));
    
            var par_approval_statusParameter = par_approval_status != null ?
                new ObjectParameter("par_approval_status", par_approval_status) :
                new ObjectParameter("par_approval_status", typeof(string));
    
            var par_commentsParameter = par_comments != null ?
                new ObjectParameter("par_comments", par_comments) :
                new ObjectParameter("par_comments", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<Nullable<bool>>("sp_update_transaction_in_approvalworkflow_tbl", par_approval_idParameter, par_user_idParameter, par_approval_statusParameter, par_commentsParameter);
        }
    
        public virtual ObjectResult<string> sp_insert_transaction_to_approvalworkflow_tbl(string par_user_id, string par_empl_id, string par_transaction_code)
        {
            var par_user_idParameter = par_user_id != null ?
                new ObjectParameter("par_user_id", par_user_id) :
                new ObjectParameter("par_user_id", typeof(string));
    
            var par_empl_idParameter = par_empl_id != null ?
                new ObjectParameter("par_empl_id", par_empl_id) :
                new ObjectParameter("par_empl_id", typeof(string));
    
            var par_transaction_codeParameter = par_transaction_code != null ?
                new ObjectParameter("par_transaction_code", par_transaction_code) :
                new ObjectParameter("par_transaction_code", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<string>("sp_insert_transaction_to_approvalworkflow_tbl", par_user_idParameter, par_empl_idParameter, par_transaction_codeParameter);
        }
    
        public virtual ObjectResult<sp_employee_list_dept_Result> sp_employee_list_dept(string p_empl_id)
        {
            var p_empl_idParameter = p_empl_id != null ?
                new ObjectParameter("p_empl_id", p_empl_id) :
                new ObjectParameter("p_empl_id", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_employee_list_dept_Result>("sp_employee_list_dept", p_empl_idParameter);
        }
    
        public virtual ObjectResult<sp_leave_application_mone_waiver_rep_Result> sp_leave_application_mone_waiver_rep(string par_leave_ctrlno, string par_empl_id, string par_empl_id_waiver)
        {
            var par_leave_ctrlnoParameter = par_leave_ctrlno != null ?
                new ObjectParameter("par_leave_ctrlno", par_leave_ctrlno) :
                new ObjectParameter("par_leave_ctrlno", typeof(string));
    
            var par_empl_idParameter = par_empl_id != null ?
                new ObjectParameter("par_empl_id", par_empl_id) :
                new ObjectParameter("par_empl_id", typeof(string));
    
            var par_empl_id_waiverParameter = par_empl_id_waiver != null ?
                new ObjectParameter("par_empl_id_waiver", par_empl_id_waiver) :
                new ObjectParameter("par_empl_id_waiver", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_leave_application_mone_waiver_rep_Result>("sp_leave_application_mone_waiver_rep", par_leave_ctrlnoParameter, par_empl_idParameter, par_empl_id_waiverParameter);
        }
    }
}
