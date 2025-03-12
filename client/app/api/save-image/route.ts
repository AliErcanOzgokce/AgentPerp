import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { imageUrl, name } = await req.json();

    // Convert base64 to image and save
    const base64Data = imageUrl.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create agents directory if it doesn't exist
    const agentsDir = path.join(process.cwd(), 'public', 'agents');
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
    }

    // Save the image
    const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}.jpeg`;
    fs.writeFileSync(path.join(agentsDir, fileName), buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
  }
} 