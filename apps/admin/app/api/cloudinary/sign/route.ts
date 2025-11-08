import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = (body?.folder as string) || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER || 'products';
    const tags = Array.isArray(body?.tags) ? body.tags.join(',') : (body?.tags || 'product');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'MISSING_CLOUDINARY_ENV' }, { status: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&tags=${tags}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');

    return NextResponse.json({
      cloudName,
      apiKey,
      signature,
      timestamp,
      folder,
      tags,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    });
  } catch (e) {
    return NextResponse.json({ error: 'SIGN_FAILED' }, { status: 500 });
  }
}
