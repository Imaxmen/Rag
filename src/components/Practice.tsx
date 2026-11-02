import Image from "next/image";

export default function Practice() {
  return (
    <section className="section practice" aria-label="Практика">
      <p className="statement">
        На каждом курсе вы делаете реальные проекты. Преподаватель смотрит работу и говорит, что исправить.
      </p>
      <figure>
        <Image
          src="/photos/camera-hands.jpg"
          alt="Руки держат старый дальномерный фотоаппарат"
          width={1000}
          height={750}
          sizes="(max-width: 760px) 50vw, 25vw"
        />
      </figure>
      <figure>
        <Image
          src="/photos/typewriter.jpg"
          alt="Чёрная печатная машинка с чистым листом бумаги, вид сверху"
          width={1000}
          height={750}
          sizes="(max-width: 760px) 50vw, 25vw"
        />
      </figure>
    </section>
  );
}
