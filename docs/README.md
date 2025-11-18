# Documentación del proyecto

## Descripción general

Esta aplicación web permite visualizar y guardar tarjetas de contacto ("cards") que se comparten mediante enlaces. Cada card representa la información de una persona (nombre, datos de contacto y datos laborales) y puede exportarse como un archivo de contacto estándar (`.vcf`) para importarlo en la agenda del dispositivo.

La app está construida con Next.js y utiliza componentes React con Tailwind CSS para el diseño.

---

## Flujo funcional principal

1. **Usuario recibe un enlace**

   - El enlace contiene información que identifica una card o un usuario.
   - Al abrir el enlace en el navegador, la app muestra la pantalla principal.

2. **Pantalla principal – `Mis Cards`**

   - Muestra un encabezado con el título **"Mis Cards"** y un texto indicando que la información fue compartida desde una URL.
   - Renderiza una lista de cards a través del componente `CardsList`.
   - Según los parámetros de la URL, se obtienen:
     - Los datos de una card específica, o
     - Información de perfil de un usuario.

3. **Listas de cards y almacenamiento local**

   - El componente `CardsList` mantiene internamente una lista de cards.
   - La lista se alimenta de dos fuentes:
     - La card actual recibida desde la URL.
     - El historial de cards guardadas en el almacenamiento local del navegador.
   - Si la card actual no existe aún en el almacenamiento local:
     - Se agrega al inicio de la lista.
     - Se actualiza el almacenamiento local para mantener un historial.
   - Si no se reciben cards desde la URL, se usan únicamente las cards guardadas en el dispositivo.

4. **Visualización de cada card**
   Cada card muestra:

   - **Avatar o imagen**: si no hay imagen disponible, se usa un avatar por defecto.
   - **Nombre completo**.
   - **Correo electrónico**.
   - **Teléfono**.
   - **Empresa**.
   - **Cargo**.

   Si algún campo no está disponible, se muestra el texto **"No proporcionado"** para indicar que la información falta.

5. **Descarga de contacto (vCard)**

   - Cada card incluye un botón **"Guardar vCard"**.
   - Al hacer clic en el botón:
     - Se genera un contenido de contacto en formato estándar.
     - Se crea un archivo `.vcf` con un nombre basado en el nombre de la persona.
     - El archivo se descarga en el dispositivo del usuario.
   - El usuario puede abrir ese archivo `.vcf` para importarlo en la agenda de contactos de su teléfono o computadora.

6. **Etiquetas de ejemplo**
   - Opcionalmente, una card puede mostrar una insignia/etiqueta de ejemplo con el texto **"Ejemplo"**.
   - Esta card solo sirve como demostración visual y no representa un contacto real.

---

## Estructura relevante del proyecto

A grandes rasgos, la estructura relevante para el comportamiento de la app es:

- **`app/page.tsx`**

  - Punto de entrada de la pantalla principal.
  - Lee parámetros de la URL (`searchParams`).
  - Obtiene las cards o información de usuario según los parámetros.
  - Renderiza el componente `CardsList` y define el layout principal.

- **`app/components/cards-list.tsx`**

  - Componente de cliente (`"use client"`).
  - Gestiona la lista de cards que se muestran al usuario.
  - Integra la lógica con el almacenamiento local del navegador para conservar un historial.
  - Renderiza cada card con su información de contacto.
  - Expone la acción de **"Guardar vCard"** para descargar el archivo de contacto.

- **`lib/helpers/localstorage`**

  - Abstracción para interactuar con `localStorage` del navegador.
  - Permite leer y escribir listas de cards de forma segura.

- **`public/`**
  - Contiene recursos estáticos como el avatar por defecto que se utiliza cuando una card no tiene imagen.

> Nota: Esta documentación omite intencionalmente los detalles relacionados con rutas o módulos dedicados a manejo de APIs.

---

## Experiencia de usuario

1. El usuario abre un enlace en el navegador.
2. La aplicación muestra la sección **"Mis Cards"**.
3. El usuario ve una o varias cards con información de contacto.
4. Si lo desea, el usuario hace clic en **"Guardar vCard"** para descargar el archivo de contacto.
5. El usuario importa el archivo `.vcf` en su agenda del dispositivo.
6. La card queda almacenada en el historial local del navegador para futuras visitas.

---

## Recomendaciones de uso

- **Compartir enlaces:**

  - Pensado para que cada persona comparta su card mediante links individuales.

- **Revisión de datos:**

  - Antes de importar el contacto a la agenda, verificar nombre, correo y teléfono.

- **Navegador recomendado:**
  - Usar navegadores modernos (Chrome, Edge, Safari, Firefox) para asegurar compatibilidad.

---

## Posibles extensiones futuras

Algunas ideas de evolución del proyecto (a modo de referencia):

- Filtros o búsqueda dentro del historial de cards.
- Ordenamiento de cards (por fecha de recepción, nombre, empresa, etc.).
- Personalización del estilo visual de las cards.
- Soporte para más campos de contacto (dirección, redes sociales, notas, etc.).
