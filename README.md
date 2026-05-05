# AWS + Lambda Integration

# Descripción

API que recibe imágenes, las guarda en S3 (`uploads/`) y las procesa automáticamente guardándolas en `processed/`.

---

# Despliegue

```bash
cd terraform
terraform init
terraform workspace select prod
terraform apply -var-file="dev.tfvars" #Tener configuradas las credenciales de AWS antes de ejecutar

# USO
IMG=$(base64 -i test.jpg | tr -d '\n')

curl -X POST https://<API_URL>/upload \
  -H "Content-Type: application/json" \
  -d "{
    \"fileBase64\": \"$IMG\",
    \"fileName\": \"test.jpg\",
    \"contentType\": \"image/jpeg\"
  }"
