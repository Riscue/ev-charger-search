# EV Charger Search - Backend

Node.js + Express tabanlı, elektrikli araç şarj istasyonu fiyatlarını yöneten REST API sunucusu.

## 📋 Özellikler

- **Modüler Mimari**: Temiz ve ölçeklenebilir kod yapısı
- **Veritabanı Yönetimi**: SQLite3 ile arama kayıtlarını saklama
- **Önbellekleme (Cache)**: Performans için akıllı veri önbellekleme sistemi
- **Admin Panel**: Fiyat yönetimi için güvenli arayüz
- **Arama Paylaşımı**: Arama sonuçlarını paylaşılabilir link olarak kaydetme
- **Güvenlik**: Bcrypt şifreleme ve güvenli authentication
- **Validasyon**: Comprehensive input validation ve sanitization
- **Veri İçe/Dışa Aktarma**: Fiyat verilerini yönetme imkanı

## 🛠️ Teknolojiler

- **Node.js** 24.5
- **Express.js** 5.1.0
- **TypeScript**
- **SQLite3** (veritabanı)
- **bcrypt** (şifreleme)
- **nodemon** (development)

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── config/
│   │   └── environment.ts     # Environment konfigürasyonu ve validasyonu
│   ├── middleware/
│   │   └── auth.ts           # Authentication ve authorization middleware
│   ├── services/
│   │   ├── admin-service.ts  # Admin işlemleri business logic
│   │   └── data-service.ts   # Veri yönetimi ve cache işlemleri
│   ├── utils/
│   │   └── scraper.ts        # External API veri çekme
│   └── server.ts             # Ana sunucu dosyası
├── data/                     # SQLite veritabanı dosyası (oluşturulur)
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Kurulum

### Gereksinimler

- Node.js 24.5+
- npm 9+

### Adımlar

