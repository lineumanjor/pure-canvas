const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 md:px-16">
        <span className="font-display text-xl tracking-tight text-foreground">branco.</span>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Trabalho</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contacto</a>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight text-foreground leading-tight">
            Puro. Simples. Branco.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-light max-w-md mx-auto leading-relaxed">
            A beleza está na simplicidade. Menos é sempre mais.
          </p>
        </div>

        {/* Decorative line */}
        <div className="mt-16 w-px h-24 bg-border animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }} />
      </main>

      {/* Cards section */}
      <section className="px-8 md:px-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {['Clareza', 'Espaço', 'Silêncio'].map((title, i) => (
            <div
              key={title}
              className="group rounded-lg border border-border bg-card p-8 shadow-soft hover:shadow-card transition-shadow duration-500 animate-fade-in"
              style={{ animationDelay: `${0.4 + i * 0.15}s`, opacity: 0 }}
            >
              <h3 className="font-display text-lg text-card-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {i === 0 && 'Cada elemento tem propósito. Nada a mais, nada a menos.'}
                {i === 1 && 'O vazio respira. O espaço dá significado ao que existe.'}
                {i === 2 && 'No silêncio visual encontramos a verdadeira elegância.'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-16 py-8 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Tudo em branco. Tudo em paz.
        </p>
      </footer>
    </div>
  );
};

export default Index;
