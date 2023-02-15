var ng_HRD_App = angular.module('ng_HRD_App', ['ngFileUpload'])

ng_HRD_App.filter("filterdate", function () {
        var re = /\/Date\(([0-9]*)\)\//;
        return function (x) {
            var m = x.match(re);
            if (m) return new Date(parseInt(m[1]));
            else return null;
        };
    });
//ng_eRSP_App
ng_HRD_App.run(function () {

    //This function is called to extract the DataTable row data
    function DataTable_data(id) {
        var data = []
        var dtrw = $("#" + id).DataTable().rows().data()
        for (var x = 0; x < dtrw.length; ++x) {
            data.push(dtrw[x])
        }
        return data
    }


    //this fucntion is called after refreshTable to return to the current dataTable page
    function changePage(tname, page, id) {
        var npage = page

        var pageLen = $("#" + id).DataTable().page.info().length

        if (page < 2 && pageLen == 0) {
            npage = page + 1
        }

        else if (page > 1 && pageLen == 0) {
            npage = page - 1
        }

        if (npage != 0) {
            s[tname].fnPageChange(npage)
        }
    }

    //This function is called to extract the DataTable rows data
    function DataTable_data(tname) {
        var data = []
        var id = s[tname][0].id;
        var dtrw = $("#" + id).DataTable().rows().data()
        for (var x = 0; x < dtrw.length; ++x) {
            data.push(dtrw[x])
        }
        return data
    }

    //compute for float values
    function computeFloat(v1, v2) {
        var result = 0;

        result = v1 - v2;
        return result;
    }


    //*** format money values with two decimal zeros onblur***

    //*** test if overrides value is a valid money value****
    function isCurrency(nbr) {
        var regex = /^\d+(?:\.\d{0,2})$/;

        if (regex.test(nbr)) {
            return true
        }
        else {
            return false
        }

    }

    function validateEmpty(data) {
        if (data == null || data == "" || data == undefined) {
            return ""
        }
        else {
            return data
        }
    }

    function formatNumber(d) {
        return d.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }


    function leadingZeroMonth(d) {
        var retval = "";
        if (d > 9) {
            retval = d;
        }
        else {
            retval = "0" + d;
           
        }
        return retval
    }

    elEmpty = function (data) {
        if (data == null || data == "" || data == undefined) {
            return true
        }
        else {
            return false
        }

    }

    function currency(d) {
        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = d.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }


    String.prototype.get_page = function (table) {
        var id = this
        var nakit_an = false;
        var rowx = 0;
        $('#' + table + ' tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == id) {
                        nakit_an = true;
                        return false;
                    }
                }
            });
            if (nakit_an) {
                $(this).addClass("selected");
                return false;
            }
            rowx++;
        });
        return nakit_an;
    }

    function get_page(id, table) {

        var nakit_an = false;
        var rowx = 0;
        $('#' + table + ' tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == id) {
                        nakit_an = true;
                        return false;
                    }
                }

            });
            if (nakit_an) {
                $(this).addClass("selected");
                return false;
            }
            rowx++;
        });
        return nakit_an;
    }
    //************************************// 
    //***populate the specified the specified dataTable
    // the parameter table is the scope name of the dataTable and the 
    // id parameter is an optonal parameter it specifies the primary key of the table rows, 
    // if id is set to empty string "" the dataTable values refreshes but will not select the id keys
    // if id is not empty string "" it will look for the specified id and select pagination where the id is found.
    //**********************************//

    Array.prototype.refreshTable = function (table, id) {
        if (this.length == 0) {
            $("#" + table).dataTable().fnClearTable();
        }
        else {
            $("#" + table).dataTable().fnClearTable();
            $("#" + table).dataTable().fnAddData(this);
        }

        if (id != "") {

            for (var x = 1; x <= $("#" + table).DataTable().page.info().pages; x++) {
                console.log(get_page(id, table))
                if (get_page(id, table) == false) {
                    $("#" + table).dataTable().fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }
        return this;
    }


    //************************************// 
    //***populate the specified form fields
    // the parameter id is the mg-model of the form and the 
    // row parameter is the index of row in the data which this function holds.   
    //**********************************//
    Array.prototype.populateFields = function (obj, row) {

        var data = obj
        var thisData = this[row]
        var i_key = Object.keys(obj)
        var f_key = Object.keys(thisData)
        var f_val = Object.keys(thisData).map(function (itm) { return thisData[itm]; });
        for (var x = 0; x < i_key.length; x++) {
            for (var y = 0; y < f_key.length; y++) {
                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].hasAttribute("noinclude") == false) {

                        if (i_key[x] == f_key[y]) {
                            if ($("#" + i_key[x])[0].name == "boolVal") {
                                if (f_val[y] == true) {
                                    $("#" + i_key[x]).val("1");
                                    data[i_key[x]] = "1"
                                }
                                else {
                                    $("#" + i_key[x]).val("0");
                                    data[i_key[x]] = "0"
                                }

                            }
                            else {
                                $("#" + i_key[x]).val(f_val[y]);
                                data[i_key[x]] = f_val[y]
                            }

                        }
                    }
                }
            }
        }
        return data;

    }
    //************************************// 
    //***populate the specified form fields
    // the parameter id is the mg-model of the form and the 
    // row parameter is the index of row in the data which this function holds.   
    //**********************************//
    Array.prototype.populateFields2 = function (form, row) {


        var thisData = this[row]
        var i_key = document.getElementById(form)
        var f_key = Object.keys(thisData)
        var f_val = Object.keys(thisData).map(function (itm) { return thisData[itm]; });

        for (var x = 0; x < i_key.length; x++) {
            for (var y = 0; y < f_key.length; y++) {


                if (i_key[x].id == f_key[y]) {

                    if (i_key[x].name == "boolVal") {

                        if (f_val[y] == true) {
                            //$("#" + i_key[x].id).val("1");
                            i_key[x].value = "1"

                        }
                        else {
                            // $("#" + i_key[x].id).val("0");
                            i_key[x].value = "0"
                        }

                    }
                    else {
                        //$("#" + i_key[x].id).val(f_val[y]);
                        i_key[x].value = f_val[y]
                        // console.log(i_key[x].id + ":" + f_val[y])
                    }

                }


            }
        }


    }




    Array.prototype.select = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] == code
        })
    }
    Array.prototype.delete = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    Array.prototype.deletebyprop = function (code, prop) {

        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    Array.prototype.createNewDataArray = function () {
        var holder = [];
        var d = this;
        for (var x = 0; x < d.length; x++) {
            holder.push({
                seq_no: d[x].seq_no,
                app_ctrl_nbr: d[x].app_ctrl_nbr,
                psb_selected: d[x].psb_selected
            })
        }
        return holder;
    }
})


