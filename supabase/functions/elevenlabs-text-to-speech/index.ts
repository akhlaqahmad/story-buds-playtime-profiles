
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function uint8ToBase64(bytes: Uint8Array) {
  // Process buffer in chunks for large arrays
  let base64 = "";
  const chunkSize = 0x8000; // 32KB per chunk
  for (let i = 0; i < bytes.length; i += chunkSize) {
    base64 += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunkSize) as unknown as number[]
    );
  }
  return btoa(base64);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const { text, voice_id = 'XB0fDUnXU5powFXDhCwa', model_id = 'eleven_turbo_v2_5' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('🎵 Starting ElevenLabs TTS generation...');
    console.log('Voice ID:', voice_id);
    console.log('Model ID:', model_id);
    console.log('Text length:', text.length);

    const startTime = Date.now();

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio data as array buffer
    const audioBuffer = await response.arrayBuffer();

    // Convert to base64 in chunks
    const audioBytes = new Uint8Array(audioBuffer);
    const base64Audio = uint8ToBase64(audioBytes);

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ ElevenLabs TTS generated successfully in ${duration}ms, audio size: ${audioBuffer.byteLength} bytes`);

    return new Response(JSON.stringify({ audioContent: base64Audio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error in elevenlabs-text-to-speech function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
