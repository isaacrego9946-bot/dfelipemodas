export function Promo() {
  return (
    <section
      id="sobre"
      className="mx-4 mb-[58px] border border-[#594522] px-6 py-10 md:mx-[6%] md:mb-[78px] md:px-[8%] md:py-[55px]"
      style={{
        background:
          "radial-gradient(circle at 80% 20%, #caa66038, transparent 30%), #1d160e",
      }}
    >
      <p className="text-[10px] font-bold tracking-[3px] text-gold uppercase">
        Manifesto D Felipe Modas
      </p>
      <h2 className="my-3 font-display text-[clamp(30px,5vw,50px)] font-medium">
        O básico nunca foi tão extraordinário.
      </h2>
      <p className="mb-6 max-w-[450px] text-[#ccc]">
        Design atemporal, personalidade e detalhes que fazem a diferença.
      </p>
      <a
        href="#loja"
        className="inline-block border border-gold bg-transparent px-5 py-3.5 text-[10px] font-bold tracking-[1.5px] text-gold uppercase transition hover:bg-gold hover:text-ink"
      >
        Descobrir agora
      </a>
    </section>
  );
}
