# AWS + Lambda Integration

## 📌 Descripción

Este proyecto implementa una arquitectura serverless en AWS que permite subir imágenes mediante una API y procesarlas automáticamente.

El flujo principal consiste en:

1. Un cliente envía una imagen en base64 a un endpoint HTTP.
2. La imagen se almacena en Amazon S3 (`uploads/`).
3. S3 envía un evento a Amazon SQS.
4. Una función Lambda procesa la imagen (resize).
5. La imagen procesada se guarda en `processed/`.

---

## Arquitectura

Componentes principales:

- **API Gateway (HTTP API)** → expone endpoint `/upload`
- **Lambda (upload)** → recibe imagen y la guarda en S3
- **Amazon S3** → almacenamiento de imágenes
- **Amazon SQS** → cola de procesamiento
- **Lambda (crop)** → procesa la imagen con `sharp`
- **Dead Letter Queue (DLQ)** → manejo de errores
- **CloudWatch Logs** → monitoreo
- **Terraform** → infraestructura como código



## Flujo del sistema y Estructura

```text
Cliente → API Gateway → Lambda Upload → S3 (uploads/)
                                      ↓
                                     SQS
                                      ↓
                              Lambda Crop
                                      ↓
                              S3 (processed/)



AwsLambdaIntegration/
│
├── src/
│   ├── upload/        # Lambda upload
│   └── crop/          # Lambda procesamiento
│
├── terraform/
│   ├── main.tf
│   ├── lambda.tf
│   ├── s3_sqs.tf
│   ├── iam.tf
│   ├── variables.tf
│   └── *.tfvars
│
└── README.md

## Despligue

cd terraform
terraform init
terraform workspace select prod
AWS_PROFILE=yldev terraform apply -var-file="dev.tfvars"