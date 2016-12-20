"use strict";

$(function() {

  $.getJSON( "/js/config.json", function( data ) {      
    app(data);
  });

  //begin app
  function app(config_data) {
    
    var aws_accessKeyId = config_data.accessKeyId;
    var aws_secretAccessKey = config_data.secretAccessKey;
    var aws_region = config_data.region;
    var aws_bucket = config_data.bucket;
    
    var aws_apikey = config_data.apiKey;
    var aws_apisender = config_data.apiSendFileURL;
    var aws_s3object, aws_s3object_location;
    var aws_sesemailfrom = config_data.SESEmailFrom;
    
    
    //upload trigger
    $('#uploadFormId').on('click', '#buttonUploadId', function(e) {
      $('#inputFileId').trigger('change'); 
    });
    $('#uploadFormId').on('change', '#inputFileId', function(e) {
      S3Upload( $('#inputFileId').prop('files')[0] );
    });    
    
    
    //send file trigger
    $('#uploadFormId').validator().on('submit', function (e) {
      if (e.isDefaultPrevented()) {
        
      } else {
        SendFile();
      }
      return false;
    });    
    
    //reload page
    $('#FileSentModal').on('hidden.bs.modal', function (e) {
      location.reload();
    });   
    
    
    //S3 Uploader
    function S3Upload(inputfield) {
      
      var inputFile = inputfield;
      var inputFileExt  = inputFile.name.split('.').pop();
      var generate_filename = Math.random().toString(36).slice(2);
     
      //validate file
      if (typeof inputFile.name == 'undefined') {
        return false;
      }
      
      //configure S3 keys
      AWS.config.update({accessKeyId: aws_accessKeyId, secretAccessKey: aws_secretAccessKey});
      AWS.config.region = aws_region;

      //Create S3Object  
      var bucket = new AWS.S3({params: { Bucket: aws_bucket, Prefix: '', Delimiter: '/'} });     
      var progressPercent; 
      var params = { StorageClass: 'REDUCED_REDUNDANCY', 
                     Key: 'uploads/'+generate_filename+'.'+inputFileExt,
                     ContentType: 'application/octet-stream',
                     ContentDisposition: 'attachment; filename='+inputFile.name,                     
                     Body: inputFile
                   };      
          
      //upload file on S3
      bucket.upload(params).on('httpUploadProgress', function(evt) {
        progressPercent = parseInt((evt.loaded * 100) / evt.total);
        if (progressPercent >= 1 && progressPercent <= 100) { 
          $('#fileUploadProgress').html(progressPercent+'%');
          $('#fileUploadProgress').css('width',progressPercent+'%');
        }
      }).send(function(err, data) {
        if (err) {
          console.log(err);
          $('#inputFileId').val('');
          $('#alertFileUpload').css('display','block');
        }
        else {
          aws_s3object = data.Location;
          if ($("#autosendFileId").prop('checked')) $('#uploadFormId').submit();
        } 
      }); 
      
    }
    //end S3 Uploader
    
    
    //Sendfile
    function SendFile() {
      var api_data = JSON.stringify({
                        SenderName: $('#senderNameId').val(),
                        SenderEmail: $('#senderEmailId').val(),
                        SenderMessage: $('#senderMessageId').val(),
                        SESEmailFrom: aws_sesemailfrom,
                        S3Object: aws_s3object,
                        EmailTo: $("input[name='sendToEmail\\[\\]']").map(function(){ if ( $(this).val() ) return $(this).val(); }).get()
                     });
  
      $.ajax({
          type: 'POST',
          url: aws_apisender,
          cached: false,
          data: api_data, 
          beforeSend: function( xhr ) {
            $('#sendFileId').prop( "disabled", true );
          },
          success: function(data) {         
            $('.modal-body').html('File sent and will available for download within 48 hours.');
            $('#FileSentModal').modal('show');          
          },
          error: function( e ) {
             $('.modal-body').html('Failed to send your file. Please try again.');
             $('#sendFileId').prop( "disabled", false );
          },
          contentType: 'application/json',
          dataType: 'json',       
          headers: {
            'x-api-key': aws_apikey               
          }
      });   
      
    }
    //end Sendfile
      
    
  }
  //end app

});

