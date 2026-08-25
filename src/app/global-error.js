'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="bg-brand-black">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl font-display text-brand-blue mb-4">ERROR</h1>
            <p className="text-text mb-6">{error?.message || 'Something went wrong'}</p>
            <button
              onClick={reset}
              className="px-6 py-2 border border-brand-black text-text hover:bg-brand-blue hover:text-brand-black transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
