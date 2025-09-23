import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // 🔄 REDIRECIONAMENTO CRÍTICO: /admin para /admin/dashboard
  if (user && pathname === '/admin') {
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // 🛡️ Rotas protegidas
  const protectedRoutes = ['/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // 🌐 Rotas públicas
  const publicRoutes = ['/login', '/auth', '/error', '/']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // 🔐 Usuário NÃO logado tentando acessar rota protegida
  if (!user && isProtectedRoute && !isPublicRoute) {
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ✅ Usuário logado tentando acessar login - redirecionar para dashboard
  if (user && pathname === '/login') {
    const redirectTo = url.searchParams.get('redirect') || '/admin/dashboard'
    url.pathname = redirectTo
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}