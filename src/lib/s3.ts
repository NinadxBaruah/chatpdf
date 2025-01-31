import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  const s3Client = new S3Client({
    region: "us-west-1",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
    },
  });

  const file_key = `uploads/${Date.now()}-${file.name.replace(/ /g, "-")}`;
  
  // Convert ArrayBuffer to Uint8Array
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const params: PutObjectCommandInput = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: file_key,
    Body: uint8Array,
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return { file_key, file_name: file.name };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
}

export function getS3Url(file_key: string) {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-west-1.amazonaws.com/${file_key}`;
}