# ⚡ LC Tracker: Classroom LeetCode Dashboard

A professional, high-performance web application built for student associations to track LeetCode progress, visualize mastery of the **Blind 75** set, and manage peer rankings in real-time.

## 🔗 [Live Demo](https://leetcode-tracker-sable.vercel.app)

---

## 🌟 Key Features

- **Blind 75 Progress Visualization:** Categorized tracking for Arrays, Strings, DP, Graphs, and more.
- **Admin Approval Workflow:** Secure registration system where admins manually approve students to ensure leaderboard integrity.
- **Modern Auth Guard:** Next.js Middleware protects routes and prevents session-related navigation issues (like the back-button bug).
- **Automated Ranking:** Students are automatically sorted by their Roll Number suffix for organized classroom tracking.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database:** [Supabase](https://supabase.com/) (Postgres + Auth)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🔒 Security Architecture

- **Zero Local Secrets:** No sensitive data or plain-text passwords stored in the repository.
- **Server-Side Auth:** All session management and administrative actions are handled server-side via Supabase.
- **Environment Isolation:** Sensitive API keys are managed through Vercel's encrypted environment variables.