ng_HRD_App.service("commonScript", ["$compile", "$filter", function (c, f) {
    var email_rgx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var g = "getElementById";
    var gCl = "getElementsByClassName"
    var cE = "createElement"
    var pN = "parentNode";
    var c = "color";
    var iB = "insertBefore";
    var nS = "nextSibling";
    var iH = "innerHTML";
    var st = "style";
    var csT = "cssText ";
    var rC = "removeChild";
    var csF = "cssFloat";
    var iV = "isValid";
    var f8 = "YYYY-MM-DD";
    var r2 = "required2";
    var nR2 = "notrequired2";
    var eE = "elEmpty"

    var tu = true;
    var fe = false;
    var cs = this;
    var cs = this

    return {

        search_in_list: function (value, table) {
            try {
                $("#" + table).DataTable().search(value).draw();
            }
            catch (err) {
                swal(err.message, { icon: "error" })
            }
        },
        setNumOfRow: function (value, table) {
            try {
                $("#" + table).DataTable().page.len(value).draw();
            }
            catch (err) {
                swal(err.message, { icon: "error" })
            }
        },


        currentyear: function () {
            var retval = new Date().getFullYear().toString()

            return retval
        },

        scoreToPercentage: function (val, perc) {
            var retval = parseFloat(val) * (parseFloat(perc) / 100)
            return retval
        },

        percentageToScore: function (val, perc) {
            var retval = (parseFloat(val) * 100) / parseFloat(perc)
            return retval
        },



        sector: function (data) {
            if (data) {
                return "Government"
            }
            else {
                return "Private"
            }
        },

        YesOrNo: function (data) {
            if (data == true) {
                return "Yes"
            }
            else if (data == false) {
                return "No"
            }
            else {
                return ""
            }
        },

        clearTable: function (table) {

            $("#" + table).dataTable().fnClearTable();

        },

        loading: function (action) {
            $("#common_loading_modal").modal(action)
        },

        RetrieveYear: function () {
            var year = []
            var currentYear = new Date().getFullYear();

            var prev_year = currentYear - 8;
            for (var i = 1; i <= 9; i++) {
                var data = { "year": prev_year }
                year.push(data)
                prev_year++;
            }
            return year;
        },

        TextValue: function (id, data) {

            if (elEmpty(id)) {
                return ""
            }
            else {
                var dt = data.filter(function (d) {
                    return d.id == id
                })[0].text
                if (elEmpty(dt)) {
                    return ""
                }
                else {
                    return dt
                }
            }
        },


        ValidateFields: function (obj) {
            var retval = 0;
            var bol = false
            var i_key = Object.keys(obj)
            //var i_val = Object.keys(obj).map(function (itm) { return obj[itm]; });

            for (var x = 0; x < i_key.length; x++) {
                var i_val = $("#" + i_key[x]).val()

                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].hasAttribute("required")) {

                        if (this.elEmpty(i_val)) {
                            this.required(i_key[x])
                            retval = retval + 1
                        }
                        else {
                            this.notrequired(i_key[x]);
                        }
                    }
                }
            }

            if (retval == 0) {
                bol = true
            }
            else {
                bol = false
            }

            return bol
        },

        Validate1Field: function (id) {
            var val = $("#" + id).val();
            if (this.elEmpty(val)) {
                this.required2(id, "Required Field")
                return false;
            }
            else {
                this.notrequired2(id);
                return true
            }
        },


        ValidateNotZero: function (id) {
            var val = $("#" + id).val();
            if (val == 0 || val == "0") {
                this.required2(id, "Required Field")
                return false;
            }
            else {
                this.notrequired2(id);
                return true
            }
        },



        elEmpty2: function (type, name) {
            var val = $(type + name).val();
            if (val.trim() == null || val.trim() == "" || val.trim() == undefined) {
                return true
            }
            else {
                return false
            }
        },


        //************************************// 
        //*** Clear the fields of a form the id parameter is the name of the form            
        //**********************************// 
        clearFields: function (obj) {
            var data = obj
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].hasAttribute("noclear") == false) {
                        $("#" + i_key[x]).val("");
                        data[i_key[x]] = "";

                    }
                    this.notrequired(i_key[x])
                }
            }
            return data;
        },

        clearFormFields: function (idf) {
            var hA = "hasAttribute";
            var i = "id";
            var l = "length";
            var f = "form";
            var t = "type";
            var v = "value";
            var retval = 0;
            var form = $(this.D_id(idf))[0] // form element

            var l = form[l] //lenght of the form- number of child element

            for (var x = 0; x < l; x++) {
                var tp = form[x][t] //element type
                var id = form[x][i] // element id
                $("#" + id).val("")
            }
        },



        //************************************// 
        //*** Clear the fields of a form the id parameter is the name of the form            
        //**********************************// 
        clearfield: function (id) {
            $("#" + id).val("");
        },



        //************************************//
        // Add the red border of the element and show the required warning text
        // id parameter is the id of the field and class of the small tag that hold the Required Field Text.  
        //************************************//
        required: function (n) {

            $("#" + n).css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            })

            $("." + n).removeClass("hidden")

        }



        //************************************//
        // Remove the red border of the element and hide the required warning text
        // id parameter is the id of the field and class of the small tag that hold the Required Field Text.  
        //************************************//
        , notrequired: function (n) {

            $("#" + n).css({
                "border-color": "E5E6E7",
                "border-width": "1px",
                "border-style": "solid"
            })
            $("." + n).addClass("hidden")
        }


        //************************************//
        //***    check if data is empty     ****//
        //************************************//
        , elEmpty: function (data) {
            if (data == null || data == "" || data == undefined) {
                return true
            }
            else {
                return false
            }

        }
        //************************************//
        //***check if element value is empty****//
        //************************************//
        , elEmpty3: function (id) {
            var data = document[g](id)
            if (data == null || data == "" || data == undefined) {
                return true
            }
            else {
                return false
            }

        }

        , removeFormReq: function (obj) {
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                this.notrequired(i_key[x]);

            }
        }


        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        , DisabledAllFields: function (obj) {

            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                if ($("#" + i_key[x])[0] != undefined) {

                    $("#" + i_key[x]).prop("disabled", true);
                    $('div.input-group-addon.' + i_key[x]).hide();

                }

            }
        }
        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        , DisabledAllFields2: function (obj) {
            for (var x = 0; x < obj.length; x++) {
                $("#" + obj[x]).prop("disabled", true);
            }
        }
        , EnabledAllFields2: function (obj) {
            for (var x = 0; x < obj.length; x++) {
                $("#" + obj[x]).prop("disabled", false);
            }
        }

        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        , DisabledField: function (id) {
            $("#" + id).prop("disabled", true);
        }



        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        , EnabledField: function (id) {

            if (!$("#" + id)[0].hasAttribute("alwaysdisabled")) {
                $("#" + id).prop("disabled", false);

            }

        }

        //************************************//
        // Validate Field of the form if Empty then border set to red and required warning will show below
        // id parameter is the ng-model of the form   
        //************************************//
        , uncheckAllCheckbox: function (obj) {
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].type == "checkbox") {
                        $("#" + i_key[x]).prop("checked", false);
                    }
                }
            }
        }



        //************************************//
        // Validate Field of the form if Empty then border set to red and required warning will show below
        // id parameter is the ng-model of the form   
        //************************************//
        , leadingZeroMonth: function (d) {
            var retval = "";
            if ((d + 1) < 10) {
                retval = "0" + (d + 1);
            }
            else {
                retval = (d + 1);
            }
            return retval
        }
        //************************************//
        // add zero to if value is less than 10 
        // d parameter is the value to be process
        //************************************//
        , leadingZeroDate: function (d) {
            var retval = "";
            if ((d + 1) < 10) {
                retval = "0" + d;
            }
            else {
                retval = d;
            }
            return retval
        }

        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        , EnabledAllFields: function (obj) {
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                if ($("#" + i_key[x])[0] != undefined) {
                    if (!$("#" + i_key[x])[0].hasAttribute("alwaysdisabled")) {
                        $("#" + i_key[x]).prop("disabled", false);
                        //$('div.input-group-addon.' + i_key[x]).show();
                    }
                }

            }
        },
        spinnerRemove: function (id, cl) {
            $("." + id).removeClass("fa fa-spinner fa-spin");
            $("." + id).addClass(cl);
            $("." + id).prop("disabled", false);
        },


        spinnerAdd: function (id, cl) {
            $("." + id).removeClass(cl);
            $("." + id).addClass("fa fa-spinner fa-spin");
            $("." + id).prop("disabled", true);
        }
        , D_id: function (id) {
            return document[g](id)
        },
        D_cl: function (cl) {
            return document[gCl](cl)
        },
        D_cE: function (id) {
            return document[cE](id)
        },
        insertAfter: function (rN, nN) {
            rN[pN][iB](nN, rN[nS]);

        },


        //************************************//
        // Add the red border of the element and show the required warning text
        // id parameter is the id of the field and class of the small tag that hold the Required Field Text.  
        //************************************//
        required2: function (n, wn) {
            $("#" + n).css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            })
            var element = this.D_cl(n)[0];
            var div = this.D_id(n);
            var el = this.D_cE("span")
            el.className += n;
            el[iH] = wn;
            el[st][c] = "red";
            el[st][csF] = "right";

            if (this.elEmpty(element)) {
                this.insertAfter(div, el);
            }
            else {
                element[pN][rC](element);
                this.insertAfter(div, el);
            }
        },
        //************************************//
        // Remove the red border of the element and hide the required warning text
        // id parameter is the id of the field and class of the small tag that hold the Required Field Text.
        //************************************//
        notrequired2: function (n) {
            $("#" + n).css({
                "border-color": "#E5E6E7",
                "border-width": "1px",
                "border-style": "solid"
            })
            var el = this.D_cl(n)[0];
            if (!this.elEmpty(el)) {
                el[pN][rC](el);
            }
        },

        //**********************************************
        //******** validate date correct format ********
        //**********************************************
        valid_date: function (eval, id) {


            var retval = 0;
            if (moment(eval, f8, tu)[iV]()) {
                this[nR2](id) //call notrequired2 function
            }
            else {
                this[r2](id, "Invalid date") //call required2 function
                retval = retval + 1
            }
            return retval == 0 ? true : false;
        },

        //**********************************************
        //******** validate email correct format *******
        //**********************************************
        valid_email: function (eval, id) {
            var retval = 0;
            if (email_rgx.test(eval)) {
                this[nR2](id) //call notrequired2 function
            }
            else {
                this[r2](id, "Invalid email address") //call required2 function
                retval = retval + 1
            }
            return retval == 0 ? true : false;
        },


        //**********************************************
        //******** validate textbox format *******
        //**********************************************
        valid_textbox: function (eval, id) {
            var retval = 0;
            if (this[eE](eval)) {
                this[r2](id, "Required field")
                retval = retval + 1
            }
            else {
                this[nR2](id)
            }
            return retval == 0 ? true : false;
        },

        //********************Created by Marvin Olita-2020-07-26********************************************
        //******** 1. use this function to validate the form fields the has required attribute      ********
        //******** 2. parameter is the id of the button to be click                                 ********
        //******** 3. in order this to work you must enclose all the field inside the form          ********
        //******** 4. a form must have an id and novalidate attribute on the oppening tag           ********
        //******** 5. you must put norequired class in every required field                         ********
        //******** 6. dont forget to put type attribute to every required field                     ********
        //******** 7. if you want date to be validated you should add mydate and required attribute ********
        //******** 8. functions: valid_date,valid_email,notrequired2,required2,elEmpty              ********
        //******** 9. directives: norequired                                                        ********
        //******** 10. add norequired  to class to remove required warning when validation is true  ********                                                      ********
        //**************************************************************************************************
        validatesubmit: function (idf) {
            console.log(idf)
            var hA = "hasAttribute";
            var i = "id";
            var l = "length";
            var f = "form";
            var t = "type";
            var v = "value";
            var retval = 0;
            var form = $(this.D_id(idf))[0] // form element

            var l = form[l] //lenght of the form- number of child element

            for (var x = 0; x < l; x++) {
                var tp = form[x][t] //element type
                var id = form[x][i] // element id

                if ($("#" + id)[0] != undefined) {
                    var rq = $("#" + form[x][i])[0][hA]("required") //return true if element has required attribute
                    var date = $("#" + form[x][i])[0][hA]("mydate") //return true if element has mydate attribute

                    if (rq) {
                        var eval = this.D_id(id)[v]
                        if (tp == "text" && !date) // if field type is text
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                        if (tp == "number") // if field type is text
                        {
                            var ao = $("#" + form[x][i])[0][hA]("allowZero")
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (ao) {

                                }
                                else {
                                    if (eval == 0 || eval == "0") {
                                        this[r2](id, "Required field")
                                        retval = retval + 1
                                    }
                                    else {
                                        this[nR2](id)
                                    }

                                }
                            }
                        }
                        else if (tp == "email") // if field type is email
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (!this.valid_email(eval, id)) //call valid_email function ; expected value: false
                                {
                                    retval = retval + 1
                                }
                            }
                        }
                        else if (tp == "select-one") {
                            console.log(this[eE](eval))
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                        else if (date) // if field type is date; note in order this to work you should put mydate attribute to the date input field
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (!this.valid_date(eval, id)) //call valid_date function ; expected value: false
                                {
                                    retval = retval + 1
                                }
                            }
                        }
                    }
                }

            }

            return retval == 0 ? true : false;
        },
        validatesubmit2: function (arr) {

            var hA = "hasAttribute";
            var i = "id";
            var l = "length";
            var f = "form";
            var t = "type";
            var v = "value";
            var retval = 0;
            //var form = $(this.D_id(idf))[0] // form element

            var l = arr[l] //lenght of the form- number of child element

            for (var x = 0; x < l; x++) {
                var tp = $("#" + arr[x])[0][t] //element type
                var id = $("#" + arr[x])[0][i] // element id
                if ($("#" + id)[0] != undefined) {
                    var rq = $("#" + arr[x])[0][hA]("required") //return true if element has required attribute
                    var date = $("#" + arr[x])[0][hA]("mydate") //return true if element has mydate attribute
                    if (rq) {
                        var eval = this.D_id(id)[v]
                        if (tp == "text" && !date) // if field type is text
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                        if (tp == "number") // if field type is text
                        {
                            var ao = $("#" + arr[x])[0][hA]("allowZero")
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (ao) {

                                }
                                else {
                                    if (eval == 0 || eval == "0") {
                                        this[r2](id, "Required field")
                                        retval = retval + 1
                                    }
                                    else {
                                        this[nR2](id)
                                    }

                                }
                            }
                        }
                        else if (tp == "email") // if field type is email
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (!this.valid_email(eval, id)) //call valid_email function ; expected value: false
                                {
                                    retval = retval + 1
                                }
                            }
                        }
                        else if (tp == "select-one") {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                        else if (date) // if field type is date; note in order this to work you should put mydate attribute to the date input field
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (!this.valid_date(eval, id)) //call valid_date function ; expected value: false
                                {
                                    retval = retval + 1
                                }
                            }
                        }
                    }
                }
            }
            return retval == 0 ? true : false;
        },

        populateFormFields: function (idf, obj) {
            var hA = "hasAttribute";
            var i = "id";
            var l = "length";
            var f = "form";
            var t = "type";
            var v = "value";
            var cb = "combine";
            var retval = 0;

            var form = this.D_id(idf) // form element

            var f_key = Object.keys(obj)
            var f_val = Object.keys(obj).map(function (itm) { return obj[itm]; });
            var l = form[l] //lenght of the form- number of child element
            for (var x = 0; x < l; x++) {
                var tp = form[x][t] //element type
                var id = form[x][i] // element id
                if (tp != "button" && tp != "submit") {
                    for (var z = 0; z < f_key.length; z++) {
                        if (f_key[z].trim() == id.trim()) {
                            form[x][v] = f_val[z]
                        }
                    }
                }
            }
            //return retval == 0 ? true : false;
        },



        combine: function (id, obj, data) {
            var value = ""
            var f_data_key = Object.keys(data)
            var f_data_val = Object.keys(data).map(function (itm) { return data[itm]; });
            var l = obj.length //lenght of the form- number of child element
            for (var x = 0; x < l; x++) {
                console.log(obj[x].trim())
                for (var z = 0; z < obj.length; z++) {
                    console.log(f_data_key[z].trim())
                    if (obj[x].trim() == f_data_key[z].trim()) {
                        value = value + f_data_val[z]
                    }
                }
            }
            $("#" + id).val(value)
        },

        dropdown: function (data) {
            var dt = []
            var i = {}

            var dta = this.elEmpty(data.items) ? "" : data.items
            var value = this.elEmpty(data.value) ? "" : data.value
            var descr = this.elEmpty(data.description) ? "" : data.description
            if (dta.length == 0) {
                i[value] = '0'
                i[descr] = "No item to show"
                dt.push(i)
                return dt
            }
            else {
                return dta
            }

        },
        count_grid_cbcheck: function (d, i) {
            var dl = d.length
            var cc = 0
            for (x = 0; x < dl; x++) {
                if ($("#" + i + x).is(":checked")) {
                    cc++
                }
            }
            return cc > 0 ? true : false;
        }
        //************************************//
        // Validate Field of the form if Empty then border set to red and required warning will show below
        // id parameter is the ng-model of the form   
        //************************************//
        //$("#myCheck").prop("checked", true);
        , CheckOnlyOne: function (d, i, r) {
            var dl = d.length

            for (x = 0; x < dl; x++) {
                if (x == r) {
                    $("#" + i + x).prop("checked", true);
                }
                else {
                    $("#" + i + x).prop("checked", false);
                }
            }
        },
        ifnull: function (val, alt) {
            if (this.elEmpty(val)) {
                return alt;
            }
            else {
                return val;
            }
        },

        dynamicSort: function (property) {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a, b) {
                /* next line works with strings and numbers, 
                 * and you may want to customize it to your needs
                 */
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
            }
        },

        //************************************// 
        //***populate the specified form fields
        // the parameter id is the mg-model of the form and the 
        // row parameter is the index of row in the data which this function holds.   
        //**********************************//
        fetchDataFromForm: function (form) {

            var data = {}
            var i_key = document.getElementById(form)
            for (var x = 0; x < i_key.length; x++) {
                if (i_key[x].id == "gov_srvc") {
                    if (i_key[x].value = "1") {
                        data[i_key[x].id] = true
                    }
                    else {
                        data[i_key[x].id] = false
                    }

                }
                else {
                    data[i_key[x].id] = i_key[x].value
                }

            }
            return data

        },
        getValue: function (id) {

            return $("#"+id).val()

        }

    }
}])
ng_HRD_App.filter("filterdate", function () {
    var re = /\/Date\(([0-9]*)\)\//;
    return function (x) {
        var m = x.match(re);
        if (m) return new Date(parseInt(m[1]));
        else return null;
    };
});

