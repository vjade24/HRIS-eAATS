using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using HRIS_Common;
//using HRIS_eHRD.App_Start;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing.Printing;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace HRIS_eAATS.Reports
{
    public partial class CrystalViewer : System.Web.UI.Page
    {

        ReportDocument cryRpt = new ReportDocument();
        CommonDB MyCmn = new CommonDB();
        static string printfile = "";
        //static string lastpage = "";
        //static bool firstload = true;
        string paramList = "";
        //report file(.rpt) name
        string reportName = "";
        //save as to excel,pdf or word's file name
        string saveName = "";
        //report type for pdf, excel, word or inline preview
        string reportType = "";
        //report file path, base on ~/Reports folder
        string reportPath = "";

        //set the report file path
        string reportFile = "";
        //for save report file name
        string saveFileName = "";
        protected void Page_Init(object sender, EventArgs e)
        {
            string ls_val;
            paramList   = Request["Params"].Trim();
            reportName  = Request["ReportName"].Trim();
            saveName    = Request["SaveName"].Trim();
            reportType  = Request["ReportType"].Trim();
            reportPath  = Request["ReportPath"].Trim().Replace('-', '/');


            reportFile  = Server.MapPath(string.Format("~/Reports/{0}/{1}.rpt", reportPath, reportName));

            saveFileName = saveName + DateTime.Now.ToString("_yyyy-MM-dd");
            if (!IsPostBack)
            {

                hf_printers.Value   = "";
                hf_nexpage.Value    = "0";
                PrinterSettings settings = new PrinterSettings();
                //firstload = true;
            }
            else
            {
                //firstload = false;
            }
            string[] ls_splitvalue;
            ls_val = Request.QueryString["id"];
            ls_splitvalue = ls_val.Split(',');
            loadreport(ls_splitvalue, reportPath);
        }


        protected void Page_Unload(object sender, EventArgs e)
        {
            cryRpt.Close();
            cryRpt.Dispose();
        }
        private void loadreport(string[] ls_splitvalue, string printfile)
        {

            DataTable dt = null;
            DataTable dtSub = null;
            //DataTable dtTemp = null;
            string locationpath = printfile;
            cryRpt.Load(Server.MapPath(locationpath));
            
            if (ls_splitvalue.Length == 3)
            {

                if (ls_splitvalue[0].ToString().Trim() == "sp_leave_application_rep3")
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2]);
                }
                else
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2]);
                }
            }
            else if (ls_splitvalue.Length == 5 && ls_splitvalue[0] == "sp_leave_application_cancel_tbl_rep")
            {
                dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
            }
            else if (ls_splitvalue.Length == 5)
            {
                dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
            }
            else if (ls_splitvalue.Length == 7)
            {
                dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6]);
            }
            if (ls_splitvalue.Length == 9)
            {
                dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8]);
            }
            if (ls_splitvalue.Length == 11)
            {
                dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10]);
            }
            else if (ls_splitvalue.Length == 13)
            {
                if (ls_splitvalue[0].ToString().Trim() == "sp_dtr_rep")
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10], ls_splitvalue[11], ls_splitvalue[12]);
                }
                else
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10], ls_splitvalue[11], ls_splitvalue[12]);
                }
            }

            if (dt == null)
            {
                return;
            }
            
            try
            {

                cryRpt.SetDataSource(dt);

                if (ls_splitvalue[0].ToString().Trim() == "sp_servicerecord_report")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
                    cryRpt.Subreports["cryServiceRecord.rpt"].SetDataSource(dtSub);
                }
                
                //FOR SUBREPORT ON CARDING 
                //ADDED BY JORGE: 11/16/2019
                if (ls_splitvalue[0].ToString().Trim() == "sp_employeecard_re_ce_rep")
                {
                    cryRpt.Subreports[0].SetDataSource(dtSub);
                }

                if (ls_splitvalue[0].ToString().Trim() == "sp_pds_rep" && ls_splitvalue[3].ToString().Trim() == "O")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_pds_page1 WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "'");
                    cryRpt.Subreports["cryPDSPersonalInfo.rpt"].SetDataSource(dtSub);
                    //cryRpt.SetParameterValue(0, ls_splitvalue[2].ToString().Trim(), "Sub report Name")

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_children_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "'");
                    cryRpt.Subreports["cryPDSNameOfChildren.rpt"].SetDataSource(dtSub);
                    //cryRpt.Subreports[1].SetParameterValue(0, ls_splitvalue[2].ToString().Trim());

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(examination_dateS)=1,examination_dateS,'1900') AS examination_date1,* FROM vw_personnel_csceligibilty_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' ORDER BY examination_date1 DESC");
                    cryRpt.Subreports["cryPDCivilService.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(workexp_fromS)=1,workexp_fromS,'1900') AS workexp_from1,* FROM vw_personnel_workexprnce_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' ORDER BY workexp_from1 DESC");
                    cryRpt.Subreports["cryPDSWorkExperience.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(voluntarywork_fromS)=1,voluntarywork_fromS,'1900') AS voluntarywork_from1,* FROM vw_personnel_voluntarywork_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' ORDER BY voluntarywork_from1 DESC");
                    cryRpt.Subreports["cryPDSVoluntaryWork.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(learn_devt_fromS)=1,learn_devt_fromS,'1900') AS learn_devt_from1,* FROM vw_personnel_lnd_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "'ORDER BY learn_devt_from1 DESC");
                    cryRpt.Subreports["cryPDSLND.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_pds_page3 WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "'");
                    cryRpt.Subreports["cryPDSOtherInformation.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' AND other_type='S'");
                    cryRpt.Subreports["cryPDSOtherInformation_Skills.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_recognation_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' AND other_type='R'");
                    cryRpt.Subreports["cryPDSOtherInformation_Recognation.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_membership_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' AND other_type='M'");
                    cryRpt.Subreports["cryPDSOtherInformation_Membership.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_statutary_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "'");
                    cryRpt.Subreports["cryPDSPage4.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_references_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "'");
                    cryRpt.Subreports["cryPDSPersonReference.rpt"].SetDataSource(dtSub);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_pds_rep" && ls_splitvalue[3].ToString().Trim() == "2")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(examination_dateS)=1,examination_dateS,'1900') AS examination_date1,* FROM vw_personnel_csceligibilty2_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' ORDER BY examination_date1 DESC");
                    cryRpt.Subreports["cryPDCivilService.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(workexp_fromS)=1,workexp_fromS,'1900') AS workexp_from1,* FROM vw_personnel_workexprnce2_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' ORDER BY workexp_from1 DESC");
                    cryRpt.Subreports["cryPDSWorkExperience.rpt"].SetDataSource(dtSub);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_pds_rep" && ls_splitvalue[3].ToString().Trim() == "3")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(voluntarywork_fromS)=1,voluntarywork_fromS,'1900') AS voluntarywork_from1,* FROM vw_personnel_voluntarywork2_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' ORDER BY voluntarywork_from1 DESC");
                    cryRpt.Subreports["cryPDSVoluntaryWork.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(learn_devt_fromS)=1,learn_devt_fromS,'1900') AS learn_devt_from1,* FROM vw_personnel_lnd2_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "'ORDER BY learn_devt_from1 DESC");
                    cryRpt.Subreports["cryPDSLND.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_pds_page3 WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "'");
                    cryRpt.Subreports["cryPDSOtherInformation.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation2_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' AND other_type='S'");
                    cryRpt.Subreports["cryPDSOtherInformation_Skills.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_recognation2_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' AND other_type='R'");
                    cryRpt.Subreports["cryPDSOtherInformation_Recognation.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_membership2_tbl WHERE empl_id = '" + Session["empl_id"].ToString().Trim() + "' AND other_type='M'");
                    cryRpt.Subreports["cryPDSOtherInformation_Membership.rpt"].SetDataSource(dtSub);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_overtime_request_rep")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveData("sp_organizations_tbl", "organization_code", "1");
                    cryRpt.Subreports["cryOrganization.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS("sp_ot_request_purpose_dtl_tbl_list", "par_ot_ctrl_no", ls_splitvalue[2].ToString().Trim());
                    cryRpt.Subreports["cryOTSubPurposeReport.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS("sp_overtime_request_dates_sub_rep", "par_ot_ctrl_no", ls_splitvalue[2].ToString().Trim());
                    cryRpt.Subreports["cryOTSubDatesReport.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS("sp_ot_request_empl_dtl_tbl_list", "par_crtl_no", ls_splitvalue[2].ToString().Trim());
                    cryRpt.Subreports["cryOTSubEmplReport.rpt"].SetDataSource(dtSub);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_leave_application_hdr_tbl_report")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS(ls_splitvalue[0].ToString().Trim(), ls_splitvalue[1].ToString().Trim(), ls_splitvalue[2].ToString().Trim(), ls_splitvalue[3].ToString().Trim(), ls_splitvalue[4].ToString().Trim());
                    cryRpt.Subreports["crySubLeavePermission.rpt"].SetDataSource(dtSub);
                }
                //else if (ls_splitvalue[0].ToString().Trim() == "sp_leave_application_rep3")
                //{
                //    dtSub = new DataTable();
                //    dtSub = MyCmn.RetrieveDataATS(ls_splitvalue[0].ToString().Trim(), ls_splitvalue[1].ToString().Trim(), ls_splitvalue[2].ToString().Trim());
                //    cryRpt.Subreports["cryLWOP.rpt"].SetDataSource(dtSub);
                //}
                
                //END
                crvPrint.ReportSource = cryRpt;
                crvPrint.DataBind();
                PrinterSettings settings = new PrinterSettings();
            }
            catch (Exception)
            {
            }
        }
        private void BindReport(ReportDocument ReportPath)
        {
            crvPrint.ReportSource = ReportPath;
            crvPrint.DataBind();

        }
        private void shownextpage(int pageno)
        {
            crvPrint.ShowNthPage(pageno);
            hf_nexpage.Value = "0";

        }
        private void shoprevpage()
        {
            crvPrint.ShowPreviousPage();

        }
        protected void btn_print_Click(object sender, EventArgs e)
        {
            LinkButton btn = (LinkButton)sender;

            try
            {
                cryRpt.Refresh();

                switch (printfile)
                {
                    case "~/Reports/cryPlantilla/cryPlantilla.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Landscape;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLegal;
                        break;
                    case "~/Reports/cryPlantillaCSC/cryPlantillaCSC.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Landscape;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLegal;
                        break;
                    case "~/Reports/cryPlantillaHR/cryPlantillaHR.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Landscape;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLegal;
                        break;
                    case "~/Reports/cryPSSalariesWages/cryPSSalariesWages.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Landscape;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLetter;
                        break;
                    case "~/Reports/cryVacantItems/cryVacantItems.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Portrait;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLetter;
                        break;
                    case "~/Reports/cryListOfEmployees/cryListOfEmployees.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Portrait;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLetter;
                        break;
                    default:

                        break;
                }
            }
            catch (Exception)
            {
            }

        }

        private string GetDefaultPrinter()
        {
            PrinterSettings settings = new PrinterSettings();
            foreach (string printer in PrinterSettings.InstalledPrinters)
            {
                settings.PrinterName = printer;
                if (settings.IsDefaultPrinter)
                {
                    return printer;
                }
            }
            return string.Empty;
        }

        protected void btn_close_Click(object sender, EventArgs e)
        {
            closepage();
        }
        private void closepage()
        {
            ClientScript.RegisterClientScriptBlock(Page.GetType(), "script", "window.close();", true);
        }

        protected void img_nextpage_Click(object sender, ImageClickEventArgs e)
        {
            crvPrint.ShowNextPage();

        }
        protected void lbtn_pdf_Click(object sender, ImageClickEventArgs e)
        {
            converttopdf();

        }
        private void converttopdf()
        {
            try
            {
                ExportOptions CrExportOptions;
                DiskFileDestinationOptions CrDiskFileDestinationOptions = new DiskFileDestinationOptions();
                PdfRtfWordFormatOptions CrFormatTypeOptions = new PdfRtfWordFormatOptions();
                CrDiskFileDestinationOptions.DiskFileName = @"c:\\pdf\Plantilla.pdf";
                CrExportOptions = cryRpt.ExportOptions;
                {
                    CrExportOptions.ExportDestinationType = ExportDestinationType.DiskFile;
                    CrExportOptions.ExportFormatType = ExportFormatType.PortableDocFormat;
                    CrExportOptions.DestinationOptions = CrDiskFileDestinationOptions;
                    CrExportOptions.FormatOptions = CrFormatTypeOptions;
                }
                cryRpt.Export();

            }
            catch (Exception ex)
            {
                ex.ToString();
            }
        }

        protected void lbtn_pdf_Click(object sender, EventArgs e)
        {
            converttopdf();
        }

        protected void btn_save_Click(object sender, EventArgs e)
        {
            //ScriptManager.RegisterStartupScript(this, this.GetType(), "Pop", "Clickprint();", true);
        }

        protected void crvPrint_Load(object sender, EventArgs e)
        {
            //    if (Session["first_load"].ToString() == "true")
            //     {
            //        ScriptManager.RegisterStartupScript(this, this.GetType(), "Pop", "setPageDisplay();", true);
            //     }
        }

    }
}