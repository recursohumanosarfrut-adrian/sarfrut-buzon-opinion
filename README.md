# Buzón de Opinión SARFRUT

Aplicación web con dos accesos:

- `/` — formulario público anónimo para sugerencias, reconocimientos y denuncias.
- `/interno` — panel protegido con KPIs, filtros, gráficas mensuales, consulta de mensajes y análisis asistido de denuncias.

La aplicación no solicita nombre, correo ni número de empleado. La tabla sólo almacena `type`, `message` y `created_at`.

## 1. Crear la tabla en Supabase

1. Abre tu proyecto de Supabase.
2. Entra a **SQL Editor**.
3. Copia y ejecuta el contenido de `supabase.sql`.
4. En **Project Settings > API**, copia:
   - Project URL.
   - `service_role` secret key. No uses la `publishable key` para `SUPABASE_SECRET_KEY`.

RLS queda activo y sin políticas públicas. La llave secreta sólo se utiliza en las rutas del servidor.

## 2. Variables de entorno

Crea estas variables en Vercel:

| Variable | Uso |
| --- | --- |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SECRET_KEY` | Llave `service_role`; nunca debe exponerse al navegador |
| `ADMIN_PASSWORD` | Contraseña para entrar a `/interno` |
| `SESSION_SECRET` | Cadena aleatoria de 32 caracteres o más para firmar la sesión |
| `OPENAI_API_KEY` | Llave privada de la API de OpenAI para analizar denuncias |
| `OPENAI_MODEL` | Modelo utilizado; si se omite, se usa `gpt-5-mini` |

Usa `.env.example` como referencia. No subas un archivo `.env` real a GitHub.

## 3. Subir a GitHub y desplegar en Vercel

1. Crea un repositorio vacío en GitHub.
2. Sube todos los archivos de esta carpeta.
3. En Vercel elige **Add New > Project** e importa el repositorio.
4. Agrega las variables en **Settings > Environment Variables**.
5. Despliega. Después de cambiar variables, realiza un nuevo deployment.

## Seguridad y privacidad

- La clave de Supabase sólo vive del lado del servidor.
- El panel usa cookie `HttpOnly`, `Secure`, `SameSite=Strict` con duración de 8 horas.
- La aplicación no crea perfiles de empleados ni almacena campos de identidad.
- El formulario valida el tipo y limita el mensaje a 2,000 caracteres.
- Para proteger la confianza del canal, restringe el acceso al panel únicamente a RRHH o Dirección.
- El análisis con IA sólo puede solicitarse con una sesión administrativa válida.
- La solicitud usa `store: false` y el resultado no se guarda en Supabase; permanece únicamente en la memoria de la pantalla mientras el administrador utiliza el panel.
- La IA ofrece orientación preliminar: no verifica hechos, no determina culpabilidad y no sustituye la investigación interna ni la asesoría legal.

## Análisis de denuncias con IA

1. Crea una llave privada en la plataforma de OpenAI.
2. Agrégala en Vercel como `OPENAI_API_KEY` para **Production** y **Preview**.
3. Genera un deployment nuevo.
4. Entra a `/interno`, abre una denuncia y selecciona **Analizar denuncia**.

La respuesta incluye prioridad, suficiencia de la información, riesgos, acciones recomendadas, preguntas de investigación, áreas sugeridas y plazo de atención. El texto de la denuncia sólo se envía cuando el administrador presiona el botón.

## Modo demostración

Si faltan variables, el formulario avisa que no puede guardar y el panel muestra datos ficticios identificados como demostrativos. Al configurar Supabase y la contraseña, el panel cambia automáticamente a los datos reales.
