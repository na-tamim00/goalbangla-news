import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'application/octet-stream';
    const sizeBytes = file.size || buffer.length;
    const originalName = file.name || 'uploaded-media';
    const ext = path.extname(originalName) || (mimeType.includes('image') ? '.jpg' : mimeType.includes('audio') ? '.mp3' : '.mp4');
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase();
    const uniqueFilename = `${baseName}-${Date.now()}${ext}`;

    let mediaUrl = '';

    // 1. Cloudinary Integration (if credentials exist)
    const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
    const cloudinaryPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (cloudinaryCloud && (cloudinaryPreset || (cloudinaryApiKey && cloudinarySecret))) {
      try {
        const cldFormData = new FormData();
        const blob = new Blob([buffer], { type: mimeType });
        cldFormData.append('file', blob, uniqueFilename);
        if (cloudinaryPreset) {
          cldFormData.append('upload_preset', cloudinaryPreset);
        }

        const resourceType = mimeType.startsWith('video') ? 'video' : mimeType.startsWith('audio') ? 'video' : 'image';
        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloud}/${resourceType}/upload`, {
          method: 'POST',
          body: cldFormData,
        });

        if (cldRes.ok) {
          const cldData = await cldRes.json();
          mediaUrl = cldData.secure_url || cldData.url;
        }
      } catch (cldErr) {
        console.warn('Cloudinary upload error, falling back to storage:', cldErr);
      }
    }

    // 2. Local public/uploads fallback (for development & servers with disk access)
    if (!mediaUrl) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, uniqueFilename);
        fs.writeFileSync(filePath, buffer);
        mediaUrl = `/uploads/${uniqueFilename}`;
      } catch (fsErr) {
        // 3. In-memory / Data URL fallback for read-only serverless runtimes
        const base64 = buffer.toString('base64');
        mediaUrl = `data:${mimeType};base64,${base64}`;
      }
    }

    // Automatically register uploaded file in Central Media Library
    const record = await repo.addMedia({
      filename: uniqueFilename,
      url: mediaUrl,
      mimeType,
      sizeBytes,
      uploadedById: user.id,
    });

    return NextResponse.json({
      success: true,
      url: mediaUrl,
      filename: uniqueFilename,
      mimeType,
      sizeBytes,
      media: record,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload processing error' }, { status: 500 });
  }
}
