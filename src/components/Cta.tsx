export default function Cta() {
  return (
    <section className="section section-alt cta" id="signup" aria-labelledby="signup-title">
      <div>
        <h2 id="signup-title">Выберите курс и запишитесь</h2>
        <p className="lead">Напишите нам, какой курс выбрали, и мы подтвердим место.</p>
      </div>
      <a
        className="button"
        href="mailto:hello@example.com?subject=Запись на курс&body=Здравствуйте! Хочу записаться на курс:"
      >
        Записаться
      </a>
    </section>
  );
}
