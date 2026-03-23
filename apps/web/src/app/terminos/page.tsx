import Link from 'next/link';

export const metadata = {
  title: 'Términos de Servicio — Vozpe',
  description: 'Términos y condiciones de uso de Vozpe.',
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Términos de Servicio</h1>
          <p className="text-text-tertiary text-sm">Última actualización: {new Date().toLocaleDateString('es', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-text-secondary">

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">1. Aceptación de los términos</h2>
            <p className="leading-relaxed">
              Al acceder o utilizar Vozpe (la &ldquo;Aplicación&rdquo;), aceptas estar vinculado por estos Términos de Servicio. Si no estás de acuerdo con alguno de estos términos, no uses la aplicación. Vozpe se reserva el derecho de actualizar estos términos en cualquier momento.
            </p>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">2. Descripción del servicio</h2>
            <p className="leading-relaxed">
              Vozpe es una plataforma colaborativa para el registro y gestión de gastos grupales. Permite capturar gastos mediante voz, fotografía o texto, y calcular balances entre los miembros de un grupo. El servicio está disponible en aplicaciones móviles (iOS y Android) y a través de la web.
            </p>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">3. Cuentas de usuario</h2>
            <p className="leading-relaxed mb-3">
              Para usar Vozpe debes crear una cuenta. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta. Debes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>Proporcionar información precisa y actualizada</li>
              <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
              <li>No compartir tus credenciales con terceros</li>
              <li>Tener al menos 13 años de edad para crear una cuenta</li>
            </ul>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">4. Planes y pagos</h2>
            <p className="leading-relaxed mb-3">
              Vozpe ofrece un plan gratuito con características limitadas y planes de pago (Premium y Equipo) con funcionalidades adicionales. Los pagos son procesados de forma segura y los precios pueden cambiar con notificación previa de 30 días.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>Las suscripciones se renuevan automáticamente cada mes</li>
              <li>Puedes cancelar en cualquier momento sin penalización</li>
              <li>No se realizan reembolsos por períodos parciales</li>
            </ul>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">5. Uso aceptable</h2>
            <p className="leading-relaxed mb-3">Te comprometes a no usar Vozpe para:</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>Actividades ilegales o fraudulentas</li>
              <li>Acosar, amenazar o dañar a otros usuarios</li>
              <li>Intentar vulnerar la seguridad del sistema</li>
              <li>Registrar datos de terceros sin su consentimiento</li>
            </ul>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">6. Limitación de responsabilidad</h2>
            <p className="leading-relaxed">
              Vozpe se proporciona &ldquo;tal cual&rdquo;. No garantizamos la disponibilidad continua del servicio. No somos responsables de pérdidas financieras derivadas del uso de la aplicación. Los cálculos de gastos son orientativos y la responsabilidad final de los acuerdos económicos recae en los usuarios.
            </p>
          </section>

          <section className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
            <h2 className="text-lg font-bold text-text-primary mb-3">7. Contacto</h2>
            <p className="leading-relaxed">
              Para preguntas sobre estos términos, contáctanos en{' '}
              <a href="mailto:legal@vozpe.com" className="text-vozpe-500 hover:underline">legal@vozpe.com</a>.
            </p>
          </section>
        </div>
      </div>

      <footer className="px-8 py-6 border-t border-border-subtle text-center text-text-tertiary text-sm">
        <div className="flex items-center justify-center gap-6 mb-2">
          <Link href="/" className="hover:text-text-primary transition-colors">Inicio</Link>
          <Link href="/pricing" className="hover:text-text-primary transition-colors">Precios</Link>
          <Link href="/privacidad" className="hover:text-text-primary transition-colors">Privacidad</Link>
        </div>
        © {new Date().getFullYear()} Vozpe. Todos los derechos reservados.
      </footer>
    </main>
  );
}
