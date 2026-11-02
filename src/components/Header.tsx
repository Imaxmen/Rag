export default function Header() {
  return (
    <header className="topbar">
      <a href="#top" className="logo">
        Пиксель
      </a>
      <nav aria-label="Основная">
        <a href="#courses">Курсы</a>
        <a href="#teachers">Преподаватели</a>
        <a href="#faq">Вопросы</a>
        <a className="button button-small" href="#signup">
          Записаться
        </a>
      </nav>
    </header>
  );
}
