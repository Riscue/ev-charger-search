# EV Charger Search

Elektrikli araç şarj istasyonu fiyatlarını karşılaştıran ve filtreleme imkanı sunan bir web uygulaması.

## Proje Yapısı

Bu proje, frontend ve backend olmak üzere iki ana kısımdan oluşur:

```
ev-charger-search/
├── backend/           # Node.js + Express API sunucusu
├── frontend/          # React + Material-UI arayüzü
├── Dockerfile         # Multi-stage Docker yapılandırması
└── .gitignore         # Git ignore dosyası
```

## Backend (Node.js + Express)

**Teknolojiler:**
- Node.js 24.5
- Express.js 5.1.0
- TypeScript
- SQLite3 (veritabanı)
- node-fetch (API istekleri)
- bcrypt (şifreleme)
- JWT (authentication - temporary simple token)

**Özellikler:**
- SQLite veritabanı ile arama kayıtlarını saklama
- Dış API'den şarj istasyonu verilerini çekme
- Veri önbellekleme (cache) mekanizması
- Arama sonuçlarını paylaşılabilir link olarak kaydetme
- Admin paneli ile fiyat güncelleme ve yönetimi
- Güvenli authentication sistemi
- Veritabanı tabanlı fiyat yönetimi

**API Endpoints:**
- `GET /api/data` - Şarj istasyonu fiyat verilerini getirir
- `POST /api/searches` - Yeni arama kaydı oluşturur
- `GET /api/searches/:shortId` - Kayıtlı aramayı getirir

**Admin API Endpoints:**
- `POST /api/admin/login` - Admin girişi
- `POST /api/admin/verify` - Token doğrulama
- `GET /api/admin/prices` - Tüm fiyatları listeler
- `POST /api/admin/prices` - Yeni fiyat ekler
- `PUT /api/admin/prices/:id` - Fiyat günceller
- `DELETE /api/admin/prices/:id` - Fiyat siler

**Environment Değişkenleri:**
- `PORT` - Sunucu portu (default: 4000)
- `DB_FILE` - SQLite veritabanı dosya yolu (default: ./data.db)
- `CACHE_DURATION` - Veri önbellekleme süresi (default: 24 saat)
- `ADMIN_TOKEN` - Admin şifresi (production için güçlendirilmeli)
- `JWT_SECRET` - JWT secret anahtarı
- `JWT_EXPIRES_IN` - Token süresi (default: 8h)

## Frontend (React + Material-UI)

**Teknolojiler:**
- React 19.0.0
- TypeScript
- Material-UI (MUI) 6.3.1
- React Router DOM 7.1.1
- Axios (HTTP istekleri)
- Day.js (tarih işlemleri)

**Özellikler:**
- responsive tasarım
- Koyu/açık tema desteği
- Firma adına göre arama ve filtreleme
- AC/DC soket tipi filtreleme
- Fiyat aralığı filtreleme (slider ile)
- Çoklu sıralama seçenekleri
- Arama sonuçlarını kaydetme ve paylaşma
- Kolay kullanımlı arayüz (accordion menü)
- Admin paneli ile fiyat yönetimi

**Bileşenler:**
- `PageHome.tsx` - Ana sayfa ve arama arayüzü
- `PageAdmin.tsx` - Admin paneli ve fiyat yönetimi
- `CustomTable.tsx` - Özelleştirilebilir veri tablosu
- `AppTheme.tsx` - Tema yapılandırması

**Admin Panel Özellikleri:**
- Güvenli şifre ile giriş
- Fiyat ekleme/düzenleme/silme
- Modern Material-UI arayüzü
- Real-time veri güncelleme
- Otomatik token yenileme

## Veri Yapısı

**PriceDto:**
```typescript
{
  id: number,
  name: string,    // Firma adı
  ac?: number,     // AC fiyatı
  dc?: number      // DC fiyatı
}
```

**SearchDto:**
```typescript
{
  name?: string,        // Arama adı
  shortId: string,      // Kısa unique ID
  criteria: string[],   // Seçili firmalar
  sortField: string,    // Sıralama alanı
  sortOrder: SortOrder, // Sıralama yönü
  priceMin: number,     // Min fiyat
  priceMax: number,     // Max fiyat
  socket: Socket        // Soket tipi (AC/DC/ALL)
}
```

## Kurulum ve Çalıştırma

### Geliştirme Ortamı

**Backend:**
```bash
cd backend
npm install
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Docker ile Dağıtım

```bash
docker build -t ev-charger-search .
docker run -p 4000:4000 ev-charger-search
```

## Deployment

Uygulama production ortamında tek bir Node.js sunucusu olarak çalışır:
- Backend API sunucusu 4000 portunda çalışır
- Frontend build dosyaları backend tarafından sunulur
- Tüm istekler tek bir sunucu tarafından yönetilir

**Production Setup:**
1. `.env.example` dosyasını kopyalayıp `.env` oluşturun:
   ```bash
   cp .env.example .env
   ```

2. Güvenli değişkenleri belirleyin:
   ```bash
   ADMIN_TOKEN=güvenli-admin-sifreniz
   JWT_SECRET=uzun-guvenli-jwt-anahtari-en-az-32-karakter
   ```

3. Build ve deploy:
   ```bash
   docker build -t ev-charger-search .
   docker run -p 4000:4000 --env-file .env ev-charger-search
   ```

## Veri Akışı

1. **Ana Sayfa:**
   - Frontend kullanıcı etkileşimlerini yakalar
   - Backend `/api/data` endpoint'i ile verileri çeker
   - Önce veritabanı kontrol edilir, boşsa dış API kullanılır
   - Veriler SQLite'da önbelleğe alınır (24 saat)
   - Kullanıcı filtreleri uygulanır ve sonuçlar gösterilir

2. **Admin Panel:**
   - Şifre ile güvenli giriş
   - Fiyat verilerini doğrudan veritabanında yönetir
   - Değişiklikler anında ana sayfaya yansır

3. **Cache Sistemi:**
   - Admin değişiklikleri cache'i temizler
   - Manuel fiyat girişi önceliklidir

## Admin Panel Kullanımı

1. `http://localhost:4000/admin` adresine gidin
2. Default şifre: `admin123` (production'da değiştirin!)
3. Fiyatları yönetin:
   - Yeni firma ve fiyat ekleme
   - Mevcut fiyatları düzenleme
   - Fiyat silme
   - Real-time güncelleme

## Önemli Notlar

- Proje Türkçe dilinde geliştirilmiştir
- Admin paneli için güçlü şifre kullanın
- Production ortamında JWT_SECRET ve ADMIN_TOKEN mutlaka değiştirilmeli
- Veritabanı tabanlı fiyat yönetimi sayesinde Manuel kontrol mümkündür
- Cache sistemi ile performans optimize edilmiştir