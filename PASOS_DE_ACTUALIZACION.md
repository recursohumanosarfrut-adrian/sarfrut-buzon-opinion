# Actualización IA — Buzón de Opinión SARFRUT

Este paquete contiene únicamente los siete archivos nuevos o modificados.

## 1. Actualizar GitHub

1. Extrae el archivo ZIP en tu computadora.
2. Abre el repositorio `sarfrut-buzon-opinion` en GitHub.
3. Selecciona **Add file > Upload files**.
4. Arrastra el contenido de la carpeta extraída a la raíz del repositorio. Conserva las rutas `app/...` y `lib/...`.
5. Confirma que GitHub muestre siete archivos y selecciona **Commit changes**.

## 2. Configurar OpenAI en Vercel

Agrega estas variables en **Settings > Environment Variables**:

- `OPENAI_API_KEY`: llave privada creada en la plataforma de OpenAI.
- `OPENAI_MODEL`: `gpt-5-mini`.

Activa **Production** y **Preview**. Nunca subas la llave a GitHub ni la compartas en capturas.

## 3. Probar

1. Espera a que Vercel indique **Ready**.
2. Entra a `/interno` con la contraseña administrativa.
3. Abre una respuesta de tipo **Denuncia**.
4. Presiona **Analizar denuncia**.

El resultado no se almacena en Supabase; permanece en la memoria de la pantalla durante la sesión.
