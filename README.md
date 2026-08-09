# FreelanceWon OS (Open Source Edition for Skool Community) ⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-emerald.svg)]()
[![Community](https://img.shields.io/badge/Skool-Freelancer_OS-indigo.svg)]()

**FreelanceWon OS** is a free, open-source Freelance CRM, Proposal Generator, and AI Growth Engine designed specifically for freelancers, agency operators, and high-ticket service providers in the **Skool Community**.

---

## 🚀 Key Features

- **🌐 Live Web App Demo**: Experience FreelanceWon OS live right now at [https://freelancewon-os.pages.dev](https://freelancewon-os.pages.dev)
- **📊 Deal & Proposal Pipeline**: Interactive Kanban board to track leads from prospecting → proposal sent → interview → contract won → retainer.
- **✍️ AI Proposal Studio**: Generate high-converting Upwork proposals and direct outreach pitches using 3 battle-tested frameworks (The Upwork Hook & Proof, The Audit & Micro-Video Pitch, and The 3-Step Guarantee).
- **💰 Value-Based Pricing Calculator**: Stop undercharging hourly. Calculate your rate floor, value-based pricing anchors, and monthly retainer structures.
- **📜 Scope of Work (SOW) Builder**: Generate clear, legal-grade Scope of Work documents with milestone payment breakdowns and scope creep defense clauses.
- **🎓 Skool Hub & Automation Kit**: Download pre-configured n8n workflows (`.json`), access high-converting AI prompts, and get started in minutes.

---

## 📦 Quickstart & Installation

### Option 1: Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/AutomateScale/freelancewon-os.git

# 2. Enter directory
cd freelancewon-os

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### Option 2: Deploy to Vercel / Netlify / Cloudflare Pages

This project is a zero-dependency Vite + React SPA. You can deploy it for FREE on Vercel, Netlify, or Cloudflare Pages with 1 click:

1. Fork this repository on GitHub.
2. Link your repo to **Vercel** or **Netlify**.
3. Build command: `npm run build` | Output directory: `dist`.

---

## 🤖 Open Source Automations & Prompts

Inside the [`/automations`](./automations) directory, you will find:
- **`n8n_freelancewon_lead_sync.json`**: An n8n workflow that ingests lead webhooks, qualifies leads using OpenAI GPT-4o, and stores them in your database.

Inside the [`/prompts`](./prompts) directory, you will find:
- **`upwork_proposal_prompts.json`**: Battle-tested AI prompts for Upwork proposal writing, rate objection handling, and scope defense.

---

## 🤝 Community & Support

Built with ❤️ by **Adam Palmer (AutomateScale)** for the **Skool Freelancer Community**.

- Join the discussion in our **Skool Community**
- Submit bug reports or feature requests via GitHub Issues.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE). You are free to use, modify, self-host, or white-label this software for your business.
