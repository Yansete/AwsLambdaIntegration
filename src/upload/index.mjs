import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client({});

const streamToBuffer = async (stream) => {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

export const handler = async (event) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    const s3Record = body.Records[0].s3;

    const bucket = s3Record.bucket.name;
    const key = decodeURIComponent(s3Record.object.key.replace(/\+/g, " "));

    const imageObject = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const imageBuffer = await streamToBuffer(imageObject.Body);

    const circleSvg = `
      <svg width="40" height="40">
        <circle cx="20" cy="20" r="20" fill="white"/>
      </svg>
    `;

    const processedImage = await sharp(imageBuffer)
      .resize(40, 40, { fit: "cover" })
      .composite([{ input: Buffer.from(circleSvg), blend: "dest-in" }])
      .png()
      .toBuffer();

    const originalName = key.split("/").pop().split(".")[0];
    const outputKey = `${process.env.PROCESSED_PREFIX}${originalName}_circular.png`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: outputKey,
        Body: processedImage,
        ContentType: "image/png",
      })
    );

    console.log(`Imagen procesada: ${outputKey}`);
  }

  return {
    batchItemFailures: [],
  };
};