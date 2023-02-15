<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="CrystalViewer.aspx.cs" Inherits="HRIS_eAATS.Reports.CrystalViewer" %>

<%@ Register Assembly="CrystalDecisions.Web, Version=13.0.3500.0, Culture=neutral, PublicKeyToken=692fbea5521e1304" Namespace="CrystalDecisions.Web" TagPrefix="CR" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <script src="../crystalreportviewers13/js/crviewer/crv.js"></script>
    <script src="../Scripts/ngSweetAlert.js"></script>
     <style type="text/css">
        .print-scroll {
            min-width:100% !important;
        }
        .nextback
        {
            margin-left: 905px;
        }
        .marg{
            margin-left:2px;
            margin-right:2px;
        }
        div#MainContainer_crvPrint__UI_mb,div#MainContainer_crvPrint__UI_bc{
                background-color: rgb(136, 136, 136);
                position: fixed;
                opacity: 0.3;
                display: none;
                z-index: 998;
                visibility: hidden;
                width: 0px !important;
                height:0px !important;
                left:0px !important;
                top: 0px !important;
        }
    </style>
    
</head>
<body style="overflow-x:hidden;overflow-y:hidden">
  
    <form id="form1" runat="server">
            <asp:HiddenField ID="hf_nexpage" runat="server" />
            <asp:HiddenField ID="hf_printers" runat="server" />
        <div class="row">
            <div class="col-12">
                <div id="crvHolder" style="overflow:scroll; width:100%;">
                    <CR:CrystalReportViewer 
                            ID="crvPrint" 
                            runat="server" 
                            PageZoomFactor="90"
                            HasToggleGroupTreeButton="False" 
                            ToolPanelView="None" 
                            HasPrintButton="true" 
                            InteractiveDeviceInfos="(Collection)" 
                            WaitMessageFont-Names="Verdana"
                            ShowPrintButton="true" 
                            ToolPanelWidth  ="200px" 
                            HasGotoPageButton="True" 
                            HasSearchButton="True"
                            HasRefreshButton="True"
                            HasDrilldownTabs="False" 
                            DisplayStatusbar="False" 
                            HasPageNavigationButtons="True" 
                            EnableDatabaseLogonPrompt="False" 
                            EnableDrillDown="False" 
                            EnableParameterPrompt="False" 
                            HasCrystalLogo="False" 
                            HasDrillUpButton="False"
                            CssClass="print-scroll"
                            PrintMode="ActiveX"
                            OnLoad="crvPrint_Load"
                            HasToggleParameterPanelButton="False" 
                            HasZoomFactorList="True"
                            HasExportButton="True" GroupTreeStyle-ShowLines="False" />
                </div>
            </div>
        </div>
    </form>

</body>
    <script>
        (function init() {
            var windowHt = window.innerHeight;
            //console.log(windowHt)
            var cryViewer = document.getElementById("crvHolder");
            //console.log(cryViewer)
            cryViewer.style.height = windowHt - 5 + "px";

        })()

        function OpenNoDataFound()
        {
            alert("NO DATA");
            //swal("Successfully " + useraction + "!", "Existing record successfully " + "asd" +" "+ "asd" + "!" , "success")
        }
    </script>
</html>

