"use client";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-lg">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          LeetCode Student Progress Tracker
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          A lightweight dashboard to help students, teachers, and admins track
          LeetCode problem-solving progress with a focus on the Blind 75 list.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-lg">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Author
          </h2>
          <p className="mt-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            Dharun K C
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Built with Next.js App Router, TailwindCSS, and a clean
            LeetCode-inspired UI.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-lg">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Links
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <span className="font-medium">GitHub: </span>
              <a
                href="https://github.com/Dharun-2007"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                View my projects
              </a>
            </li>
            <li>
              <span className="font-medium">LinkedIn: </span>
              <a
                href="https://www.linkedin.com/in/dharun-k-c"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Connect on LinkedIn
              </a>
            </li>
            <li>
              <span className="font-medium">Email: </span>
              <a
                href="mailto:dharunkc180@gmail.com"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                dharunkc180@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

