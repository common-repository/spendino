(function( $ ) {
    'use strict';
    const { __, _x, _n, _nx } = wp.i18n;
    $( window ).load(function(){

        if($('#env_secret').val() === '') {
            $('#retrievebtn').prop('disabled', true);
            $('.demo-header').css('display', 'block');
        }

        $('#connectionBtn').on('click', function() {
            let env = $(this).attr('data-key');
            testConnection(env);
        })

        $('.connect-btn-close').on('click', function() {
            $('.alert-success').css('display', 'none');
            $('.alert-danger').css('display', 'none');

        })

        if($('#tableFormTitle').val() === "Mein Demo Formular") {
            let tableRowName = $('#tableFormTitle').val("Mein Demo Formular").closest('tr').find('.tableFormTitle').text();

            if(tableRowName === "Mein Demo Formular") {
                $('#editForm').css('display', 'none');
                $('#text-divider-line').css('display', 'none');
            }
        }

        function testConnection(env){
            let env_url = $('#env_url').val();
            let env_apikey = $('#env_api_key').val();
            let env_secret = $('#env_secret').val();
            let env_user = env_apikey + ':' + env_secret;

            $.ajax({
                type: 'GET',
                async: false,
                headers:{
                    'Authorization': 'Basic ' + btoa(env_user),
                    "Accept":"application/json",
                    "Content-type":"application/json"
                },
                url:env_url + '/auth/latest/token',
                success:function(response){
                    let element = $('[data-key="' + env + '"]');
                    // alert(__('Connection Successful', 'spendino'));
                    $('.alert-success').css('display', 'block');
                    $('.alert-danger').css('display', 'none');
                    // $('.connect-check').css('display', 'inline-block');
                    if (response.success) {
                        $(element).addClass('spendino-tested-connection');
                        $(element).attr('data-token', response.data.token);
                        console.log('the connection was successful');
                        let connectionArray = {};
                        connectionArray.env_api_key = env_apikey;
                        connectionArray.env_secret = env_secret;
                        connectionArray.env_url = env_url;
                    }
                },
                error:function(){
                    let element = $('[data-key="' + env + '"]');
                    $(element).removeClass('spendino-tested-connection');
                    $(element).attr('data-token', '');
                    $('.alert-danger').css('display', 'block');
                    $('.alert-success').css('display', 'none');
                }
            });
        }

        $('#retrievebtn').on('click', function(){
            if ($('#selectEnvironment')) {
                let token = getToken($('#env_url').val());
                if (token !== '') {
                    let forms = getSpendinoData($('#selectEnvironment').val(), token, 'forms');
                    $('#formSelect').val(JSON.stringify(forms));
                    storeOption('spendino_formselect', forms);
                    updateFormControls(forms);
                }
            }
            location.reload();
        });

        function getToken(env){
            console.log(env);
            let spendino_url = $('#env_url').val();
            let spendino_apikey = $('#env_api_key').val();
            let spendino_secret = $('#env_secret').val();
            let spendino_user = spendino_apikey + ':' + spendino_secret;
            var token = '';

            $.ajax({
                type: 'GET',
                async: false,
                headers:{
                    'Authorization': 'Basic ' + btoa(spendino_user),
                    "Accept":"application/json",
                    "Content-type":"application/json"
                },
                url:spendino_url + '/auth/latest/token',
                success:function(response){
                    console.log('Form data successfully retrieved.');
                    if (response.hasOwnProperty('success') && response.success) {
                        token = response.data.token;
                    }
                    // $('.retrieve-check').css('display', 'inline-block');
                },
                error:function(){
                    console.log('unsuccessful');
                    // $('.retrieve-check').css('display', 'none');
                }
            });
            return token;
        }

        function getSpendinoData(env, token, endpoint, calldata){
            let spendino_url = $('#env_url').val();
            let spendinoData = {};
            let retVal = {};
            if (typeof calldata == 'undefined') {
                calldata = {};
            }
            if (!calldata.hasOwnProperty('linebreaks')) {
                calldata.linebreaks = false;
            }
            console.log(env, token, endpoint, spendino_url, calldata);

            $.ajax({
                type: 'GET',
                async: false,
                headers:{
                    'Authorization': 'Bearer ' + token,
                    "Accept":"application/json",
                    "Content-type":"application/json"
                },
                url:spendino_url + '/api/latest/' + endpoint,
                data: calldata,
                success:function(response){
                    spendinoData = [];
                    for (let prop in response.result) {
                        if (response.result.hasOwnProperty(prop) && prop.substr(0,3) == 'get') {
                            let retData = response.result[prop];
                            if (retData.hasOwnProperty(prop.substr(3)) && retData['code'] == '200') {
                                spendinoData = retData[prop.substr(3)];
                            }
                        }
                    }
                    $.each(spendinoData['Form'], function (inx, val) {
                        retVal[val['id']] = val['name'];
                    });
                    console.log('getSpendinoData', response, spendinoData, retVal);
                },
                error:function(response) {
                    console.log( 'getSpendinoData fails', {InputData : [env, token, endpoint, calldata], Reponse : response});
                }
            });
            return retVal;
        }

        function updateFormControls(forms){
            $('#formSelect').val(JSON.stringify(forms));
            let oldval = 0;
            oldval = $('#formId').val();
            $('#formId').empty();
            $.each(forms['Form'], function (index, form) {
                $('#formId').append('<option value="' + form['id'] + '" data-details="form_details" data-json="' + JSON.stringify(form) + '">' + form['name'] + '</option>');
            });
            $('#formId').val(oldval);
            $('#formId').trigger('click');
        }

        function storeOption(name, value) {
            console.log('storeOption Eingang', value);
            $.ajax({
                method:   'POST',
                url:    'admin-ajax.php',
                data:   {
                    action    : 'change-option',
                    option    : name, // your option variable
                    new_value : value // your new value variable
                },
                // dataType: 'json'
            }).done(function( json ) {
                console.log('storeOption Ausgang', json );
            });
        }

        $('#addEditForm').on('shown.bs.modal', function(e){
            const buttonId = e.relatedTarget.id;

            console.log('Edit Entry', __('Edit Entry', 'spendino'), __('Test Connection', 'spendino'));

            $('#toggle-edit').val(buttonId);
            if(buttonId === 'editForm'){
                $('.modal-title-edit').css('display', 'block');
                $('.modal-title-add').css('display', 'none');
            }else{
                $('.modal-title-add').css('display', 'block');
                $('.modal-title-edit').css('display', 'none');
                //clear form fields
                $('#createAddForm').trigger('reset');
            }
        })

        function getLanguage(url) {
            // if language is set via url parameter
            if (url.includes('?lang=')) {
                return url.split('?lang=')[1].split('&')[0];
            }
            // if language is set via url route
            else {
                return url.split('/')[1].split('?')[0];
            }
        }

        $('#addEditForm').on('submit', function(){
            let formTitle = $('#formTitle').val();
            let hiddenTitle = $('#hiddenFormTitle').val();
            let formId = $('#formId').val();
            let formSettings = $('#formSettings').val();
            let formLanguage = $('#formLanguage').val();
            console.log($('#formData').val());
            let formData = JSON.parse($('#formData').val());
            // console.log(formData);
            if ($('#formData').val() === '' || $('#formData').val() === 'null' || (Array.isArray(formData) && formData.length === 0)) {
                formData = {};
            }

            if($('#toggle-edit').val() === 'addForm'){
                if(formData.hasOwnProperty(formTitle) ) {
                    alert('Dieser Formularname existiert bereits. Bitte geben Sie einen anderen Namen an.');
                    return false;
                }
            }
            if($('#toggle-edit').val() === 'editForm'){
                console.log('inside edit form and here is the title',$('#hiddenFormTitle').val())
                if(hiddenTitle !== formTitle){
                    if(confirm("Are you sure you want to overwrite?")){
                        let newObj = {};

                        $.each(formData, function(item, info) {
                            if (item !== $('#hiddenFormTitle').val()) {
                                newObj[item] = info;
                            }
                        })
                        formData = newObj;
                    }
                    else{
                        return false;
                    }
                }
            }

            let newLine = {};
            console.log(formData);
            newLine.formTitle = $('#formTitle').val();
            newLine.formId = $('#formId').val();
            newLine.formSettings = $('#formSettings').val();
            newLine.formLanguage = $('#formLanguage').val();
            // newLine.formShortcode = 'spendinoForm title="' + newLine.formTitle + '"';
            newLine.formShortcode = newLine.formTitle;

            formData[formTitle] = newLine;
            $('#formData').val( JSON.stringify(formData));

            storeOption('spendino_formdata', formData);
            return true;
        });

        $('.modal').modal({
            backdrop: 'static',
            keyboard: false
        })

        $('.copy-icon').on("click", function(clickEvent){
            var copyarea = $('#copyarea');
            var text = $(this).data('shortcode');
            copyarea.val('[spendinoForm title="'+text+'"]');
            copyarea.select();
            document.execCommand('copy');
            $('.copy-badge').css('display', 'none');
            let successAlert = $(this).closest('tr').find('.copy-badge');
            $(successAlert).css('display', 'inline-block');
        });

        $('#configFormTable .edit').on("click", function(){
            let formData = JSON.parse($('#formData').val());
            // console.log(formData);
            let tableRowName = $(this).closest('tr').find('.tableFormTitle').text();
            $('#hiddenFormTitle').val(tableRowName);
            $.each(formData, function(item, info) {
                if (item === tableRowName) {
                    $('#formTitle').val(info.formTitle);
                    $('#formId').val(info.formId);
                    $('#formLanguage').val(info.formLanguage);
                    $('#formSettings').val(info.formSettings);
                }
            });
        })

        $('#configFormTable .delete').on("click", function(){
            let formData = JSON.parse($('#formData').val());
            let tableRowName = $(this).closest('tr').find('.tableFormTitle').text();
            $(this).closest('tr').remove();
            delete formData[tableRowName];
            $('#formData').val(JSON.stringify(formData));
            storeOption('spendino_formdata', formData);
            console.log('#configFormTable .delete', formData);

        });
    });
})( jQuery );