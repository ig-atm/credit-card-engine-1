# RenoCred: Premium Credit Intelligence & Wealth Dashboard 💳⚡

RenoCred is a state-of-the-art, client-side React application designed to help users maximize their credit card rewards, track credit health, optimize category spending, and receive smart, personalized insights. Drawing aesthetic inspiration from modern dark-mode fintech platforms like CRED, it combines glassmorphism, smooth micro-animations, and a highly polished UI.

![Aesthetic Hero Layout](src/assets/hero.png)

## ✨ Core Features

*   **💳 Interactive Wallet Manager**: Link and manage cards with automatic real-time visualization of card layouts, networks, and credit limits.
*   **📊 Wallet Health Optimizer**: Scans the cards in your wallet to evaluate coverage across 9 distinct spending categories (dining, travel, groceries, etc.) and highlights reward gaps.
*   **🤖 Taqdeer Assistant**: An AI-powered Credit Intelligence Assistant. Ask questions about lounge access, CIBIL scores, credit score hacks, lifetime free recommendations, and optimized card selection.
*   **⚡ Real-Time UPI Simulator**: Simulates merchant checkouts (e.g. Swiggy, Emirates, Uber) and immediately computes the optimal card from your wallet to pay with to earn maximum reward points/cashback.
*   **📈 CIBIL Advisor & Utilization Tracker**: Tracks credit utilization rates across all linked cards with visual alerts when usage exceeds the recommended 30% threshold.
*   **📅 Bill Tracker**: Keep tabs on upcoming and overdue credit card statements, complete with minimum due alerts.
*   **🎯 Card Recommendation Engine (Analyzer)**: Recommends the top cards in the market tailored to your credit score and eligibility.

---

## 🛠️ Technology Stack

*   **Frontend Library**: React (v19)
*   **Build Tool**: Vite (v8) + TypeScript
*   **State Management**: Zustand (with persistent local storage integration)
*   **Animations**: Framer Motion (for fluid page changes, bottom sheets, and modal views)
*   **Icons**: Lucide React
*   **Styling**: Tailwind CSS + Custom CSS system for premium glassmorphic/CRED-like styling tokens (`index.css` & `tailwind.config.js`)
*   **Linting**: Oxlint (ultra-fast linter)

---

## 🚀 Quick Start & Installation

### Prerequisites
Make sure you have Node.js installed (v18+ recommended).

### 1. Clone & Navigate to Directory
```bash
cd "wealth dashboard"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
Starts the local development server with Vite hot module replacement (HMR).
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
Compiles TypeScript and bundles the assets for static hosting.
```bash
npm run build
```

---

## 📂 Project Structure

```
wealth dashboard/
├── src/
│   ├── components/            # Layout components (Sidebar, TopNav, DashboardLayout)
│   ├── features/
│   │   ├── cards/             # ActiveCard visual templates, BankLogos, and benefits modal
│   │   ├── dashboard/         # Login screens, seed data, and central Zustand store
│   │   └── finix/             # Taqdeer reasoning engine, optimizer panels, CIBIL advisor, and simulator UI
│   ├── lib/                   # Utility helpers (formatting cents, class name merger)
│   ├── App.tsx                # Dashboard layout assembler and main page router
│   ├── main.tsx               # Client entrypoint
│   └── index.css              # Dark mode color palette, custom glass classes, animations
├── public/                    # Standard svg icons and favicon assets
└── tailwind.config.js         # Theme extensions, tailored color scales, and spacing tokens
```

---

## 🔒 Security & Data Privacy

*   **No Server-side CVV Storage**: RenoCred collects credit card credentials (like CVV/Expiry) in local components purely to render the interactive card markup. CVVs are never saved or sent to any API or backend.
*   **Local State Persistence**: All modifications to your linked cards or dashboard profiles are stored directly in your browser's `localStorage` via Zustand middleware, ensuring complete user privacy and data ownership.
