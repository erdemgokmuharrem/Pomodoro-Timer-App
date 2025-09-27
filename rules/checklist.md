# Pomodoro+ Uygulaması - Geliştirme Checklist

## 🏗️ Proje Kurulumu
- [x] Expo + TypeScript projesi oluştur
- [x] Gerekli bağımlılıkları yükle (NativeWind, Zustand, React Query, React Navigation)
- [x] Atomic design prensiplerine göre klasör yapısını oluştur
- [x] React Navigation (stack + bottom tabs) yapılandır
- [x] ESLint + Prettier yapılandırması
- [x] Dark/Light tema sistemi kurulumu
- [x] Temel UI bileşenlerini oluştur (atoms, molecules)

## 🎛️ Pomodoro Yönetimi
- [x] Özelleştirilebilir süreler
- [x] Görev-bağlı pomodoro
- [x] Pomodoro zincirleme
- [x] Kesinti kaydı
- [x] Otomatik yeniden planlama
- [ ] Tahmin vs gerçek zaman karşılaştırması
- [x] Enerji-temelli öneriler
- [x] Context etiketleri & filtreler

## ✅ Görev Yönetimi
- [x] Alt görevler & checkpoint sistemi
- [x] Takvim senkronizasyonu (Google/Outlook)
- [x] Görev şablonları
- [x] Görev öncelik matrisi
- [x] Auto-split (uzun görevleri bölme)
- [x] Kanban / Liste / Gantt görünümleri

## 👥 Sosyal & Ekip
- [x] Grup pomodoroları
- [x] Pair focus
- [x] Focus rooms
- [x] Haftalık lig sistemi
- [x] Sosyal challenge'lar

## 🛡️ Dikkat Engelleme
- [x] Bildirim bloklama (OS DND)
- [x] Uygulama/URL bloklama
- [x] White noise & odak sesleri
- [x] Mola rehberi (stretching, nefes)

## 📊 Analitik & Raporlama
- [x] Focus Score
- [x] Complexity Score
- [x] Haftalık review asistanı
- [ ] Freelancer faturalama
- [ ] Müşteri bazlı raporlar
- [x] Export: CSV/Excel/JSON

## 🤖 AI & Akıllı Özellikler
- [x] Akıllı süre önerisi
- [ ] Görev zamanlama önerisi
- [ ] Adaptif mod (alışkanlıklara göre UI)
- [ ] AI koç
- [ ] Smart scheduling

## 🎮 Gamification

### Katman 1 (Günlük)
- [x] Streaks
- [x] Mini rozetler
- [x] XP & Level sistemi

### Katman 2 (Haftalık/Aylık)
- [ ] Quests
- [x] Lig sistemi
- [ ] Sanatsal koleksiyonlar

### Katman 3 (Uzun Vadeli & Premium)
- [ ] Sanal bahçe / dünya
- [ ] Avatar kişiselleştirme
- [ ] Sosyal etkileşim
- [ ] Gerçek ödül mağazası

## 📱 Ana Ekranlar
- [x] Dashboard
- [x] Görevler
- [x] Timer (Odak Ekranı)
- [x] İstatistikler
- [x] Ayarlar

## 🔒 Diğer Özellikler
- [x] Gizlilik & güvenlik (GDPR/KVKK uyumlu)
- [x] Offline mod & sync queue
- [x] Erişilebilirlik (screen reader, high contrast)
- [ ] Çoklu zaman dilimi desteği
- [ ] Reflect journal (günlük refleksiyon)
- [ ] Kullanıcılar birbirini ekleyebilsin ve iletişime geçebilsin
- [ ] kullanıcılar kendi ID'lerini belirleyebilsin ve ortak session yapabilsin
- [ ] birbirini ekleyen kulllanıcılar seanslarını pomodoro zincirlerini kontrol edebilsin
- [ ] ortak session oluşturup beraber çalışabilsinler bir kişi bir session kursun ve ID'lerine göre davet edebilsin
- [ ]  seans özelliklerini süresini katılacak kişi sayısını seansın amacını vb. belirleyebilsin.

## 🧪 Test & Kalite
- [x] Unit test: Jest + React Testing Library (Temel testler)
- [ ] E2E test: Detox
- [x] Kod kalite: ESLint + Prettier
- [x] Commit formatı: Conventional Commits
- [ ] CI/CD: GitHub Actions

## 🔌 Entegrasyonlar
- [x] Google/Outlook Calendar API
- [ ] Zapier / Make API
- [ ] Slack / Email import
- [ ] Browser extension (React web companion app ile)

## 🚀 Yayınlama & Dağıtım
- [ ] Store Release: Android Play Store, iOS App Store
- [ ] OTA Update: Expo EAS Update
- [ ] Beta test: TestFlight & Google Play Beta

## 📊 Performans & Ölçeklenebilirli k
- [ ] Lazy loading & code splitting
- [ ] Offline-first (queue sistemi)
- [ ] Minimal bundle size
- [ ] Çoklu dil desteği (i18n)

## 🔒 Güvenlik
- [ ] Tüm veriler HTTPS üzerinden
- [ ] Lokal storage'de şifreli (AES) saklama
- [ ] GDPR/KVKK uyumluluk
- [ ] Kullanıcıya veri export imkanı

---

## 📝 Notlar
- Her görev tamamlandığında [x] ile işaretlenecek
- Eksik kalan görevler düzenli olarak kontrol edilecek
- Her sprint sonunda ilerleme raporu oluşturulacak
