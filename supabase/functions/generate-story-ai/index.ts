
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY');

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

    console.log('Generating story with Hugging Face Mistral-7B for prompt:', prompt.substring(0, 100) + '...');

    // Format prompt for Mistral-7B
    const mistralPrompt = `<s>[INST] You are a creative children's story writer who creates engaging, age-appropriate stories. Always follow the format requested and keep stories positive and educational. Create unique, original stories each time - never repeat the same story. Be creative and imaginative while keeping content appropriate for young children.

${prompt} [/INST]`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if available (optional for free tier)
    if (huggingFaceApiKey) {
      headers['Authorization'] = `Bearer ${huggingFaceApiKey}`;
    }

    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: mistralPrompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.9,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Hugging Face API error:', errorData);
      
      if (response.status === 503) {
        throw new Error('Hugging Face model is currently loading. Please try again in a few moments.');
      }
      
      throw new Error(`Hugging Face API error: ${errorData || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let generatedText = '';
    if (Array.isArray(data) && data.length > 0) {
      generatedText = data[0].generated_text || '';
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else {
      throw new Error('Unexpected response format from Hugging Face API');
    }

    if (!generatedText || generatedText.trim().length < 50) {
      throw new Error('Generated story is too short or empty. Please try again.');
    }

    console.log('Generated story successfully with Mistral-7B, length:', generatedText.length);

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
