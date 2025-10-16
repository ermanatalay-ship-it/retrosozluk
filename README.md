# Retrosözlük

Retrosözlük, kullanıcıların başlıklar altında entry paylaşabildiği, topluluk tabanlı bir sözlük platformudur. Bu depo, hem frontend hem de backend bileşenlerini içerir. Proje genel olarak JavaScript ile geliştirilmiştir ve HTML ile CSS de önemli oranda kullanılmaktadır.

## İçerik ve Yapı

Ana klasörler ve dosyalar:
- `backend/`  
  - `server.js` — Sunucu uygulamasının ana dosyası.  
  - `package.json` — Proje bağımlılıkları ve betikleri.
  - `db.sqlite` — SQLite veritabanı dosyası.
  - `public/` — Statik dosyalar (frontend).
- (Varsa diğer klasörler ve frontend kaynakları, kendi yapılandırmanıza göre ekleyebilirsiniz.)

## Kurulum

### Gereksinimler

- Node.js (>=14.x)
- npm (Node Package Manager)

### Adımlar

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/ermanatalay-ship-it/retrosozluk.git
   cd retrosozluk/backend
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Sunucuyu başlatın:
   ```bash
   npm start
   ```
   veya
   ```bash
   node server.js
   ```

4. Uygulamayı varsayılan olarak `http://localhost:3000` adresinde görebilirsiniz.

## Özellikler

- Entry ekleme, güncelleme ve silme
- Başlıklar altında içerik gezintisi
- Statik frontend servisi
- SQLite veritabanı ile veri saklama

## Katkı Sağlama

Katkıda bulunmak için lütfen fork oluşturun, yeni bir dalda değişiklik yapın ve pull request gönderin.

## Lisans

Bu proje için bir lisans belirtilmemiştir. Kullanım koşulları için depo sahibine ulaşabilirsiniz.

---

**Teknoloji oranları:**  
- JavaScript: %68.3  
- HTML: %18.9  
- CSS: %12.8  
