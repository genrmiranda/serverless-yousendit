'use strict';
console.log('Loading function');

let AWS = require('aws-sdk')
let SES = new AWS.SES();

var sendername,senderemail,sendermessage,emailto,sesemailfrom,s3object;

exports.handler = (event, context, callback) => {
    
    sendername    = event.SenderName;
    senderemail   = event.SenderEmail;
    sendermessage = event.SenderMessage;
    emailto       = event.EmailTo;
    sesemailfrom  = event.SESEmailFrom;
    s3object      = event.S3Object;
    
    //sender copy
    sendEmail(senderemail);
    
    //file share sendto
    emailto.forEach(function(e) {
        sendEmail(e);
    });    

}

function sendEmail (emailto) {
    var params = {
        Destination: {
            ToAddresses: [
                emailto
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: `${sendername} (${senderemail}) shared a file with you. \n\n${sendermessage} \n\nDownload File:\n${s3object}\n*File will available for download within 48 hours.\n\n--\nServerless YouSendIt\n`,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'Serverless YouSendIt file share from: ' + sendername,
                Charset: 'UTF-8'
            }
        },
        Source: `Serverless YouSendIt <${sesemailfrom}>`
    }
    SES.sendEmail(params, function(){} );
}