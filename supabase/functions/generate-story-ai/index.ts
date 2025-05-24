
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

    console.log('Generating story with Hugging Face for prompt:', prompt.substring(0, 100) + '...');

    // Try a more reliable model that's known to work well
    const modelEndpoint = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (huggingFaceApiKey) {
      headers['Authorization'] = `Bearer ${huggingFaceApiKey}`;
    }

    // Format the prompt for story generation
    const storyPrompt = `Create a children's story: ${prompt}`;

    const response = await fetch(modelEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: storyPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.8,
          do_sample: true,
          return_full_text: false
        },
        options: {
          wait_for_model: true
        }
      }),
    });

    console.log('Hugging Face API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      
      if (response.status === 503) {
        // Model is loading, try a different approach with a text generation model
        const fallbackResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            inputs: `Once upon a time, ${prompt.substring(0, 100)}`,
            parameters: {
              max_new_tokens: 300,
              temperature: 0.9,
              do_sample: true,
              return_full_text: true
            },
            options: {
              wait_for_model: true
            }
          }),
        });

        if (!fallbackResponse.ok) {
          throw new Error('Both primary and fallback models are unavailable. Please try again in a few minutes.');
        }

        const fallbackData = await fallbackResponse.json();
        let generatedText = '';
        
        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          generatedText = fallbackData[0].generated_text || '';
        } else if (fallbackData.generated_text) {
          generatedText = fallbackData.generated_text;
        }

        if (!generatedText || generatedText.trim().length < 50) {
          throw new Error('Generated story is too short. Please try again.');
        }

        console.log('Generated story successfully with fallback model, length:', generatedText.length);

        return new Response(JSON.stringify({ generatedText }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Hugging Face API error: ${errorText || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Hugging Face API response:', JSON.stringify(data).substring(0, 200));
    
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
