
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

    console.log('Generating story with OpenAI for prompt:', prompt.substring(0, 100) + '...');

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
            content: `You are a creative children's story writer who creates engaging, age-appropriate stories. 

IMPORTANT STORY STRUCTURE REQUIREMENTS:
- Create stories that are 400-600 words long for a 5-7 minute reading experience
- Follow a clear 3-act structure:
  * BEGINNING (25%): Introduce characters, setting, and initial situation
  * MIDDLE (50%): Develop the main conflict or adventure with rising action
  * END (25%): Resolve the conflict with a satisfying conclusion and lesson

CONTENT REQUIREMENTS:
- Use age-appropriate language and vocabulary
- Include dialogue to make it engaging
- Create vivid descriptions that spark imagination
- End with a positive, educational message
- Make each story unique and original
- Keep content wholesome and appropriate for young children

FORMATTING:
- Write in clear, flowing paragraphs
- Use simple but descriptive language
- Include emotional moments and character growth
- Make it feel complete and satisfying` 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Generated story successfully, length:', generatedText.length);

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
