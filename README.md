# Shubh Samay (શુભ સમય) — Real-time NASA-grade Vedic Timing PWA

A modern, mobile-first PWA for finding auspicious Vedic timings (Muhurat, Choghadiya, Hora, Tithi, Nakshatra, Yoga) for life events — weddings, housewarmings, vehicle purchases, business launches, and more. Powered by live NASA-grade astronomy calculations using Lahiri Ayanamsa.

![Version](https://img.shields.io/badge/version-9.0.0-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Installable-purple)

---

## What is Shubh Samay?

Shubh Samay eliminates the friction of traditional panchang tables and priest consultations by dynamically calculating auspicious time windows tailored to specific life events. Designed specifically for Gujarati-speaking users across Gujarat and India, it provides exact 30-minute timing tiers (`Highly Auspicious`, `Auspicious`, `Good`) with zero stored or static panchang data.

---

## ✨ Key Features

- 🌸 **18 Life Event Categories:** Tailored calculations for Weddings, Housewarming (Griha Pravesh), Vehicle Purchase, Gold Purchase, Business Launch, and more.
- ⏱️ **5 Vedic Calculation Engines:** Choghadiya (Day/Night 7-Graha rotation), Hora (24 Planetary hours), Tithi, Nakshatra, Yoga, and Abhijit/Brahma Muhurats.
- 📅 **Multi-Date & Window Filtering:** Evaluate individual dates or ranges up to 30 days ahead with optional morning/afternoon/evening time window filters.
- 📊 **Tiered Results & Smart Suggestions:** Clear color-coded slot cards with cumulative scoring (`Highly` ⊆ `Auspicious` ⊆ `Good`) and automatic alternative date suggestions.
- 🌐 **Bilingual EN/GU:** One-tap toggle between English and Gujarati (ગુજરાતી) with local preference persistence.
- 🌇 **24 Gujarat Cities + Metros:** Native support for 24 Gujarat cities and major Indian metropolitan regions.
- 📱 **Mobile-First PWA:** Installable as an Android web app with offline-ready shell and responsive layout.

---

## 🔬 Calculation Capabilities

- **NASA-Grade Astronomical Precision:** Uses `astronomy-engine` for exact solar and lunar ecliptic longitude math.
- **Lahiri Ayanamsa:** Strict adherence to Vedic astrological precession standards.
- **Zero Database Storage:** Recalculates exact astronomical positions per request, ensuring results never drift or go stale.

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.x (Strict mode)
- **Styling:** Tailwind CSS v4 + OKLCH Color Space
- **Components:** shadcn/ui ("New York" style)
- **Astronomy Library:** `astronomy-engine` (v2.1.19)
- **Icons:** Lucide React
- **Theme:** `next-themes` (Light, Dark, System)

---

## 🗺️ Architecture / Request Flow

```mermaid
flowchart LR
    A[User Selects Event & Date Range] --> B[Next.js App Router SPA]
    B -->|POST /api/timings| C[Server Route Handler]
    C --> D[astronomy-engine Ephemeris]
    D -->|Solar & Lunar Longitudes| E[Panchang & Time Division Engines]
    E -->|Evaluate 30-min Slots| F[Event Scoring Rules]
    F -->|Cumulative Tier Buckets| B
    B --> G[Render Tiered Cards UI]
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or bun

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rutambh/shubhsamay.git
   cd shubh_samay
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run start
```

---

## 📦 Package Info

- **Package ID:** `com.rutambh.shubhsamay`
- **License:** MIT

