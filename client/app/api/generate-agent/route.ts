import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function generateImagePrompt(agentData: { name: string; bio: string[]; lore: string[] }) {
  // Combine all text to analyze the agent's characteristics
  const allText = [
    agentData.name,
    ...agentData.bio,
    ...agentData.lore
  ].join(' ').toLowerCase();

  // Determine if the agent is more organic/creature-like or technological
  const isOrganic = allText.match(/animal|creature|plant|organic|pepper|fruit|vegetable|beast|monster|dragon|spirit|ghost/i);
  const isTechnological = allText.match(/robot|ai|digital|cyber|tech|machine|computer|system|program|algorithm/i);
  
  // Determine the agent's personality traits
  const isAggressive = allText.match(/angry|aggressive|fierce|warrior|fighter|powerful|strong|bold/i);
  const isStrategic = allText.match(/strategic|smart|intelligent|wise|careful|calculated|analytical/i);
  const isMystical = allText.match(/mystic|magical|mysterious|ancient|spiritual|divine|supernatural/i);

  // Build the base prompt
  let prompt = `Create a high-quality portrait`;

  // Add character type
  if (isOrganic) {
    prompt += ` of ${isAggressive ? 'a fierce and powerful' : 'a distinctive'} ${agentData.name}`;
    if (allText.includes('pepper')) {
      prompt += `, depicted as an anthropomorphic pepper character with personality and attitude`;
    } else if (allText.match(/animal|creature|beast/i)) {
      prompt += `, depicted as a characterized creature with trading-related elements`;
    }
  } else if (isTechnological) {
    prompt += ` of ${agentData.name}, a sophisticated ${isStrategic ? 'and intelligent ' : ''}AI trading entity`;
  } else {
    prompt += ` of ${agentData.name}, a unique trading agent`;
  }

  // Add personality and style elements
  if (isAggressive) {
    prompt += `, with a bold and powerful presence`;
  }
  if (isStrategic) {
    prompt += `, emanating wisdom and calculated precision`;
  }
  if (isMystical) {
    prompt += `, surrounded by mystical and ethereal elements`;
  }

  // Add trading context and style
  prompt += `. The image should incorporate subtle trading-related symbols and ${
    isOrganic ? 'organic' : 'professional'
  } elements. Style: ${
    isMystical ? 'Mystical and ethereal' :
    isAggressive ? 'Bold and dynamic' :
    'Professional and sophisticated'
  }. Background: ${
    isOrganic ? 'Natural and organic setting with subtle market elements' :
    isTechnological ? 'High-tech trading environment' :
    'Abstract, market-inspired patterns'
  }. Color scheme: ${
    isAggressive ? 'Bold and vibrant' :
    isMystical ? 'Deep and mystical' :
    'Rich, professional tones'
  }.`;

  return prompt;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Generate agent details using GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a creative AI that generates trading agent profiles. Generate a name, bio points, and lore points based on the user's prompt. 
          Return ONLY a JSON object with this exact structure:
          {
            "name": "Agent Name",
            "bio": ["Bio point 1", "Bio point 2", "Bio point 3"],
            "lore": ["Lore point 1", "Lore point 2", "Lore point 3"]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    if (!completion.choices[0].message.content) {
      throw new Error('No content in response');
    }

    const agentData = JSON.parse(completion.choices[0].message.content);

    // Validate the response structure
    if (!agentData.name || !Array.isArray(agentData.bio) || !Array.isArray(agentData.lore)) {
      throw new Error('Invalid response format');
    }

    // Generate dynamic image prompt based on agent characteristics
    const imagePrompt = generateImagePrompt(agentData);

    // Generate image using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    // Add the generated image URL to the response
    return NextResponse.json({
      ...agentData,
      image: imageResponse.data[0].url
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate agent',
        name: '',
        bio: [],
        lore: [],
        image: null
      },
      { status: 500 }
    );
  }
} 