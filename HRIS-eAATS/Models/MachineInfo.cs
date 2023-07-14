using System;

namespace BioMetrixCore
{
    public class MachineInfo
    {
        public int MachineNumber { get; set; }
        public int IndRegID { get; set; }
        public string DateTimeRecord { get; set; }
        public int VerifyMode { get; set; }
        public int InOutMode { get; set; }
        public int WorkCode { get; set; }

        public DateTime DateOnlyRecord
        {
            get { return DateTime.Parse(DateTime.Parse(DateTimeRecord).ToString("yyyy-MM-dd")); }
            set { }
        }
        public DateTime TimeOnlyRecord
        {
            get { return DateTime.Parse(DateTime.Parse(DateTimeRecord).ToString("hh:mm:ss tt")); }
            set { }
        }

    }
    public class bio_machine_info
    {
        public int MachineNumber { get; set; }
        public string ip_address { get; set; }
        public int port_number { get; set; }
        public string bio_location { get; set; }
        public string mac_address { get; set; }
        public int bio_status { get; set; }
        public int extract_type { get; set; }
    }

    public class bio_machine_connection_info
    {
        public int MachineNumber { get; set; }
        public string ip_address { get; set; }
        public int port_number { get; set; }
        public string bio_status { get; set; }
        public string ping { get; set; }
    }

    //public class dtr_processed_files_tbl
    //{
    //    public long process_nbr { get; set; }
    //    public string result_value { get; set; }
    //    public string result_value_descr { get; set; }
    //    public string result_filename { get; set; }
    //    public string processed_by { get; set; }
    //    public DateTime processed_dttm { get; set; }
    //}

    public class machine_prim_key
    {
        public DateTime log_date { get; set; }
        public int MachineNumber { get; set; }
        public string ip_address { get; set; }
    }

    public class sp_filter_date
    {
        public DateTime startdate { get; set; }
        public DateTime lastdate { get; set; }
        public String year { get; set; }
        public String month { get; set; }
    }
}
