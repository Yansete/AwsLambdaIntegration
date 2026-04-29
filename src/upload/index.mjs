import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client({});

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const fileBase64 = body.fileBase64;
    const fileName = body.fileName || "image.jpg";
    const contentType = body.contentType || "image/jpeg";

    if (!fileBase64) {
      return { statusCode: 400, body: JSON.stringify({ message: "fileBase64 es requerido" }) };
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const extension = fileName.split(".").pop();
    const key = `${process.env.UPLOAD_PREFIX}${crypto.randomUUID()}.${extension}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Imagen subida correctamente", key }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: "Error interno", error: error.message }) };
  }
};