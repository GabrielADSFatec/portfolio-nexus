// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // resposta default
  let response = NextResponse.next({ request })

  // cria um Supabase client “server-side” para o middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // atualiza a response com os cookies novos
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // pega o usuário logado (se existir)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // rotas protegidas (qualquer coisa que comece com /admin)
  const protectedRoutes = ['/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isLoginPage = pathname === '/login'

  // não autenticado tentando acessar rota protegida
  if (isProtectedRoute && !user) {
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // autenticado tentando acessar /login
  if (isLoginPage && user) {
    const redirectTo = url.searchParams.get('redirect') || '/admin/dashboard'
    url.pathname = redirectTo
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  // segue normalmente
  return response
}

// aplica middleware em tudo exceto assets estáticos e imagens
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
