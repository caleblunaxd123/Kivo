import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad — Vozpe',
  description: 'Política de privacidad y protección de datos de Vozpe.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg-base">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg-surface shadow-xs">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vozpe.png" alt="Vozpe" className="h-8" />
        </Link>
        <Link href="/auth/login" className="bg-vozpe-500 hover:bg-vozpe-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-btn">
          Iniciar sesión
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Política de Privacidad</h1>
          <p className="text-text-tertiary text-sm">Última actualización: {new Date().toLocaleDateString('es', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-text-secondary">

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">1. Información que recopilamos</h2>
            <p className="leading-relaxed mb-3">Recopilamos la siguiente información cuando usas Vozpe:</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li><strong className="text-text-primary">Información de cuenta:</strong> Nombre, correo electrónico, proveedor de autenticación (Google/Apple)</li>
              <li><strong className="text-text-primary">Datos de gastos:</strong> Descripciones de entradas, montos, fechas, categorías</li>
              <li><strong className="text-text-primary">Datos de grupos:</strong> Nombre del grupo, miembros, configuración</li>
              <li><strong className="text-text-primary">Datos de uso:</strong> Páginas visitadas, funciones utilizadas (sin información personal identificable)</li>
            </ul>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">2. Cómo usamos tu información</h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>Proveer y mejorar el servicio de Vozpe</li>
              <li>Gestionar tu cuenta y suscripción</li>
              <li>Sincronizar datos entre dispositivos y miembros del grupo</li>
              <li>Enviar comunicaciones importantes sobre el servicio</li>
              <li>Mejorar algoritmos de parsing y categorización (datos anonimizados)</li>
            </ul>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">3. Almacenamiento y seguridad</h2>
            <p className="leading-relaxed">
              Tus datos se almacenan en Supabase (PostgreSQL) con cifrado en tránsito (TLS/HTTPS) y en reposo. Implementamos medidas de seguridad estándar de la industria. Los datos de grupos son accesibles únicamente para los miembros del mismo. No vendemos ni compartimos tus datos personales con terceros.
            </p>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">4. IA y procesamiento de voz/imagen</h2>
            <p className="leading-relaxed">
              Cuando usas las funciones de captura por voz (Whisper) o foto (OCR), el audio e imagen se procesan para extraer información de gastos. Estos datos se procesan de forma temporal y no se almacenan una vez completado el análisis. El parsing con IA (Claude Haiku) recibe únicamente el texto de la entrada, nunca datos personales identificables.
            </p>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">5. Tus derechos</h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>Acceder a todos tus datos en cualquier momento</li>
              <li>Exportar tu información en formato CSV</li>
              <li>Solicitar la eliminación de tu cuenta y datos</li>
              <li>Corregir información incorrecta en tu perfil</li>
              <li>Optar por no recibir comunicaciones de marketing</li>
            </ul>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">6. Cookies</h2>
            <p className="leading-relaxed">
              Usamos cookies esenciales para mantener tu sesión activa y preferencias. No usamos cookies de seguimiento de terceros ni publicidad. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar el funcionamiento del servicio.
            </p>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">7. Contacto</h2>
            <p className="leading-relaxed">
              Para ejercer tus derechos o consultas sobre privacidad, contáctanos en{' '}
              <a href="mailto:privacidad@vozpe.com" className="text-vozpe-500 hover:underline">privacidad@vozpe.com</a>.
            </p>
          </section>
        </div>
      </div>

      <footer className="px-8 py-6 border-t border-border-subtle text-center text-text-tertiary text-sm">
        <div className="flex items-center justify-center gap-6 mb-2">
          <Link href="/" className="hover:text-text-primary transition-colors">Inicio</Link>
          <Link href="/pricing" className="hover:text-text-primary transition-colors">Precios</Link>
          <Link href="/terminos" className="hover:text-text-primary transition-colors">Términos</Link>
        </div>
        © {new Date().getFullYear()} Vozpe. Todos los derechos reservados.
      </footer>
    </main>
  );
}
