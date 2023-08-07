using HRIS_eAATS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using HRIS_Common;
using System.Text;
using BioMetrixCore;

namespace HRIS_eAATS.Controllers
{
    
    public class BioExtractController : Controller
    {
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        DeviceManipulator manipulator = new DeviceManipulator();
        public ZkemClient objZkeeper;
        private bool isDeviceConnected = false;
        public string ipAddress = "";
        public int portNumber = 0;
        public string port = "";
        public string bio_connect_info = "";
        public bool success = false;


        List<bio_machine_info> bioinfo = new List<bio_machine_info>();
        string currentMonth = DateTime.Now.ToString("MM");
        string currrentYear = DateTime.Now.Year.ToString();

        // GET: BioExtract
        public ActionResult Index()
        {
            return View();
        }


        //*********************************************************************//
        // Created By : MMO - Created Date : 077/13/2023
        // Description: Get Biometrics info  list
        //*********************************************************************//
        public ActionResult GetBiometricsInfo()
        {
            try
            {
                var biometrics_location = db_dtr.bio_machine_info_tbl.Where(a => a.bio_status == 1);
                return JSON(new { biometrics_location, icon = "success",message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message, icon = "success" }, JsonRequestBehavior.AllowGet);
            }

        }


        public bool IsDeviceConnected
        {
            get { return isDeviceConnected; }
            set
            {
                isDeviceConnected = value;
                if (isDeviceConnected)
                {
                    //ShowStatusBar("The device is connected !!", true);

                    // ToggleControls(true);
                }
                else
                {
                    // ShowStatusBar("The device is diconnected !!", true);
                    objZkeeper.Disconnect();

                    //   DisplayEmpty();
                    //  ToggleControls(false);
                }
            }
        }
        public void ShowStatusBar(string message, bool type)
        {
            if (message.Trim() == string.Empty)
            {
                //  lblStatus.Visible = false;
                return;
            }

            //  lblStatus.Visible = true;
            // lblStatus.Text = message;
            // lblStatus.ForeColor = Color.White;

            if (type)
            {
                //    lblStatus.BackColor = Color.FromArgb(79, 208, 154);
            }
            else
            {
                //   lblStatus.BackColor = Color.FromArgb(230, 112, 134);
            }
        }

        //created by Marvin Olita
        //This function will pull all the data from biometric machine and insert it to the sql database
        private Boolean ip_connect(string ip, string port, int machineNumber)
        {
            try
            {

                if (IsDeviceConnected)
                {
                    IsDeviceConnected = false;

                    return true;
                }

                if (ip == string.Empty || port == string.Empty)
                {

                    throw new Exception("The Device IP Address and Port is mandatory !!");
                }

                if (!int.TryParse(port, out portNumber))
                {
                    throw new Exception("Not a valid port number");
                }

                bool isValidIpA = UniversalStatic.ValidateIP(ip);

                if (!isValidIpA)
                {
                    throw new Exception("The Device IP is invalid !!");
                }

                isValidIpA = UniversalStatic.PingTheDevice(ip);

                if (!isValidIpA)
                {
                    throw new Exception("The device at " + ip + ":" + port + " did not respond!!");
                }

                objZkeeper = new ZkemClient(RaiseDeviceEvent);

                IsDeviceConnected = objZkeeper.Connect_Net(ip, portNumber);

                if (IsDeviceConnected)
                {
                    string deviceInfo = manipulator.FetchDeviceInfo(objZkeeper, machineNumber);

                }
                success = true;
                bio_connect_info = "IP Address successfully connected";
            }
            catch (Exception)
            {

                success = false;
            }
            return success;
        }

        private void RaiseDeviceEvent(object sender, string actionType)
        {
            switch (actionType)
            {
                case UniversalStatic.acx_Disconnect:
                    {
                        break;
                    }
                default:
                    break;
            }
        }

        private int ISNULL_INT(int para)
        {
            if (para == 0)
            {
                return 0;
            }
            else
            {
                return para;
            }
        }


       

