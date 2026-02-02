import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Metodo no permitido' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Verificar autenticacion del caller
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No autorizado')
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !caller) {
            throw new Error('Token invalido')
        }

        // Verificar que el caller tiene permiso de admin (role_id = 1)
        const { data: callerProfile, error: profileCheckError } = await supabaseAdmin
            .from('profiles')
            .select('role_id')
            .eq('id', caller.id)
            .single()

        if (profileCheckError || !callerProfile || callerProfile.role_id !== 1) {
            throw new Error('No tienes permiso para crear usuarios')
        }

        // Obtener datos del request
        const { email, password, full_name, role_id } = await req.json()

        if (!email || !password) {
            throw new Error('Email y password son requeridos')
        }

        // Crear usuario en auth.users
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (userError) throw userError

        const newUser = userData.user

        // Crear perfil con email incluido
        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
            id: newUser.id,
            email,
            full_name: full_name || '',
            role_id: role_id || null,
        })

        if (profileError) {
            // Si falla el perfil, eliminar el usuario creado para mantener consistencia
            await supabaseAdmin.auth.admin.deleteUser(newUser.id)
            throw profileError
        }

        // Obtener perfil completo con rol
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('*, role:role_id(id, name, description)')
            .eq('id', newUser.id)
            .single()

        if (fetchError) throw fetchError

        return new Response(JSON.stringify({ user: newUser, profile }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Error en create-user:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
