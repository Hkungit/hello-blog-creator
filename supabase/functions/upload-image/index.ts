
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return new Response(
        JSON.stringify({ error: '未上传文件' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Sanitize filename to prevent path traversal attacks
    const fileName = file.name.replace(/[^\x00-\x7F]/g, '')
    const fileExt = fileName.split('.').pop()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filePath = `${timestamp}-${crypto.randomUUID()}.${fileExt}`

    // Upload the file to the images bucket
    const { data, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('上传错误:', uploadError)
      return new Response(
        JSON.stringify({ error: '文件上传失败', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        message: '图片上传成功',
        location: publicUrl // TinyMCE expects the 'location' property for image uploads
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('处理错误:', error)
    return new Response(
      JSON.stringify({ error: '发生意外错误', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
