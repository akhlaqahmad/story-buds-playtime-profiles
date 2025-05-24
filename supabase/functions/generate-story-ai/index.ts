
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();
    console.log('Starting story generation with OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a creative children's story writer. Create engaging, age-appropriate stories that are 200-300 words long for quick reading.

STORY REQUIREMENTS:
- Write stories that are 200-300 words (2-3 minute reading time)
- Use simple, clear language appropriate for young children
- Include dialogue and vivid descriptions
- Create a clear beginning, middle, and end
- End with a positive message
- Make it complete and satisfying

FORMATTING:
- Write in flowing paragraphs
- Keep language simple but engaging
- Include character emotions and growth` 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Story generated successfully in ${duration}ms, length: ${generatedText.length} characters`);

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-story-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
