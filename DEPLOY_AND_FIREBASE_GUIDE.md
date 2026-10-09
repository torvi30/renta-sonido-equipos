# 🚀 Guía de Despliegue 100% Gratuito: Sound & Event Control PRO

Esta aplicación está lista para funcionar de dos formas:
1. **Modo Autónomo Local (Cero configuración):** Funciona al 100% en tu navegador y móvil, guardando todo en almacenamiento local ultrarrápido y permitiéndote exportar e importar backups JSON.
2. **Modo Nube con Firebase (Multidispositivo en tiempo real):** Permite que tú y tu equipo manejen el inventario desde diferentes celulares simultáneamente.

---

## 🌐 Opción 1: Despliegue Gratis en Vercel (Recomendado - 2 Minutos)

1. Sube tu código a GitHub o instala la herramienta de Vercel:
   ```bash
   npx vercel
   ```
2. Acepta los valores por defecto. ¡Listo! Vercel te dará un enlace HTTPS gratuito tipo `https://tu-negocio-sonido.vercel.app`.

---

## 🔥 Opción 2: Conectar Firebase Firestore (Spark Plan 100% Gratis)

Para activar la sincronización en la nube gratuita:

1. Ve a la consola de [Firebase](https://console.firebase.google.com/) y crea un proyecto nuevo (ej. `sound-control`).
2. En la barra lateral:
   * Ve a **Firestore Database** ➔ Crear base de datos ➔ Comenzar en **Modo de producción** o **Modo de prueba**.
   * Ve a **Autenticación** ➔ Empezar (opcional para usuarios).
   * Ve a **Storage** ➔ Empezar (5 GB gratis para fotos).
3. En la configuración de tu proyecto (icono de engranaje ⚙️ ➔ Configuración del proyecto):
   * Baja hasta "Tus apps" ➔ Selecciona el icono Web `</>` ➔ Ponle un nombre y copia tus claves.
4. Crea un archivo `.env` en la raíz de tu proyecto con las siguientes variables:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```
5. ¡Listo! La aplicación detectará automáticamente tus credenciales y pasará a modo nube en tiempo real.

---

## 🔒 Seguridad del Panel Admin
* El panel de administración está protegido con un **PIN de 4 dígitos** (por defecto: `1234`).
* Puedes cambiar el PIN en cualquier momento desde el icono de **Ajustes (⚙️)** en la barra superior.

## 💾 Backups y Respaldo
* Desde **Ajustes (⚙️)** puedes pulsar **"Descargar Backup (.json)"** para tener una copia de todos tus pedidos, clientes y equipos en tu computador o teléfono.
