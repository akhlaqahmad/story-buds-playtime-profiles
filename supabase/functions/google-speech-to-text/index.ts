
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio, languageCode = 'en-US' } = await req.json()

    if (!audio) {
      throw new Error('Audio data is required')
    }

    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${Deno.env.get('GOOGLE_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode,
          enableAutomaticPunctuation: true,
          model: 'latest_short',
        },
        audio: {
          content: audio,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to transcribe audio')
    }

    const result = await response.json()
    const transcript = result.results?.[0]?.alternatives?.[0]?.transcript || ''

    return new Response(
      JSON.stringify({ 
        transcript,
        confidence: result.results?.[0]?.alternatives?.[0]?.confidence || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('STT Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
