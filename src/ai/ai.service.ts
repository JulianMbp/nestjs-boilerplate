import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const apiKey = this.configService.get('openai.apiKey', { infer: true });

    if (!apiKey) {
      this.logger.warn(
        'OpenAI API Key not found. AI features will be disabled.',
      );
      return;
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generarInformeBitacora(payload: {
    obra: string;
    ubicacion: string;
    fecha: string;
    clima?: string;
    actividades: string[];
    materiales?: Array<{ nombre: string; cantidad: string }>;
    incidencias?: string[];
    avanceGeneral: number;
    observaciones?: string;
    tareasRecientes?: Array<{
      titulo: string;
      estado: string;
      avance?: number;
    }>;
    ultimasBitacoras?: Array<{ fecha: Date; avance: number }>;
    usuarioGenerador: {
      nombre: string;
      cargo: string;
      email: string;
    };
  }): Promise<{ html: string; tokensUsados?: number }> {
    if (!this.client) {
      throw new Error(
        'OpenAI client not initialized. Please check your API key.',
      );
    }

    const model =
      this.configService.get('openai.model', { infer: true }) || 'gpt-4o-mini';
    // Aumentamos maxTokens para informes narrativos más largos
    const maxTokens =
      this.configService.get('openai.maxTokens', { infer: true }) || 3000;
    const temperature =
      this.configService.get('openai.temperature', { infer: true }) || 0.7;

    const systemPrompt = `Eres un ingeniero residente experto que redacta bitácoras de obra formales y profesionales en español.
Tu tarea es generar un informe HTML completo, narrativo y bien estructurado basado en la información proporcionada.

IMPORTANTE: Debes devolver SOLO el HTML del cuerpo del informe (sin <html>, <head>, <body>). 
El HTML debe ser limpio, profesional, narrativo (como si un humano lo hubiera escrito) y listo para ser insertado en un documento.

El informe debe incluir:
1. Encabezado destacado con título "BITÁCORA DE OBRA", nombre de la obra, ubicación completa (ciudad, dirección) y fecha
2. Resumen ejecutivo narrativo y detallado (escrito como si un ingeniero lo hubiera redactado personalmente)
3. Actividades realizadas con descripciones narrativas y detalladas (no solo listas, sino párrafos explicativos)
4. Materiales utilizados en una tabla bien diseñada (si se proporcionan)
5. Incidencias o riesgos con contexto y explicación (sección destacada si existen)
6. Porcentaje de avance con barra de progreso visual y texto narrativo explicando el progreso
7. Observaciones y próximos pasos escritos de forma narrativa y profesional
8. Contexto de la obra (tareas recientes, bitácoras anteriores si se proporcionan)
9. Firma del usuario generador al final con su nombre, cargo y fecha

ESTILO NARRATIVO:
- Escribe como si un ingeniero profesional estuviera redactando personalmente el informe
- Usa frases como "Durante la jornada se realizó...", "Se observó que...", "El equipo de trabajo..."
- Combina listas con párrafos narrativos para hacer el informe más humano y legible
- Mantén el tono formal pero accesible, técnico pero comprensible

REQUISITOS DE ESTILO HTML:
- Usa estilos inline para formato profesional y diferenciación visual
- Colores sugeridos:
  * Azul oscuro (#1e40af o #0f172a) para títulos principales
  * Azul medio (#3b82f6) para subtítulos
  * Verde (#10b981) para avances y aspectos positivos
  * Naranja/Amber (#f59e0b) para incidencias/riesgos
  * Gris oscuro (#374151 o #1f2937) para texto principal
  * Gris claro (#f3f4f6 o #e5e7eb) para fondos
  * Rojo suave (#ef4444) para alertas importantes
- Fuentes: Arial, sans-serif o 'Segoe UI'
- Estructura: Usa <div>, <h1>, <h2>, <h3>, <p>, <ul>, <li>, <table>, <strong>, <em>
- Añade estilos inline como: style="margin: 15px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #3b82f6;"
- Para la barra de progreso: usa un <div> con fondo gris y otro interno con ancho basado en el porcentaje y color verde
- Usa bordes, sombras sutiles y espaciado adecuado para mejorar la legibilidad
- Las secciones deben estar visualmente diferenciadas con fondos, bordes o espaciado

El tono debe ser formal, técnico y profesional, pero escrito de forma narrativa como si un humano experto lo hubiera redactado personalmente.`;

    const userPrompt = `Genera un informe HTML de bitácora de obra NARRATIVO y PROFESIONAL con la siguiente información:

**Obra:** ${payload.obra}
**Ubicación:** ${payload.ubicacion}
**Fecha:** ${payload.fecha}
${payload.clima ? `**Clima:** ${payload.clima}` : ''}

**Actividades realizadas:**
${payload.actividades.map((act, idx) => `${idx + 1}. ${act}`).join('\n')}

${
  payload.materiales && payload.materiales.length > 0
    ? `**Materiales utilizados:**\n${payload.materiales.map((mat) => `- ${mat.nombre}: ${mat.cantidad}`).join('\n')}`
    : ''
}

${
  payload.incidencias && payload.incidencias.length > 0
    ? `**Incidencias/Riesgos:**\n${payload.incidencias.map((inc, idx) => `${idx + 1}. ${inc}`).join('\n')}`
    : ''
}

**Avance general:** ${payload.avanceGeneral}%

${payload.observaciones ? `**Observaciones adicionales:**\n${payload.observaciones}` : ''}

${
  payload.tareasRecientes && payload.tareasRecientes.length > 0
    ? `**Tareas recientes de la obra:**\n${payload.tareasRecientes.map((t) => `- ${t.titulo} (${t.estado})${t.avance ? ` - Avance: ${t.avance}%` : ''}`).join('\n')}`
    : ''
}

${
  payload.ultimasBitacoras && payload.ultimasBitacoras.length > 0
    ? `**Contexto de bitácoras anteriores:**\n${payload.ultimasBitacoras.map((b, idx) => `- ${idx + 1}. Fecha: ${b.fecha}, Avance: ${b.avance}%`).join('\n')}`
    : ''
}

**Usuario que genera el informe:**
- Nombre: ${payload.usuarioGenerador.nombre}
- Cargo: ${payload.usuarioGenerador.cargo}
- Email: ${payload.usuarioGenerador.email}

INSTRUCCIONES ESPECIALES:
1. Escribe el informe de forma NARRATIVA, como si un ingeniero lo hubiera redactado personalmente
2. Combina listas con párrafos explicativos para cada sección
3. Usa un diseño moderno con colores diferenciados para cada tipo de información
4. Incluye la barra de progreso visual pero también texto narrativo explicando el avance
5. Al final del informe, agrega una sección de FIRMA con:
   - Nombre completo: ${payload.usuarioGenerador.nombre}
   - Cargo: ${payload.usuarioGenerador.cargo}
   - Fecha de generación: ${payload.fecha}
   - Espacio para firma física (línea o área)
6. La ubicación debe aparecer claramente en el encabezado (ciudad, dirección completa)

IMPORTANTE: Devuelve SOLO el HTML del cuerpo del informe (sin etiquetas <html>, <head>, <body>). 
Usa estilos inline para formato profesional. El HTML debe ser completo, narrativo y listo para insertar en un documento.`;

    try {
      this.logger.log(
        `Generando informe de bitácora para obra: ${payload.obra}`,
      );

      const completion = await this.client.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const html = completion.choices[0]?.message?.content || '';
      const tokensUsados = completion.usage?.total_tokens;

      if (!html) {
        throw new Error('No se recibió respuesta de OpenAI');
      }

      this.logger.log(
        `Informe HTML generado exitosamente. Tokens usados: ${tokensUsados}`,
      );

      return {
        html,
        tokensUsados,
      };
    } catch (error) {
      this.logger.error(
        `Error al generar informe de bitácora: ${error.message}`,
        error.stack,
      );

      // Verificar si es un error de la API de OpenAI
      if (error && typeof error === 'object') {
        // Manejar errores de OpenAI SDK
        if ('status' in error) {
          const apiError = error as { status?: number; message?: string };
          if (apiError.status === 429) {
            // Error 429 puede ser por rate limit o por cuota agotada
            const errorMessage = apiError.message || '';
            if (
              errorMessage.includes('quota') ||
              errorMessage.includes('billing')
            ) {
              throw new Error(
                'Cuota de OpenAI agotada. Por favor, revisa tu plan y facturación en https://platform.openai.com/account/billing',
              );
            }
            throw new Error(
              'Límite de solicitudes excedido. Por favor, intenta más tarde.',
            );
          }
          if (apiError.status === 503) {
            throw new Error('Servicio de OpenAI no disponible temporalmente.');
          }
          throw new Error(
            `Error de API de OpenAI: ${apiError.message || 'Error desconocido'}`,
          );
        }

        // Manejar errores específicos de OpenAI (APIError)
        if ('message' in error && 'code' in error) {
          const openAIError = error as { message?: string; code?: string };
          if (
            openAIError.message?.includes('quota') ||
            openAIError.message?.includes('billing')
          ) {
            throw new Error(
              'Cuota de OpenAI agotada. Por favor, revisa tu plan y facturación en https://platform.openai.com/account/billing',
            );
          }
        }
      }

      throw error;
    }
  }

  async responderPreguntaObra(payload: {
    pregunta: string;
    informacionObra: {
      nombre: string;
      ubicacion?: string;
      materiales: Array<{
        nombre: string;
        cantidad?: number;
        unidad?: string;
        categoria?: string;
      }>;
      tareas: Array<{ titulo: string; estado: string; avance?: number }>;
      bitacoras: Array<{ fecha: Date; avance: number; descripcion?: string }>;
      asistencias?: Array<{ fecha: Date; estado: string }>;
      ultimoAvance?: number;
    };
  }): Promise<{ respuesta: string; tokensUsados?: number }> {
    if (!this.client) {
      throw new Error(
        'OpenAI client not initialized. Please check your API key.',
      );
    }

    const model =
      this.configService.get('openai.model', { infer: true }) || 'gpt-4o-mini';
    const maxTokens =
      this.configService.get('openai.maxTokens', { infer: true }) || 1500;
    const temperature =
      this.configService.get('openai.temperature', { infer: true }) || 0.7;

    const systemPrompt = `Eres un ingeniero residente experto que ha trabajado en esta obra durante mucho tiempo. 
Conoces todos los detalles, materiales, tareas, avances y situaciones de la obra.

Tu tarea es responder preguntas sobre la obra de manera:
- Directa y clara
- Conversacional y amigable
- Como si fueras alguien que conoce la obra íntimamente
- Con información precisa basada en los datos proporcionados
- Si no tienes información sobre algo, dilo honestamente: "No tengo información sobre eso" o "Aún no hay datos registrados sobre ese tema"
- Usa lenguaje técnico pero comprensible
- Responde en español

IMPORTANTE:
- Solo responde con la información que tienes disponible
- Si la pregunta es sobre algo que no está en los datos, dilo claramente
- Mantén un tono profesional pero cercano
- Responde de forma concisa pero completa`;

    // Construir contexto de la obra
    const contextoObra = `**Información de la Obra:**

**Nombre:** ${payload.informacionObra.nombre}
${payload.informacionObra.ubicacion ? `**Ubicación:** ${payload.informacionObra.ubicacion}` : ''}

**Materiales (${payload.informacionObra.materiales.length} en total):**
${
  payload.informacionObra.materiales.length > 0
    ? payload.informacionObra.materiales
        .map((mat) => {
          const cantidad = mat.cantidad
            ? `${mat.cantidad} ${mat.unidad || ''}`.trim()
            : 'Cantidad no especificada';
          const categoria = mat.categoria ? ` (${mat.categoria})` : '';
          return `- ${mat.nombre}${categoria}: ${cantidad}`;
        })
        .join('\n')
    : 'No hay materiales registrados'
}

**Tareas (${payload.informacionObra.tareas.length} en total):**
${
  payload.informacionObra.tareas.length > 0
    ? payload.informacionObra.tareas
        .map((t) => {
          const avance = t.avance ? ` - Avance: ${t.avance}%` : '';
          return `- ${t.titulo} (${t.estado})${avance}`;
        })
        .join('\n')
    : 'No hay tareas registradas'
}

**Bitácoras (${payload.informacionObra.bitacoras.length} registradas):**
${
  payload.informacionObra.bitacoras.length > 0
    ? payload.informacionObra.bitacoras
        .map((b, idx) => {
          const fecha = new Date(b.fecha).toLocaleDateString('es-ES');
          const desc = b.descripcion
            ? ` - ${b.descripcion.substring(0, 100)}...`
            : '';
          return `${idx + 1}. Fecha: ${fecha}, Avance: ${b.avance}%${desc}`;
        })
        .join('\n')
    : 'No hay bitácoras registradas'
}

${payload.informacionObra.ultimoAvance ? `**Avance General:** ${payload.informacionObra.ultimoAvance}%` : ''}`;

    const userPrompt = `${contextoObra}

**Pregunta del usuario:**
${payload.pregunta}

Responde la pregunta de manera directa, clara y conversacional. Si no tienes la información solicitada, dilo honestamente.`;

    try {
      this.logger.log(
        `Respondiendo pregunta sobre obra: ${payload.informacionObra.nombre}`,
      );

      const completion = await this.client.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const respuesta = completion.choices[0]?.message?.content || '';
      const tokensUsados = completion.usage?.total_tokens;

      if (!respuesta) {
        throw new Error('No se recibió respuesta de OpenAI');
      }

      this.logger.log(
        `Respuesta generada exitosamente. Tokens usados: ${tokensUsados}`,
      );

      return {
        respuesta,
        tokensUsados,
      };
    } catch (error) {
      this.logger.error(
        `Error al responder pregunta sobre obra: ${error.message}`,
        error.stack,
      );

      // Verificar si es un error de la API de OpenAI
      if (error && typeof error === 'object') {
        // Manejar errores de OpenAI SDK
        if ('status' in error) {
          const apiError = error as { status?: number; message?: string };
          if (apiError.status === 429) {
            // Error 429 puede ser por rate limit o por cuota agotada
            const errorMessage = apiError.message || '';
            if (
              errorMessage.includes('quota') ||
              errorMessage.includes('billing')
            ) {
              throw new Error(
                'Cuota de OpenAI agotada. Por favor, revisa tu plan y facturación en https://platform.openai.com/account/billing',
              );
            }
            throw new Error(
              'Límite de solicitudes excedido. Por favor, intenta más tarde.',
            );
          }
          if (apiError.status === 503) {
            throw new Error('Servicio de OpenAI no disponible temporalmente.');
          }
          throw new Error(
            `Error de API de OpenAI: ${apiError.message || 'Error desconocido'}`,
          );
        }

        // Manejar errores específicos de OpenAI (APIError)
        if ('message' in error && 'code' in error) {
          const openAIError = error as { message?: string; code?: string };
          if (
            openAIError.message?.includes('quota') ||
            openAIError.message?.includes('billing')
          ) {
            throw new Error(
              'Cuota de OpenAI agotada. Por favor, revisa tu plan y facturación en https://platform.openai.com/account/billing',
            );
          }
        }
      }

      throw error;
    }
  }
}
