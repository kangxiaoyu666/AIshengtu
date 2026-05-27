import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ images: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const images = files
      .filter((f) => /\.(png|jpg|jpeg|gif|webp|avif)$/i.test(f))
      .map((f) => {
        const stat = fs.statSync(path.join(uploadDir, f));
        return {
          id: f.replace(/\.[^.]+$/, ''),
          url: `/uploads/${f}`,
          createdAt: stat.birthtimeMs,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ images: images.slice(0, 50) });
  } catch (error: any) {
    console.error('List images error:', error);
    return NextResponse.json({ images: [] });
  }
}
