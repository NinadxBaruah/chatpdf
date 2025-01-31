import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createWriteStream } from "fs";
import fs from 'fs/promises';
import { join } from "path";
import { pipeline } from "stream/promises"; 

const s3Client = new S3Client({
    region: "us-west-1",
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!
    }
});

export async function downloadFromS3(file_key: string): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key
        });

        const { Body } = await s3Client.send(command);
        if (!Body) throw new Error('Empty file content');

        const tempDir = join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        const file_name = join(tempDir, `pdf-${Date.now()}.pdf`);
        
        
        const writeStream = createWriteStream(file_name); 
        
        await pipeline(
            Body as NodeJS.ReadableStream,
            writeStream
        );

        return file_name;
    } catch (error) {
        console.error('S3 Download Error:', error);
        throw error; 
    }
}