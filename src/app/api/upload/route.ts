import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 通过文件头魔数校验真实文件类型
function getMagicType(buffer: Buffer): string | null {
  const head = buffer.slice(0, 4);
  // JPEG: FF D8 FF
  if (head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF) return 'image/jpeg';
  // PNG: 89 50 4E 47
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47) return 'image/png';
  // GIF: 47 49 46
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return 'image/gif';
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46) return 'image/webp';
  // BMP: 42 4D
  if (head[0] === 0x42 && head[1] === 0x4D) return 'image/bmp';
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    // 校验文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '文件大小不能超过10MB' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: '文件为空' }, { status: 400 });
    }

    // 校验扩展名
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: `不支持的文件类型: .${ext}，仅支持 ${ALLOWED_EXTENSIONS.join('/')}` }, { status: 400 });
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 魔数校验真实文件类型
    const magicType = getMagicType(buffer);
    if (!magicType) {
      return NextResponse.json({ error: '无法识别的文件格式，请上传真实图片' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(magicType)) {
      return NextResponse.json({ error: `不支持的文件类型: ${magicType}，仅支持图片格式` }, { status: 400 });
    }

    // 如声明类型与真实类型不一致则拒绝
    if (file.type && file.type !== 'application/octet-stream' && file.type !== magicType) {
      return NextResponse.json({ error: '文件类型与扩展名不匹配' }, { status: 400 });
    }

    const filename = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      url,
      name: file.name,
      size: file.size,
      type: magicType,
      width: 0,  // 实际宽高可用 sharp 库获取
      height: 0,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || '上传失败' },
      { status: 500 }
    );
  }
}
