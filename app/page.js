"use client";

import { useState } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_MB = 5;

export default function Home() {
  const [result, setResult] = useState({ text: "", isError: false });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setResult({ text: "", isError: false });
    const form = e.target;
    const fileInput = form.elements.image;
    if (!fileInput?.files?.length) {
      setResult({ text: "Please choose an image file.", isError: true });
      return;
    }
    const file = fileInput.files[0];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setResult({ text: "Only JPEG, PNG, GIF, and WebP are allowed.", isError: true });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setResult({ text: `File too large (max ${MAX_MB}MB).`, isError: true });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setResult({ text: data.error || "Upload failed.", isError: true });
        return;
      }
      setResult({ text: "Uploaded: " + data.url, isError: false });
      form.reset();
    } catch (err) {
      setResult({ text: "Network error: " + err.message, isError: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <header>
        <h1>EC2 Server</h1>
        <p>Next.js: frontend + API on one port. Images upload to S3 via IAM Role.</p>
      </header>

      <main>
        <section className="card upload-card">
          <h2>Upload image to S3</h2>
          <p className="hint">JPEG, PNG, GIF, or WebP, max {MAX_MB}MB.</p>
          <form className="uploadForm" onSubmit={handleSubmit}>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/gif,image/webp"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Uploading…" : "Upload"}
            </button>
          </form>
          {result.text && (
            <div className={`result ${result.isError ? "error" : "success"}`} role="status">
              {result.text}
            </div>
          )}
        </section>

        <section className="card apiCard">
          <h2>API</h2>
          <ul>
            <li><code>GET /api/health</code> – health check</li>
            <li><code>POST /api/upload</code> – upload image (form field: <code>image</code>)</li>
          </ul>
          <p><a href="/api/health">Check health</a></p>
        </section>
      </main>

      <footer>
        <p>Next.js on EC2 · No Nginx · S3 via IAM Role</p>
      </footer>
    </div>
  );
}
