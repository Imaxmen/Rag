import { Suspense } from "react";
import ChatWidget from "@/components/ChatWidget";
import Cta from "@/components/Cta";
import CourseList from "@/components/CourseList";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Format from "@/components/Format";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Practice from "@/components/Practice";
import Teachers from "@/components/Teachers";
import { getCatalog } from "@/lib/catalog";

async function Catalog() {
  const { courses, teachers } = await getCatalog();

  return (
    <>
      <section className="section catalog" id="courses" aria-labelledby="courses-title">
        <h2 id="courses-title">Курсы</h2>
        {courses.length > 0 ? (
          <CourseList courses={courses} />
        ) : (
          <p>Каталог пока пуст. Добавьте курсы в файл knowledge/catalog.xlsx на листе «Курсы».</p>
        )}
      </section>
      <Format />
      <Practice />
      {teachers.length > 0 && <Teachers teachers={teachers} />}
    </>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<section className="section catalog" aria-busy="true" />}>
          <Catalog />
        </Suspense>
        <Faq />
        <Cta />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
