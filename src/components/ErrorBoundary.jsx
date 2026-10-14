import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error capturado en render:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    if (window.confirm('¿Deseas restaurar la configuración inicial para resolver el problema?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090c13] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900/90 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-white mb-2">
              Algo inesperado ocurrió
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              El sistema protegió tus datos para evitar pérdidas. Puedes recargar la aplicación o restaurar los datos si persiste.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar Aplicación
              </button>
              
              <button
                onClick={this.handleResetStorage}
                className="w-full px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Restablecer datos locales de fábrica
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
