export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[550px] items-center overflow-hidden px-6 py-16 md:min-h-[590px] md:px-[10%]"
      style={{
        background:
          "radial-gradient(circle at 78% 30%, #80633c55, transparent 28%), linear-gradient(110deg, #080808 20%, #080808b0 63%, #3a2a1b)",
      }}
    >
      <div className="animate-fade-up relative z-1 max-w-[520px]">
        <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">
          Elegância é atitude
        </p>
        <h1 className="mt-[18px] mb-[18px] font-display text-[clamp(48px,8vw,88px)] leading-[0.98] font-medium">
          Vista sua
          <br />
          <em className="text-gold-soft not-italic">essência.</em>
        </h1>
        <p className="mb-7 max-w-[420px] text-[13px] leading-relaxed text-[#d1ccc4] md:text-sm md:leading-[1.7]">
          Peças selecionadas para quem transforma presença em estilo. Uma
          curadoria feita para durar.
        </p>
        <a
          href="#loja"
          className="inline-block bg-gold px-5 py-3.5 text-[10px] font-bold tracking-[1.5px] text-ink uppercase transition hover:brightness-110"
        >
          Explorar coleção
        </a>
      </div>
    </section>
  );
}
