data "archive_file" "upload_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../src/upload"
  output_path = "${path.module}/upload.zip"
}

data "archive_file" "crop_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../src/crop"
  output_path = "${path.module}/crop.zip"
}

resource "aws_lambda_function" "upload" {
  function_name = "${local.name}-upload"
  role          = aws_iam_role.upload_lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  memory_size   = 256
  timeout       = 30

  filename         = data.archive_file.upload_zip.output_path
  source_code_hash = data.archive_file.upload_zip.output_base64sha256

  environment {
    variables = {
      S3_BUCKET     = aws_s3_bucket.images.bucket
      UPLOAD_PREFIX = "uploads/"
    }
  }
}

resource "aws_lambda_function" "crop" {
  function_name = "${local.name}-crop"
  role          = aws_iam_role.crop_lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  memory_size   = 512
  timeout       = 60
  architectures = ["arm64"]

  filename         = data.archive_file.crop_zip.output_path
  source_code_hash = data.archive_file.crop_zip.output_base64sha256

  environment {
    variables = {
      S3_BUCKET        = aws_s3_bucket.images.bucket
      PROCESSED_PREFIX = "processed/"
    }
  }
}

resource "aws_lambda_event_source_mapping" "crop_sqs_trigger" {
  event_source_arn        = aws_sqs_queue.main_queue.arn
  function_name           = aws_lambda_function.crop.arn
  batch_size              = 5
  function_response_types = ["ReportBatchItemFailures"]
}