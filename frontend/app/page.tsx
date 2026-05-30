import Link from "next/link";

const roles = [
  ["Оюутан", "Диплом үүсгэх, PDF оруулах, хуваарь, оноо, шүүмж харах."],
  ["Удирдагч багш", "Оноогдсон оюутнуудаа харж 1-р хамгаалалтад оноо өгнө."],
  ["Шүүмж багш", "Бүлгийн хамгаалалтад оноо өгч шүүмжийн засвар шалгана."],
  ["Админ", "Хэрэглэгч, комисс, хуваарь, диплом, статистик удирдана."],
];

const workflow = ["Диплом бүртгэх", "Удирдагч оноох", "1-р хамгаалалт", "Шүүмж комисс,", "2-3-р хамгаалалт", "Тусгай шүүмж", "Эцсийн хамгаалалт"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <span className="text-lg font-black">Диплом хамгаалалт</span>
          <Link className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-bold text-white" href="/login">
            Нэвтрэх
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-neutral-200 bg-white p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-neutral-500">Диплом хамгаалалтын систем</p>
          <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">Дипломын явцыг нэг самбараас удирдана.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Оюутан, багш, PDF файл, хамгаалалтын хуваарь, оноо, шүүмж, статистикийг эрхийн дагуу удирдах веб систем.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-neutral-950 px-5 py-3 font-bold text-white" href="/login">
              Систем нээх
            </Link>
            <a className="rounded-lg border border-neutral-300 px-5 py-3 font-bold text-neutral-950" href="#workflow">
              Явц
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-black">Demo эрхүүд</h2>
          <div className="mt-4 grid gap-2 text-sm">
            {["admin@demo.com", "student1@demo.com", "mentor@demo.com", "critique1@demo.com"].map((email) => (
              <div key={email} className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                <span className="font-semibold">{email}</span>
                <span className="text-neutral-500">password123</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:grid-cols-4">
        {roles.map(([title, body]) => (
          <article key={title} className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{body}</p>
          </article>
        ))}
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-4 pb-14">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-2xl font-black">Хамгаалалтын явц</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-7">
            {workflow.map((item, index) => (
              <div key={item} className="rounded-lg border border-neutral-200 p-4">
                <p className="text-2xl font-black">{index + 1}</p>
                <p className="mt-2 text-sm text-neutral-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