ng_HRD_App.directive("headerSearch", ["commonScript", function (cs) {
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('keyup', function () {
                cs.search_in_list(elem.val(), attrs.tableref)
            })
        }
    }
}])


ng_HRD_App.directive("setTableRow", ["commonScript", function (cs) {
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('change', function () {
                cs.setNumOfRow(elem.val(), attrs.tableref)
            })

        }
    }
}])

ng_HRD_App.directive('removeReq', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive remove the required warning of the specified input field on keyup
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('keyup', function () {
                if (!cs.elEmpty2("#", attrs.id)) {
                    cs.notrequired(attrs.id)
                }
            })
        }
    }
}])

ng_HRD_App.directive('removeReqDate', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive remove the required warning of the specified input field on keyup
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {
                if (!cs.elEmpty(elem.val())) {
                    cs.notrequired(attrs.id)
                }
            })
        }
    }
}])
ng_HRD_App.directive('removeReqOption', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive remove the required warning of the specified select option  on change
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('change', function () {
                if (!cs.elEmpty(elem.val())) {
                    cs.notrequired(attrs.id)
                }
            })

        }
    }
}])



ng_HRD_App.directive('dateMinVal', ["commonScript", function (cs) {

    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {
                var form = elem[0].form.id;
                var id = attrs.id;
                var val = elem.val();
                var maxval = $('#' + form + ' input[name="maxDate"]').val();
                var s = scope[form]
                if (!cs.elEmpty(val)) {
                    if (!cs.elEmpty($('#' + form + ' input[name="maxDate"]').val())) {
                        if (val >= maxval) {
                            swal("You have selected " + val + ". Date from must be lower than Date to", { icon: "warning" })
                            elem.val("");
                            s[id] = "";
                            $("#" + id).focus();
                        }
                    }
                }
            })
        }
    }
}])

