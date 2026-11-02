import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-text hero-in">
        <h1>Цифровые профессии с нуля</h1>
        <p className="lead">
          Дизайн, разработка, маркетинг, аналитика и нейросети. Практика на реальных проектах и преподаватели из
          индустрии.
        </p>
        <a className="button" href="#courses">
          Выбрать курс
        </a>
      </div>
      <figure className="hero-photo hero-in">
        <Image
          src="/photos/mixing-console.jpg"
          alt="Рука на ползунке микшерного пульта крупным планом"
          width={1200}
          height={900}
          sizes="(max-width: 860px) 100vw, 50vw"
          priority
        />
      </figure>
    </section>
  );
}
