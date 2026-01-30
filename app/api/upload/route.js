import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const S3_BUCKET = process.env.S3_BUCKET || "";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = /^image\/(jpeg|png|gif|webp)$/;

const s3Client = new S3Client({ region: AWS_REGION });

export async function POST(request) {
  if (!S3_BUCKET) {
    return Response.json(
      { success: false, error: "S3_BUCKET is not configured. Set it in environment." },
      { status: 503 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { success: false, error: "Invalid form data." },
      { status: 400 }
    );
  }

  const file = formData.get("image");
  if (!file || typeof file === "string") {
    return Response.json(
      { success: false, error: "No image file provided. Use form field name: image" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.test(file.type)) {
    return Response.json(
      { success: false, error: "Only JPEG, PNG, GIF, and WebP images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return Response.json(
      { success: false, error: "File too large (max 5MB)." },
      { status: 400 }
    );
  }

  const key = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
    const url = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    return Response.json({
      success: true,
      key,
      url,
      message: "Image uploaded to S3",
    });
  } catch (err) {
    console.error("S3 upload error:", err);
    return Response.json(
      {
        success: false,
        error: "Failed to upload to S3. Check IAM role and bucket permissions.",
      },
      { status: 500 }
    );
  }
}
