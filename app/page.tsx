import Image from "next/image";
import HelpSection from "@/components/HelpSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <main
      className="min-h-screen w-full"
      id="interface"
      style={{
        backgroundImage: "url('/background.svg')",
        backgroundSize: "contain",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative w-full pb-0">
        <div
          className="relative container mx-auto px-6 sm:px-12 pt-24 pb-6 min-h-[85vh] lg:min-h-[90vh] flex flex-col-reverse lg:flex-row-reverse items-center justify-between gap-10 md:gap-16"
          style={{ fontFamily: "var(--font-cairo)" }}
        >
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-start space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.2] drop-shadow-sm tracking-tight">
              أهلاً بك في نظام{" "}
              <span className="ms-3 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
                رواد
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              نظام الامتحانات الإلكتروني للطلاب وذوي الإعاقة، تمنحك الحرية وتدعم
              احتياجاتك بكل سهولة وأمان
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2 lg:w-full lg:justify-start">
              <button className="px-8 py-4 w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 text-lg">
                ابدأ الآن
              </button>
              <button className="px-8 py-4 w-full sm:w-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 text-lg">
                اكتشف المزيد
              </button>
            </div>
          </div>

          {/* Image Content */}
          <div className="flex-1 w-full max-w-sm sm:max-w-md lg:max-w-2xl relative flex justify-center group">
            {/* Decorative background blur element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-400/20 dark:bg-blue-500/10 blur-3xl rounded-full -z-10 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative w-full aspect-square drop-shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">
              <Image
                src={"/images/hero.png"}
                alt="واجهة رواد"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Who Are We Section */}
      <div
        id="whoisus"
        className="relative container mx-auto px-6 sm:px-12 py-2 lg:py-2 mt-2 lg:-mt-12"
        style={{ fontFamily: "var(--font-cairo)" }}
        dir="rtl"
      >
        {/* Decorative blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-400/10 dark:bg-blue-500/5 blur-3xl rounded-full -z-10"></div>

        <div className="max-w-4xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-5">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.2] tracking-tight">
              من{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
                نحن؟
              </span>
            </h2>
            <div className="mt-3 mx-auto h-1 w-20 rounded-full bg-linear-to-r from-blue-600 to-indigo-500"></div>
          </div>

          {/* Content card */}
          <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/40 shadow-xl shadow-blue-500/5 p-6 sm:p-8 lg:p-10 space-y-0">
            <ul className="space-y-2">
              {[
                "نظام رواد هو منصة تعليمية إلكترونية صممت لتسهيل إدارة الامتحانات وتنظيمها بطريقة حديثة وفعالة. ويهدف النظام إلى توفير بيئة رقمية تساعد المعلمين على إنشاء الاختبارات بسهولة وتمكين الطلاب من أداء الامتحانات بطريقة مريحة ومنظمة.",
                "كما يركز رواد على دعم الطلاب من ذوي الإعاقة من خلال توفير أدوات وخصائص تساعدهم على التفاعل مع الامتحانات بشكل أفضل، وتقديم واجهات بسيطة وسهلة الاستخدام.",
                "نحن نسعى من خلال رواد إلى تطوير تجربة الامتحانات الإلكترونية وجعلها أكثر عدلاً ومرونة، بحيث يستطيع كل طالب إظهار قدراته الحقيقية في بيئة تعليمية مناسبة للجميع.",
              ].map((text, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 hover:bg-blue-50/60 dark:hover:bg-blue-900/10"
                >
                  {/* Blue bullet */}
                  <span className="mt-2 shrink-0 w-3 h-3 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/40 group-hover:scale-125 transition-transform duration-300"></span>
                  <p className="text-lg sm:text-xl leading-relaxed text-slate-700 dark:text-slate-300">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Why Us Section */}
      <section
        className="relative overflow-hidden py-4 lg:py-10 mt-6 lg:mt-8"
        id="whyus"
        dir="rtl"
        style={{ fontFamily: "var(--font-cairo)" }}
      >
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] sm:w-[750px] sm:h-[750px] -z-10 opacity-25 dark:opacity-15"
          style={{
            backgroundImage: "url('/whyus.png')",
            backgroundSize: "contain",
            backgroundPosition: "left top",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-[40%] h-[40%] bg-blue-400/15 dark:bg-blue-500/10 blur-[100px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] bg-indigo-400/10 dark:bg-indigo-500/8 blur-[80px] rounded-full -z-10" />

        <div className="container mx-auto px-6 sm:px-12">
          {/* Section heading */}
          <div className="text-center mb-5 lg:mb-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.2] tracking-tight">
              لماذا{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
                رواد؟
              </span>
            </h2>
            <div className="mt-2 mx-auto h-1 w-20 rounded-full bg-linear-to-r from-blue-600 to-indigo-500" />
            <p className="mt-3 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              نقدم لك تجربة تعليمية فريدة ومتكاملة تميزنا عن غيرنا
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-w-4xl mx-auto">
            {/* Card 1 — Accessibility Support */}
            <div className="group relative bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-lg shadow-blue-500/5 p-5 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-2 hover:border-blue-300/50 dark:hover:border-blue-600/30">
              {/* Icon */}
              <div className="w-12 h-12 mb-3 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="16" cy="4" r="1" />
                  <path d="m18 19 1-7-6 1" />
                  <path d="m5 8 3-3 5.5 3-2.36 3.5" />
                  <path d="M4.24 14.5a5 5 0 0 0 6.88 6" />
                  <path d="M13.76 17.5a5 5 0 0 0-6.88-6" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                دعم جميع أنواع الإعاقات
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                أدوات مخصصة تراعي احتياجات كل طالب من ذوي الإعاقة لضمان تجربة
                عادلة ومتاحة للجميع
              </p>
            </div>

            {/* Card 2 — Easy Interface */}
            <div className="group relative bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-lg shadow-blue-500/5 p-5 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-2 hover:border-blue-300/50 dark:hover:border-blue-600/30">
              <div className="w-12 h-12 mb-3 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 group-hover:shadow-cyan-500/50 transition-all duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h3v3H7z" />
                  <path d="M14 7h3" />
                  <path d="M14 11h3" />
                  <path d="M7 14h10" />
                  <path d="M7 18h10" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                واجهة سهلة الاستخدام
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                تصميم بسيط وبديهي يسهّل على الطلاب والمعلمين التعامل مع النظام
                دون أي تعقيد
              </p>
            </div>

            {/* Card 3 — Auto/Manual Grading */}
            <div className="group relative bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-lg shadow-blue-500/5 p-5 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-2 hover:border-blue-300/50 dark:hover:border-blue-600/30">
              <div className="w-12 h-12 mb-3 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:shadow-violet-500/50 transition-all duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                تصحيح تلقائي أو يدوي
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                مرونة كاملة في تصحيح الاختبارات سواء بشكل تلقائي فوري أو يدوي
                حسب حاجة المعلم
              </p>
            </div>

            {/* Card 4 — Reports & Results */}
            <div className="group relative bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-lg shadow-blue-500/5 p-5 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-2 hover:border-blue-300/50 dark:hover:border-blue-600/30">
              <div className="w-12 h-12 mb-3 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:shadow-emerald-500/50 transition-all duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                تقارير ونتائج دقيقة
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                إحصائيات شاملة وتقارير مفصّلة تساعد في متابعة أداء الطلاب واتخاذ
                قرارات تعليمية أفضل
              </p>
            </div>
          </div>
        </div>
      </section>

      <HelpSection />
      <ContactSection />
    </main>
  );
}
