# Serverless YouSendIt

Share files securely and privately using AWS Microservices: S3, Lambda, API Gateway and SES
### [Try Demo Website](http://you-send-it.genrmiranda.com/)
### 
### Installation & Setup
#### Setup S3 bucket to host your website:
* Create bucket name as FQDN. (example you-send-it.genrmiranda.com)
* Enable Static Website Hosting on your bucket.
    Index Document : index.html
    Error Document : error.html
* Edit bucket policy.
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AddPerm",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::[YOUR-DOMAIN]/*"
    }
  ]
}
```
* Edit CORS Configuration.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>http://[YOUR-DOMAIN]</AllowedOrigin>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <ExposeHeader>ETag</ExposeHeader>
        <ExposeHeader>x-amz-meta-custom-header</ExposeHeader>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
    </CORSRule>
</CORSConfiguration>
```
* Add Lifecycle rule on the bucket to delete contents of "uploads/" folder after 2 days of each content. (Optional)

#### Setup your domain's DNS to use the new S3 Bucket
http://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html 

#### Signup and Setup AWS SES for your domain
http://docs.aws.amazon.com/ses/latest/DeveloperGuide/setting-up-email.html

#### Create IAM User Credentials and policy:
* Create an IAM Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "yousenditreferrerallow",
            "Effect": "Allow",
            "Action": [
                "s3:Get*",
                "s3:Put*"
            ],
            "Resource": "arn:aws:s3:::[YOUR-DOMAIN]/uploads/*",
            "Condition": {
                "StringLike": {
                    "aws:Referer": [
                        "http://[YOUR-DOMAIN]/*"
                    ]
                }
            }
        },
        {
            "Sid": "yousenditreferrerdeny",
            "Effect": "Deny",
            "Action": [
                "s3:*"
            ],
            "Resource": "arn:aws:s3:::[YOUR-DOMAIN]/uploads/*",
            "Condition": {
                "StringNotLike": {
                    "aws:Referer": [
                        "http://[YOUR-DOMAIN]/*"
                    ]
                }
            }
        }
    ]
}
```
* Create a new IAM User with "Programmatic Access" and attach policy created above.
* Create Access Keys on the newly created IAM user. Download/Save AccessID and SecretAccess keys

#### Setup Lambda and API Gateway
 http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html
 * Setup your lambda and API Gateway in either us-east-1, us-west-2 or eu-west-1 because SES is available in these regions.
 * Use the code in export.js for your lambda function
 
#### Signup and Setup AWS SES for your domain
http://docs.aws.amazon.com/ses/latest/DeveloperGuide/setting-up-email.html

### Configure and upload the website in your bucket 
* edit js/config.json
```json
{
  "accessKeyId": "[YOUR-ACCESS-KEY]", 
  "secretAccessKey": "[SECRET-KEY]",
  "region": "[BUCKET-REGION]",
  "bucket": "[BUCKET-NAME]",
  "apiKey": "[API-GATEWAY-KEY]",
  "apiSendFileURL": "[API-GATEWAY-URL]",
  "SESEmailFrom": "mailer@[YOUR-DOMAIN]"
}
```
* Upload the following files on your new bucket
```
index.html
error.html
└── js
    ├── config.json
    ├── app.js
    ├── aws-sdk-2.7.13.min.js   
```

* Done

### Automated setup using CloudFormation
> Coming Soon!




