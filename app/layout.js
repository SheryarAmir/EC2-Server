import "./globals.css";

export const metadata = {
  title: "EC2 Server – Image Upload to S3",
  description: "Next.js on EC2: frontend + API on one port, S3 via IAM Role",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