ng_HRD_App.directive('dateMaxVal', ["commonScript", function (cs) {

    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {
                var form = elem[0].form.id;
                var id = attrs.id;
                var val = elem.val();
                var minval = $('#' + form + ' input[name="minDate"]').val();
                var s = scope[form]
                if (!cs.elEmpty(val)) {
                    if (!cs.elEmpty($('#' + form + ' input[name="minDate"]').val())) {
                        if (val <= minval) {
                            swal("You have selected " + val + ". Date to must be higher than Date from", { icon: "warning" })
                            elem.val("");
                            s[id] = "";
                            $("#" + id).focus();
                        }
                    }
                }
            })
        }
    }
}])




ng_HRD_App.directive('norequired', ["commonScript", function (cs) {
    var t = "type"
    var hA = "hasAttribute"
    //************************************// 
    //*** this directive remove the required warning if fields is not empty
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('focus', function () {
                var tp = elem[0][t]
                var id = elem[0].id
                if (tp == "text" || tp == "email" || tp == "number") {
                    elem.on('keyup', function () {
                        var eval = elem[0].value
                        if (!cs.elEmpty(eval)) {
                            cs.notrequired2(id)
                        }
                    })
                }
                else if (tp == "select-one") {
                    elem.on('change', function () {
                        var eval = elem[0].value
                        if (!cs.elEmpty(eval)) {
                            cs.notrequired2(id)
                        }
                    })
                }

            })

        }
    }
}])

