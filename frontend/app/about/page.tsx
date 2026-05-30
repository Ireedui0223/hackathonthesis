import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 text-neutral-950">
      <section className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8">
        <Link href="/" className="text-sm font-bold text-neutral-500">Буцах</Link>
        <h1 className="mt-4 text-4xl font-black">Системийн тухай</h1>
        <p className="mt-4 leading-7 text-neutral-600">
          Энэ бол оюутан, удирдагч багш, шүүмж багш, админд зориулсан диплом хамгаалалтын удирдлагын систем.
          Хэрэглэгч, диплом, PDF файл, хамгаалалтын хуваарь, оноо, шүүмж болон статистикийг нэг дор удирдана.
        </p>
      </section>
    </main>
  );
}