        public ActionResult RerunBioExtract(string ip, string date_from, string date_to, int MachineNumber, string empl_id)
        {

            db_dtr.Database.CommandTimeout = int.MaxValue;
            //var message = "";
            var mn = 0;
            var bl = "";
            var date = DateTime.Now;

            var logstatus = false;
            long prc_nbr = 0;
            var prc_parameters = "";
            int fail = 0;
           
            


            var year = Convert.ToDateTime(date_from).Year.ToString();
            var month = Convert.ToDateTime(date_from).Month.ToString().ToCharArray().Count() > 1 ? Convert.ToDateTime(date_from).Month.ToString() : "0" + Convert.ToDateTime(date_from).Month.ToString();
            List<bio_machine_info_tbl> bmil = new List<bio_machine_info_tbl>();
            List<sp_timefilter_bioextract_Result> sfdl = new List<sp_timefilter_bioextract_Result>();
            List<biomachine_data> machineinfo = new List<biomachine_data>();
            List<sp_extract_process_Result> dpfl = new List<sp_extract_process_Result>();
            List<machine_prim_key> mpkl = new List<machine_prim_key>();
            ICollection<MachineInfo> lstMachineInfo;

            try
            {

                sfdl = db_dtr.sp_timefilter_bioextract().ToList();
                var fnd1 = 0;

                bmil = db_dtr.bio_machine_info_tbl.Where(a => a.MachineNumber == MachineNumber).ToList();

                fnd1 = bmil.Count;

                if (fnd1 == 0) throw new Exception("IP Address not found in bio_machine_info_tbl");

                port = bmil[0].port_number.ToString();
              
                var bmil_count = bmil.Count;




                if (ip_connect(bmil[0].ip_address, port, bmil[0].MachineNumber)) // open the biomachine connection
                {
                    var dbobj = db_dtr.sp_delete_bio_extract_stg_tbl_bydateAndMachine(int.Parse(bmil[0].MachineNumber.ToString()), Convert.ToDateTime(date_from), Convert.ToDateTime(date_to));

                     lstMachineInfo = manipulator.GetLogData(objZkeeper, bmil[0].MachineNumber, Convert.ToDateTime(date_from), Convert.ToDateTime(date_to), empl_id);

                    if (lstMachineInfo != null && lstMachineInfo.Count > 0)
                    {
                        int lstMachineInfo_count = lstMachineInfo.Count;
                        int lstMachineInfo_fetch = 0;
                        foreach (var l in lstMachineInfo)
                        {
                            biomachine_data mi = new biomachine_data();
                            mi.MachineNumber = l.MachineNumber;
                            mi.IndRegID = l.IndRegID;
                            mi.DateTimeRecord = l.DateTimeRecord;
                            mi.VerifyMode = l.VerifyMode;
                            mi.InOutMode = l.InOutMode;
                            mi.WorkCode = l.WorkCode;
                            mi.DateOnlyRecord = l.DateOnlyRecord.ToShortDateString();
                            mi.TimeOnlyRecord = l.TimeOnlyRecord.ToShortTimeString();
                            machineinfo.Add(mi);

                            int a = db_dtr.sp_insert_bio_extract_stg_tbl(
                                ISNULL_INT(l.MachineNumber)
                                , l.IndRegID
                                , l.DateTimeRecord
                                , l.VerifyMode
                                , l.InOutMode
                                , l.WorkCode
                                , l.DateOnlyRecord
                                , l.TimeOnlyRecord
                                , bmil[0].extract_type);
                            if (a > 0) lstMachineInfo_fetch++;



                        }

                        logstatus = true;

                        if (lstMachineInfo_fetch == lstMachineInfo_count) bio_connect_info = lstMachineInfo_fetch + " out of " + lstMachineInfo_count + " data was successfully extracted from bio machine!";
                    }
                    else
                    {
                        logstatus = true;
                        fail = fail + 1;
                        throw new Exception("No records found!");
                    }

                    ip_connect(bmil[0].ip_address, port, bmil[0].MachineNumber);// close the biomachine connection

                    dpfl = db_dtr.sp_extract_process(
                              empl_id
                            , date_from
                            , date_to
                            , ""
                            , year
                            , month
                            , "BTHADM"
                            , bmil[0].extract_type
                        ).ToList();



                    if (dpfl[0].result_value == "E")
                    {
                        prc_nbr = (long)dpfl[0].process_nbr;
                        prc_parameters = dpfl[0].prc_parameter;
                        throw new Exception(dpfl[0].result_value_descr);
                    }

                }
                else
                {
                    throw new Exception("Biometrics failed to connect !!");
                }
                if (bmil.Count > 0)
                {
                    mn = bmil[0].MachineNumber;
                    bl = bmil[0].bio_location;
                }
                else
                {
                    bl = "Undefined";
                }

                var inf = db_dtr.sp_insert_bio_log_info_tbl(
                     date
                   , mn
                   , bmil[0].ip_address
                   , bl
                   , bio_connect_info
                   , Convert.ToInt32(logstatus)
                   , dpfl[0].process_nbr
                   , dpfl[0].prc_parameter);

                return JSON(new { message = bio_connect_info, icon = "success", machineinfo,process_number = dpfl[0].process_nbr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                if (bmil.Count > 0)
                {
                    mn = bmil[0].MachineNumber;
                    bl = bmil[0].bio_location;
                }
                else
                {
                    bl = "Undefined";
                }

                logstatus = false;
                bio_connect_info = ex.Message;
                var inf = db_dtr.sp_insert_bio_log_info_tbl(
                       date
                     , mn
                     , bmil[0].ip_address
                     , bl
                     , bio_connect_info
                     , Convert.ToInt32(logstatus)
                     , prc_nbr
                     , prc_parameters);


                return JSON(new { message = bio_connect_info, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description : DATA CONVERTION FOR JSON
        //*********************************************************************//
        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }
    }

    
  
}