export async function GET() {
  return Response.json({
    status: "OK",
    message: "Server is running",
    s3Configured: !!process.env.S3_BUCKET,
  });
}
