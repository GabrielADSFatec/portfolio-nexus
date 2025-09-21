import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

// Tipos
interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// Validação simples
function validateContactData(data: any): data is ContactFormData {
  return (
    typeof data.name === 'string' && data.name.trim().length > 0 &&
    typeof data.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    typeof data.message === 'string' && data.message.trim().length >= 10
  );
}

// Configurar Nodemailer
function createTransporter() {
  return nodemailer.createTransport({ // ← Corrigido: createTransport (sem 'r')
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para outros
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validar dados
    const body = await request.json();
    
    if (!validateContactData(body)) {
      return NextResponse.json(
        { error: 'Dados inválidos. Verifique os campos e tente novamente.' },
        { status: 400 }
      );
    }

    const { name, email, message } = body;

    // 2. Salvar no Supabase
    const supabase = await createClient();
    const { data: savedMessage, error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar mensagem:', dbError);
      return NextResponse.json(
        { error: 'Erro interno. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    // 3. Enviar email (se configurado)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createTransporter();

        // Email para você (receber a mensagem)
        await transporter.sendMail({
          from: `"${name}" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
          replyTo: email,
          subject: `[Portfolio] Nova mensagem de ${name}`,
          text: message,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                Nova Mensagem do Portfolio
              </h2>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>
              
              <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h3 style="color: #334155; margin-top: 0;">Mensagem:</h3>
                <p style="line-height: 1.6; color: #475569;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; font-size: 14px; color: #1e40af;">
                💡 <strong>Dica:</strong> Você pode responder diretamente a este email para entrar em contato com ${name}.
              </div>
            </div>
          `,
        });

        // Email de confirmação para o remetente (opcional)
        await transporter.sendMail({
          from: `"Seu Nome" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Mensagem recebida - Obrigado pelo contato!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Obrigado pelo contato, ${name}! 👋</h2>
              
              <p>Recebi sua mensagem e entrarei em contato em breve.</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Sua mensagem:</strong></p>
                <p style="font-style: italic; color: #64748b;">"${message}"</p>
              </div>
              
              <p>Normalmente respondo em até 24 horas.</p>
              
              <p>Atenciosamente,<br><strong>Seu Nome</strong></p>
            </div>
          `,
        });

        console.log('✅ Email enviado com sucesso');
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError);
        // Não falhar a requisição se o email não enviar
        // A mensagem já foi salva no banco
      }
    }

    // 4. Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      id: savedMessage.id,
    });

  } catch (error) {
    console.error('Erro na API de contato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}

// Método GET para teste (opcional)
export async function GET() {
  return NextResponse.json({
    message: 'API de contato funcionando',
    timestamp: new Date().toISOString(),
  });
}