//ng_HRD_App.directive('norequired', ["commonScript", function (cs) {
//    var t = "type"
//    var hA = "hasAttribute"
//    //************************************// 
//    //*** this directive remove the required warning if fields is not empty
//    //************************************// 
//    return {
//        restrict: 'C',
//        link: function (scope, elem, attrs) {
//            elem.on('focus', function () {
//                var tp = elem[0][t]
//                var id = elem[0].id
//                if (tp == "text" || tp == "email" || tp == "textarea") {
//                    elem.on('keyup', function () {
//                        var eval = elem[0].value
//                        if (!cs.elEmpty(eval)) {
//                            cs.notrequired2(id)
//                        }
//                    })
//                }


//            })

//        }
//    }
//}])

//ng_HRD_App.directive('typedropdown', ["commonScript", "$compile", function (cs, $compile) {

//    //************************************// 
//    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
//    //************************************// 
//    return {
//        restrict: 'C',
//        scope: { datasrc: '=' },
//        template: '<input type="text" style="width:82%;" class=" form-control"  id="applicant" ng-model="applicant" />'
//                 + '<select class="form-control">'
//                 + '<option>--Select Here--</option>'
//                 + '<option ng-repeat="l in datasrc">{{l.}}</option>'
//                 + '</select>',

//        link: function (scope,elem, attrs) {


//            elem.on('keyup', function () {
//                var nc = ""
//                var nl = ""
//                var dt = scope.datasrc
//                var el_val = elem.val()
//                scope.nwdt = dt.filter(function (d) {
//                    return d.applicant_name.toUpperCase().includes(el_val.toUpperCase())
//                })
//            })

//        }
//    }
//}])
