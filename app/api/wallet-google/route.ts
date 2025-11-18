// app/api/wallet/create-contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface ContactData {
  id?: string;
  nombre: string;
  telefono: string;
  correo: string;
  empresa?: string;
  puesto?: string;
  sitioWeb?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validar variables de entorno
    const requiredEnvVars = {
      GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Variables de entorno faltantes: ${missingVars.join(", ")}`,
        },
        { status: 500 }
      );
    }

    // Obtener datos del body
    const body: ContactData = await request.json();

    // Validar datos requeridos
    if (!body.nombre || !body.telefono || !body.correo) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos requeridos: nombre, telefono, correo",
        },
        { status: 400 }
      );
    }

    // Configurar credenciales
    const credentials = {
      project_id: process.env.GOOGLE_PROJECT_ID!,
      client_email: process.env.GOOGLE_CLIENT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    };

    // Configurar orígenes permitidos
    const originsEnv =
      process.env.GOOGLE_WALLET_ALLOWED_ORIGINS ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";

    const origins = originsEnv
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    // Generar ID único para el objeto
    const objectId = body.id || `contacto_${Date.now()}`;
    const classId = `${credentials.project_id}.contacto_general_class`;


    // Preparar módulos de texto dinámicamente
    const textModulesData = [
      { header: "Teléfono", body: body.telefono },
      { header: "Correo", body: body.correo },
    ];

    if (body.puesto) {
      textModulesData.push({ header: "Puesto", body: body.puesto });
    }

    // Preparar enlaces opcionales
    const linksModuleData = body.sitioWeb
      ? {
          uris: [
            {
              uri: body.sitioWeb,
              description: "Visitar sitio web",
            },
          ],
        }
      : undefined;

    // Crear objeto de tarjeta
    const genericObject = {
      id: `${credentials.project_id}.${objectId}`,
      classId: classId,
      genericType: "GENERIC_TYPE_UNSPECIFIED",
      hexBackgroundColor: "#1E88E5",
      logo: {
        sourceUri: {
          uri: "https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg",
        },
        contentDescription: {
          defaultValue: { language: "es", value: "Logo" },
        },
      },
      cardTitle: {
        defaultValue: {
          language: "es",
          value: body.empresa || "Información de Contacto",
        },
      },
      header: {
        defaultValue: {
          language: "es",
          value: body.nombre,
        },
      },
      subheader: body.puesto
        ? {
            defaultValue: {
              language: "es",
              value: body.puesto,
            },
          }
        : undefined,
      textModulesData,
      linksModuleData,
      barcode: body.sitioWeb
        ? {
            type: "QR_CODE",
            value: body.sitioWeb,
            alternateText: "Escanea para visitar",
          }
        : undefined,
    };

    // Crear JWT
    const claims = {
      iss: credentials.client_email,
      aud: "google",
      origins,
      typ: "savetowallet",
      payload: {
        genericObjects: [genericObject],
      },
    };

    const token = jwt.sign(claims, credentials.private_key, {
      algorithm: "RS256",
    });

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    return NextResponse.json({
      success: true,
      url: saveUrl,
      objectId: genericObject.id,
      data: {
        nombre: body.nombre,
        telefono: body.telefono,
        correo: body.correo,
      },
    });
  } catch (error) {
    console.error("Error al crear tarjeta de Google Wallet:", error);

    return NextResponse.json(
      {
        success: false,
        error: ` catch :${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar configuración
export async function GET() {
  const isConfigured = !!(
    process.env.GOOGLE_PROJECT_ID &&
    process.env.GOOGLE_CLIENT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );

  return NextResponse.json({
    configured: isConfigured,
    projectId: process.env.GOOGLE_PROJECT_ID ? "Configurado" : "No configurado",
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL
      ? "Configurado"
      : "No configurado",
    privateKey: process.env.GOOGLE_PRIVATE_KEY
      ? "Configurado"
      : "No configurado",
  });
}
