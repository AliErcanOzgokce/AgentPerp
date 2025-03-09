import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { createAgentFromTemplate, updateCharacterConfig } from '@/app/lib/agent-generator/template';
import { generateCharacterConfig } from '@/app/lib/agent-generator/character';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { name, bio, lore } = body;

        // Validate required fields
        if (!name || !bio || !lore) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate symbol from name (first 4 letters)
        const symbol = name.slice(0, 4).toUpperCase();

        // Create agent directory from template
        console.log('Creating agent directory...');
        const agentDir = await createAgentFromTemplate(name);

        // Generate character config using OpenAI
        console.log('Generating character configuration...');
        const characterConfig = await generateCharacterConfig(name, bio, lore);

        // Update character.json file
        console.log('Updating character configuration...');
        await updateCharacterConfig(agentDir, characterConfig);

        // Deploy agent token using Hardhat task
        console.log('Deploying agent token...');
        const workspaceRoot = path.resolve(process.cwd(), '../');
        const { stdout } = await execAsync(
            `cd ${workspaceRoot}/hardhat && npx hardhat create-agent --name "${name}" --symbol ${symbol} --network monadTestnet`,
            { maxBuffer: 1024 * 1024 } // Increase buffer size to 1MB
        );

        // Parse deployment result
        const result = JSON.parse(stdout);

        return NextResponse.json({
            success: true,
            agent: {
                name,
                symbol,
                contractAddress: result.tokenAddress,
                basePrice: result.basePrice,
                characterPath: path.join(agentDir, 'characters', 'eliza.character.json'),
            },
        });
    } catch (error) {
        console.error('Error creating agent:', error);
        return NextResponse.json(
            {
                error: 'Failed to create agent',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
} 