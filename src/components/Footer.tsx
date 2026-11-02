export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cols">
        <ul>
          <li>Пиксель</li>
          <li>Онлайн-школа цифровых профессий</li>
        </ul>
        <ul>
          <li>Разделы</li>
          <li><a href="#courses">Курсы</a></li>
          <li><a href="#teachers">Преподаватели</a></li>
          <li><a href="#faq">Вопросы</a></li>
        </ul>
        <ul>
          <li>Связь</li>
          <li><a href="mailto:hello@example.com">hello@example.com</a></li>
        </ul>
        <ul>
          <li>Часы работы</li>
          <li>Пн–Пт, 10:00–19:00</li>
        </ul>
      </div>
      <p className="legal meta">
        © 2026 Пиксель. Все права защищены. Фото: Drew Patrick Miller, Kristian Karlsson, Florian Klauer (Unsplash).
      </p>
    </footer>
  );
}
