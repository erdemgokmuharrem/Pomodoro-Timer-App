# React Native Proje Kuralları

## 📦 Teknoloji Stack

- Framework: **React Native (Expo)**
- Dil: **TypeScript**
- State Management: **Zustand** (basit global state) + **React Query** (server sync)
- Navigation: **React Navigation (stack + bottom tabs)**
- UI Kit: **Tailwind (NativeWind) + shadcn/ui uyarlaması**
- Grafik: **Recharts / Victory Native**
- Storage: **AsyncStorage** (offline cache), **SQLite** (ileri seviye)
- Auth: **Firebase Auth** (MVP için) → ileride OAuth + JWT API
- Sync: **Firebase Firestore / Supabase** (gerçek zamanlı sync)

---

## 📝 Kodlama Standartları

- **TypeScript strict mode** aktif
- Fonksiyonel bileşenler + React Hooks
- Component hiyerarşisi: `screens/`, `components/`, `hooks/`, `store/`, `services/`
- **Atomic Design** prensibi (atoms, molecules, organisms)
- API çağrıları `services/api.ts` altında toplanacak
- State katmanı UI’dan ayrı olacak

---

## 🎨 UI / UX Kuralları

- Tüm ekranlar **dark & light theme** destekleyecek
- Minimum 44px dokunma alanı (WCAG uyumlu)
- Renkler Tailwind theme üzerinden yönetilecek
- Animasyonlarda **Framer Motion (react-native-reanimated)** kullanılacak
- Widget desteği (Android/iOS) MVP sonrası eklenecek

---

## 🧪 Test & Kalite

- Unit test: **Jest + React Testing Library**
- E2E test: **Detox**
- Kod kalite: **ESLint + Prettier**
- Commit formatı: **Conventional Commits**
- CI/CD: **GitHub Actions** → build + test + deploy

---

## 🔌 Entegrasyonlar

- **Google/Outlook Calendar API**
- **Zapier / Make API**
- **Slack / Email import**
- **Browser extension** (React web companion app ile)

---

## 🚀 Yayınlama & Dağıtım

- Store Release: Android Play Store, iOS App Store
- OTA Update: **Expo EAS Update**
- Beta test: **TestFlight** & **Google Play Beta**

---

## 📊 Performans & Ölçeklenebilirlik

- Lazy loading & code splitting
- Offline-first (queue sistemi)
- Minimal bundle size
- Çoklu dil desteği (i18n)

---

## 🔒 Güvenlik

- Tüm veriler HTTPS üzerinden
- Lokal storage’de şifreli (AES) saklama
- GDPR/KVKK uyumluluk
- Kullanıcıya veri export imkanı

---
