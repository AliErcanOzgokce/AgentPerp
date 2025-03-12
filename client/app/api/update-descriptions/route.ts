import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DESCRIPTIONS_FILE = path.join(process.cwd(), '/app/components/AgentCard.tsx');

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    // Read the current file content
    let content = fs.readFileSync(DESCRIPTIONS_FILE, 'utf8');

    // Find the AGENT_DESCRIPTIONS object
    const match = content.match(/export const AGENT_DESCRIPTIONS = {[^}]+}/);
    if (!match) {
      throw new Error('AGENT_DESCRIPTIONS not found in file');
    }

    // Add new description
    const newDescription = `\n  ${name}: "${description}",`;
    content = content.replace(
      /export const AGENT_DESCRIPTIONS = {/,
      `export const AGENT_DESCRIPTIONS = {${newDescription}`
    );

    // Write back to file
    fs.writeFileSync(DESCRIPTIONS_FILE, content);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating descriptions:', error);
    return NextResponse.json({ error: 'Failed to update descriptions' }, { status: 500 });
  }
} 