1. **Depoyu klonlayın:**
   ```bash
   git clone <repository-url>
   cd ev-charger-search/backend
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **`.env` dosyasını düzenleyin:**
   ```env
   PORT=4000
   DB_FILE=./data.db
   CACHE_DURATION=24
   ADMIN_DEFAULT_PASSWORD=güvenli-admin-sifreniz
   NODE_ENV=development
   ```

4. **Projeyi derleyin:**
   ```bash
   npm run build
   ```

5. **Sunucuyu başlatın:**
   ```bash
   # Development modunda
   npm run dev

   # Production modunda
   npm start
   ```

## 🌐 API Endpoints

### Public API

#### GET /api/data

Şarj istasyonu fiyat verilerini getirir.

**Query Parameters:**

- `sortField` (string): Sıralama alanı (`name`, `ac`, `dc`)
- `sortOrder` (string): Sıralama yönü (`asc`, `desc`)
- `priceMin` (number): Minimum fiyat filtresi
- `priceMax` (number): Maksimum fiyat filtresi
- `socket` (string): Soket tipi (`AC`, `DC`, `ALL`)
- `criteria` (string[]): Seçili firma adları

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Firma Adı",
      "ac": 10.50,
      "dc": 15.75
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### POST /api/searches

Yeni arama kaydı oluşturur.

**Request Body:**

```json
{
  "name": "Arama Adı",
  "criteria": [
    "Firma1",
    "Firma2"
  ],
  "sortField": "name",
  "sortOrder": "asc",
  "priceMin": 5,
  "priceMax": 20,
  "socket": "AC"
}
```

**Response:**

```json
{
  "shortId": "abc123",
  "name": "Arama Adı",
  "shareUrl": "http://localhost:4000/search/abc123"
}
```

#### GET /api/searches/:shortId

Kayıtlı aramayı getirir.

**Path Parameters:**

- `shortId` (string): Aramanın kısa ID'si

### Admin API

**Authentication**: Basic Authentication

#### GET /api/admin/auth

Authentication kontrolü yapar.

#### GET /api/admin/prices

Tüm fiyatları listeler.

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Firma Adı",
      "ac_price": 10.50,
      "dc_price": 15.75,
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### POST /api/admin/prices

Yeni fiyat ekler.

**Request Body:**

```json
{
  "name": "Yeni Firma",
  "ac_price": 12.00,
  "dc_price": 18.00
}
```

#### PUT /api/admin/prices/:id

Fiyat günceller.

**Path Parameters:**

- `id` (number): Fiyat kaydının ID'si

**Request Body:**

```json
{
  "name": "Güncellenmiş Firma",
  "ac_price": 13.00,
  "dc_price": 19.00
}
```

#### DELETE /api/admin/prices/:id

Fiyat siler.

**Path Parameters:**

- `id` (number): Fiyat kaydının ID'si

#### POST /api/admin/import

External API'den veri içe aktarma preview.

#### POST /api/admin/import/confirm

Veri içe aktarma işlemini onaylar.

**Request Body:**

```json
{
  "selectedData": [
    {
      "name": "Firma Adı",
      "ac": 10.50,
      "dc": 15.75
    }
  ]
}
```

## ⚙️ Environment Değişkenleri

| Değişken                 | Açıklama                        | Default       | Zorunlu           |
|--------------------------|---------------------------------|---------------|-------------------|
| `PORT`                   | Sunucu portu                    | `4000`        | Hayır             |
| `DB_FILE`                | SQLite veritabanı dosya yolu    | `./data.db`   | Hayır             |
| `CACHE_DURATION`         | Veri önbellekleme süresi (saat) | `24`          | Hayır             |
| `ADMIN_DEFAULT_PASSWORD` | Admin şifresi                   | -             | Evet (Production) |
| `NODE_ENV`               | Environment modu                | `development` | Hayır             |

## 🔒 Güvenlik

- **Password Hashing**: Bcrypt ile güvenli şifre saklama
- **Input Validation**: Tüm gelen verilerin validasyonu
- **Environment Security**: Production modunda zorunlu değişken kontrolü
- **Rate Limiting**: API çağrılarını sınırlandırma
- **CORS**: Cross-origin resource sharing konfigürasyonu

## 📊 Veri Yapıları

### PriceDto

```typescript
interface PriceDto {
    id: number;
    name: string;        // Firma adı
    ac?: number;         // AC fiyatı
    dc?: number;         // DC fiyatı
}
```

### AdminPriceDto

```typescript
interface AdminPriceDto {
    id: number;
    name: string;         // Firma adı
    ac_price?: number;    // AC fiyatı
    dc_price?: number;    // DC fiyatı
    updated_at: string;   // Güncelleme tarihi
}
```

### SearchDto

```typescript
interface SearchDto {
    name?: string;        // Arama adı
    shortId: string;      // Kısa unique ID
    criteria: string[];   // Seçili firmalar
    sortField: string;    // Sıralama alanı
    sortOrder: SortOrder; // Sıralama yönü
    priceMin: number;     // Min fiyat
    priceMax: number;     // Max fiyat
    socket: Socket;       // Soket tipi (AC/DC/ALL)
}
```

## 🔄 Cache Sistemi

Backend'de akıllı bir önbellekleme sistemi bulunur:

1. **Veri Akışı:**
    - İlk olarak veritabanı kontrol edilir
    - Veritabanı boşsa external API kullanılır
    - Gelen veriler önbelleğe alınır

2. **Cache Temizleme:**
    - Admin panelinde yapılan değişiklikler otomatik cache temizler
    - Manuel cache temizleme imkanı

3. **Önbellek Süresi:**
    - `CACHE_DURATION` environment değişkeni ile ayarlanır
    - Default 24 saat

## 🧪 Test

```bash
# Testleri çalıştır
npm test

# Test coverage raporu
npm run test:coverage
```

## 📝 Scripts

| Script                  | Açıklama                                        |
|-------------------------|-------------------------------------------------|
| `npm run build`         | TypeScript dosyalarını derler                   |
| `npm start`             | Production modunda sunucuyu başlatır            |
| `npm run dev`           | Development modunda sunucuyu başlatır (nodemon) |
| `npm test`              | Testleri çalıştırır                             |
| `npm run test:watch`    | Testleri watch modunda çalıştırır               |
| `npm run test:coverage` | Test coverage raporu oluşturur                  |
| `npm run lint`          | ESLint kontrolü yapar                           |
| `npm run lint:fix`      | ESLint hatalarını otomatik düzeltir             |

## 🐳 Docker ile Kullanım

```bash
# Build et
docker build -t ev-charger-search-backend .

# Çalıştır
docker run -p 4000:4000 --env-file .env ev-charger-search-backend
```

## 🤝 Contributing

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorular ve öneriler için: [email@example.com]

## 🔗 İlgili Projeler

- **Frontend**: [Frontend Repository](../frontend/)
- **Full Stack**: [Root Repository](../)
