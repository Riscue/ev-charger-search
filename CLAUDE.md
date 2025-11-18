# EV Charger Search

Elektrikli araç şarj istasyonu fiyatlarını karşılaştıran ve filtreleme imkanı sunan bir web uygulaması.

## Proje Yapısı

Bu proje, frontend ve backend olmak üzere iki ana kısımdan oluşur:

```
ev-charger-search/
├── backend/                    # Node.js + Express API sunucusu
│   ├── src/
│   │   ├── config/            # Environment konfigürasyonu
│   │   ├── middleware/        # Authentication middleware
│   │   ├── services/          # Business logic servisleri
│   │   ├── utils/             # Yardımcı araçlar
│   │   └── server.ts          # Ana sunucu dosyası
│   └── package.json
├── frontend/                   # React + Material-UI arayüzü
│   ├── src/
│   │   ├── components/
│   │   │   └── admin/        # Admin panel bileşenleri
│   │   ├── page/             # Sayfa bileşenleri
│   │   ├── service/          # API servisleri
│   │   └── dto/              # TypeScript tanımlamaları
│   └── package.json
├── Dockerfile                 # Multi-stage Docker yapılandırması
└── .gitignore                 # Git ignore dosyası
```

## Backend (Node.js + Express)

**Teknolojiler:**
- Node.js 24.5
- Express.js 5.1.0
- TypeScript
- SQLite3 (veritabanı)
- bcrypt (şifreleme ve authentication)

**Özellikler:**
- Modüler mimari ile daha yönetilebilir kod yapısı
- SQLite veritabanı ile arama kayıtlarını saklama
- Veritabanı tabanlı fiyat yönetimi (manuel ve otomatik)
- Gelişmiş önbellekleme (cache) mekanizması
- Arama sonuçlarını paylaşılabilir link olarak kaydetme
- Güvenli Basic Authentication sistemi
- Veri içe/dışa aktarma özelliği
- Comprehensive input validation ve sanitization
- Environment değişkeni validasyonu
- Graceful shutdown handling

**API Endpoints:**
- `GET /api/data` - Şarj istasyonu fiyat verilerini getirir
- `POST /api/searches` - Yeni arama kaydı oluşturur
- `GET /api/searches/:shortId` - Kayıtlı aramayı getirir

**Admin API Endpoints:**
- `GET /api/admin/auth` - Authentication kontrolü
- `GET /api/admin/prices` - Tüm fiyatları listeler
- `POST /api/admin/prices` - Yeni fiyat ekler
- `PUT /api/admin/prices/:id` - Fiyat günceller
- `DELETE /api/admin/prices/:id` - Fiyat siler
- `POST /api/admin/import` - Veri içe aktarma preview
- `POST /api/admin/import/confirm` - Veri içe aktarma onayı

**Environment Değişkenleri:**
- `PORT` - Sunucu portu (default: 4000)
- `DB_FILE` - SQLite veritabanı dosya yolu (default: ./data.db)
- `CACHE_DURATION` - Veri önbellekleme süresi (default: 24 saat)
- `ADMIN_DEFAULT_PASSWORD` - Admin şifresi (production için zorunlu)
- `NODE_ENV` - Environment modu (development/production/test)

## Frontend (React + Material-UI)

**Teknolojiler:**
- React 19.0.0
- TypeScript
- Material-UI (MUI) 6.3.1
- React Router DOM 7.1.1
- Axios (HTTP istekleri)
- Day.js (tarih işlemleri)

**Özellikler:**
- Responsive tasarım ve mobil uyumluluk
- Koyu/açık tema desteği
- Firma adına göre arama ve filtreleme
- AC/DC soket tipi filtreleme
- Fiyat aralığı filtreleme (slider ile)
- Çoklu sıralama seçenekleri
- Arama sonuçlarını kaydetme ve paylaşma
- Modern ve kullanıcı dostu arayüz

**Bileşenler:**
- `PageHome.tsx` - Ana sayfa ve arama arayüzü
- `CustomTable.tsx` - Özelleştirilebilir veri tablosu
- `AppTheme.tsx` - Tema yapılandırması

