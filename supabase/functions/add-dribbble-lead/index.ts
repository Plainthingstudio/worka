import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key from extension
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('DRIBBBLE_EXTENSION_API_KEY');
    
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { name, email, dribbble_url, message_preview, user_id } = await req.json();

    console.log('Received lead data:', { name, email, dribbble_url, user_id });

    // Validate required fields
    if (!name || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name and user_id' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare lead data
    const leadData = {
      user_id,
      name,
      email: email || `dribbble-${name.toLowerCase().replace(/\s+/g, '-')}@pending.com`,
      phone: null,
      source: 'Dribbble',
      stage: 'Leads',
      notes: [
        dribbble_url ? `Dribbble Profile: ${dribbble_url}` : '',
        message_preview ? `Message Preview: ${message_preview}` : ''
      ].filter(Boolean).join('\n\n'),
      address: null
    };

    console.log('Inserting lead data:', leadData);

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: error.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lead created successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead: data,
        message: 'Lead added successfully!' 
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-dribbble-lead function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