**Admin Panel Bileşenleri:**
- `PageAdmin.tsx` - Admin panel ana bileşeni (~230 satır, refactor edilmiş)
- `AdminAuth.tsx` - Authentication ve giriş formu
- `PriceTable.tsx` - Fiyat tablosu ve yönetimi
- `PriceForm.tsx` - Fiyat ekleme/düzenleme formu
- `ImportDialog.tsx` - Veri içe aktarma diyaloğu

**Admin Panel Özellikleri:**
- Güvenli Basic Authentication
- Fiyat ekleme/düzenleme/silme işlemleri
- Veri içe aktarma ve önizleme
- Seçili verileri toplu işleme
- Modern Material-UI arayüzü
- Real-time veri güncelleme ve cache temizleme
- Comprehensive form validasyonu
- Toast notifications ve error handling

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

**AdminPriceDto:**
```typescript
{
  id: number,
  name: string,         // Firma adı
  ac_price?: number,    // AC fiyatı
  dc_price?: number,    // DC fiyatı
  updated_at: string    // Güncelleme tarihi
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
   ADMIN_DEFAULT_PASSWORD=güvenli-admin-sifreniz
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
   - Veriler SQLite'da önbelleğe alınır (configurable süre)
   - Kullanıcı filtreleri uygulanır ve sonuçlar gösterilir

2. **Admin Panel:**
   - Basic Authentication ile güvenli giriş
   - Fiyat verilerini doğrudan veritabanında yönetir
   - Veri içe/dışa aktarma işlemleri
   - Değişiklikler anında cache temizlenir ve ana sayfaya yansır

3. **Cache Sistemi:**
   - DataService ile yönetilen akıllı cache
   - Admin değişiklikleri otomatik cache temizleme
   - Manuel fiyat girişi her zaman önceliklidir
   - Configurable cache süreleri

4. **Security:**
   - Environment-based configuration
   - Input validation ve sanitization
   - Secure password hashing (bcrypt)
   - Production mode security checks

## Admin Panel Kullanımı

1. `http://localhost:4000/admin` adresine gidin
2. Admin kullanıcı adı ve şifrenizle giriş yapın (ADMIN_DEFAULT_PASSWORD environment değişkeni)
3. Fiyatları yönetin:
   - **Fiyat Ekle**: "+" butonu ile yeni firma ve fiyat ekleme
   - **Fiyat Düzenle**: Tablodan kaydı seçip düzenleme
   - **Fiyat Sil**: Kaydı silme (onay gerekli)
   - **Veri İçe Aktar**: External API'den veri çekme ve önizleme
   - **Toplu İşlemler**: Seçili verileri import etme

## Geliştirme ve Refactoring

### Code Quality İyileştirmeleri:
- **Backend**: 390+ satırdan ~250 satıra indirgenen ana server dosyası
- **Frontend**: 740+ satırdan ~230 satıra indirgenen admin paneli
- **Modüler Mimari**: Ayrı servis, middleware ve utility katmanları
- **Type Safety**: Geliştirilmiş TypeScript tipleri ve validasyon
- **Error Handling**: Tutarlı ve kullanıcı dostu hata mesajları

### Backend Modülleri:
- `config/environment.ts` - Environment validasyonu ve konfigürasyon
- `middleware/auth.ts` - Authentication ve authorization
- `services/admin-service.ts` - Admin işlemleri business logic'i
- `utils/data-service.ts` - Veri yönetimi ve cache

### Frontend Bileşenleri:
- `AdminAuth.tsx` - Authentication component'i
- `PriceTable.tsx` - Fiyat tablosu ve CRUD işlemleri
- `PriceForm.tsx` - Form validasyonu ve submit işlemleri
- `ImportDialog.tsx` - Veri içe aktarma ve önizleme

## Önemli Notlar

- Proje Türkçe dilinde geliştirilmiştir
- **Production için zorunlu**: `ADMIN_DEFAULT_PASSWORD` environment değişkeni set edilmeli
- Tüm environment değişkenleri validation'dan geçirilir
- Veritabanı tabanlı fiyat yönetimi ile manuel kontrol mümkündür
- Modüler mimari sayesinde kolayca genişletilebilir
- Cache sistemi ile high performans garanti edilir
- Comprehensive error handling ve logging
