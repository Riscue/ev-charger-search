# EV Charger Search - Frontend

React + Material-UI tabanlı, elektrikli araç şarj istasyonu fiyatlarını karşılaştıran modern ve kullanıcı dostu web
arayüzü.

## 📋 Özellikler

- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz
- **Gelişmiş Filtreleme**: Firma adı, soket tipi, fiyat aralığı filtreleri
- **Sıralama Seçenekleri**: Çoklu sıralama kriterleri
- **Arama Paylaşımı**: Arama sonuçlarını kaydetme ve paylaşma
- **Admin Paneli**: Fiyat yönetimi için güvenli arayüz
- **TypeScript**: Type-safe geliştirme deneyimi

## 🛠️ Teknolojiler

- **React** 19.0.0
- **TypeScript**
- **Material-UI (MUI)** 6.3.1
- **React Router DOM** 7.1.1
- **Axios** (HTTP istekleri)

## 📁 Proje Yapısı

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── shared/              # Paylaşılan bileşenler
│   │   │   ├── ConfirmButton.tsx
│   │   │   ├── CustomTable.tsx
│   │   │   └── CustomDateFormat.tsx
│   │   └── admin/               # Admin panel bileşenleri
│   │       ├── AdminAuth.tsx    # Authentication
│   │       ├── PriceForm.tsx    # Fiyat formu
│   │       ├── PriceTable.tsx   # Fiyat tablosu
│   │       └── ImportDialog.tsx # Veri içe aktarma
│   ├── page/
│   │   ├── PageHome.tsx         # Ana sayfa
│   │   └── PageAdmin.tsx        # Admin paneli
│   ├── service/
│   │   └── api.ts               # API servisleri
│   ├── dto/
│   │   ├── types.ts             # TypeScript tipleri
│   │   └── constants.ts         # Sabitler
│   ├── theme/
│   │   ├── AppTheme.tsx         # Ana tema yapılandırması
│   │   ├── ColorModeSelect.tsx  # Tema seçici
│   │   └── customizations/      # MUI özelleştirmeleri
│   ├── utils/
│   │   └── number-utils.ts      # Sayı formatlama araçları
│   ├── App.tsx                  # Ana uygulama bileşeni
│   └── index.tsx                # Uygulama giriş noktası
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm 8+

### Adımlar

1. **Depoyu klonlayın:**
   ```bash
   git clone <repository-url>
   cd ev-charger-search/frontend
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Development sunucusunu başlatın:**
   ```bash
   npm start
   ```

   Uygulama `http://localhost:3000` adresinde açılacaktır.

4. **Production build'i oluşturun:**
   ```bash
   npm run build
   ```

## 🎨 Tema Özelleştirme

Uygulama, Material-UI temel alınarak özelleştirilmiştir:

### Tema Özellikleri

- **Renk Paleti**: Mavi tonlarda ana renk, açık/koyu mod desteği
- **Tipografi**: Modern ve okunaklı font ailesi
- **Bileşenler**: Özel buton, form ve tablo stilleri

### Tema Dosyaları

- `theme/AppTheme.tsx`: Ana tema konfigürasyonu
- `theme/customizations/`: MUI bileşen özelleştirmeleri
- `theme/ColorModeSelect.tsx`: Tema değiştirme bileşeni

## 🌐 Ana Sayfa Bileşenleri

### PageHome.tsx

Ana arayüz ve arama fonksiyonları:

**Özellikler:**

- Firma adına göre arama
- AC/DC soket tipi filtreleme
- Fiyat aralığı slider filtresi
- Çoklu sıralama seçenekleri
- Arama sonuçlarını kaydetme
- Paylaşılabilir link oluşturma

**Filtreleme Seçenekleri:**

- **Firma Filtresi**: Çoklu firma seçimi
- **Soket Tipi**: AC, DC, veya HEPSİ
- **Fiyat Aralığı**: Min/max fiyat slider
- **Sıralama**: Ada göre, fiyata göre (artan/azalan)

### CustomTable.tsx

Özelleştirilebilir veri tablosu bileşeni:

**Özellikler:**

- Responsive tasarım
- Sıralama desteği
- Sayfalama
- Hover efektleri
- Mobil uyumlu görünüm

## 🔐 Admin Paneli

### PageAdmin.tsx

Fiyat yönetimi ve veri işlemleri:

**Authentication:**

- Basic Authentication ile güvenli giriş
- Session management
- Otomatik logout

**Fiyat Yönetimi:**

- Yeni fiyat ekleme
- Mevcut fiyatları düzenleme
- Fiyat silme (onay dialog ile)
- Toplu işlemler

**Veri İçe Aktarma:**

- External API'den veri çekme
- Önizleme ve seçim imkanı
- Toplu import işlemi

### Admin Bileşenleri

#### AdminAuth.tsx

Authentication ve giriş formu:

- Kullanıcı adı/şifre giriş
- Error handling
- Loading states

#### PriceForm.tsx

Fiyat ekleme/düzenleme formu:

- Form validasyonu
- Auto-complete firma önerileri
- AC/DC fiyat girişi
- Submit handling

#### PriceTable.tsx

Fiyat verileri tablosu:

- Veri listeleme
- Satır seçimi
- Düzenleme/silme işlemleri
- Real-time güncelleme

#### ImportDialog.tsx

Veri içe aktarma diyaloğu:

- External API veri çekme
- Önizleme gösterimi
- Seçili verileri import
- Progress indicator

## 📊 Veri Tipleri

### PriceDto

```typescript
interface PriceDto {
    id: number;
    name: string;    // Firma adı
    ac?: number;     // AC fiyatı
    dc?: number;     // DC fiyatı
}
```

### SearchCriteria

```typescript
interface SearchCriteria {
    name?: string;        // Arama adı
    criteria: string[];   // Seçili firmalar
    sortField: string;    // Sıralama alanı
    sortOrder: SortOrder; // Sıralama yönü
    priceMin: number;     // Min fiyat
    priceMax: number;     // Max fiyat
    socket: Socket;       // Soket tipi
}
```

### FilterState

```typescript
interface FilterState {
    searchTerm: string;    // Arama terimi
    selectedSocket: string; // Seçili soket tipi
    priceRange: [number, number]; // Fiyat aralığı
    sortField: string;     // Sıralama alanı
    sortOrder: 'asc' | 'desc'; // Sıralama yönü
}
```

## 🔧 API Entegrasyonu

### API Servisi (`service/api.ts`)

Backend API ile iletişim için merkezi servis:

**Fonksiyonlar:**

- `fetchPrices()`: Fiyat verilerini çek
- `createSearch()`: Yeni arama kaydı oluştur
- `getSearchById()`: Arama detaylarını getir
- Admin API fonksiyonları

**Error Handling:**

- Axios interceptors
- Global error handling

## 🎯 Kullanıcı Akışı

### Arama Akışı

1. Kullanıcı ana sayfaya gelir
2. Firma adı veya filtreleri kullanarak arama yapar
3. Sonuçlar tabloda gösterilir
4. Filtreleme ve sıralama ile sonuçları iyileştirir
5. İsteğe bağlı olarak aramayı kaydedip paylaşabilir

### Admin Akışı

1. Admin paneline giriş yapar (`/admin`)
2. Authentication ile güvenlik doğrulanır
3. Fiyatları yönetir (ekle/düzenle/sil)
4. External API'den veri içe aktarabilir
5. Değişiklikler anında ana sayfaya yansır

## 🎨 UI/UX Özellikleri

### Responsive Design

- **Mobil**: 320px ve üstü
- **Tablet**: 768px ve üstü
- **Desktop**: 1024px ve üstü

### Tema Seçenekleri

- **Açık Tema**: Parlak ve ferah görünüm
- **Koyu Tema**: Göz yorgunluğunu azaltan görünüm
- **Otomatik**: Sistem tercihine göre geçiş

### Etkileşim

- **Hover Efektleri**: Buton ve satır hover
- **Loading States**: Spinner ve skeleton loading
- **Confirm Dialogs**: Kritik işlemler için onay

## 📝 Scripts

| Script          | Açıklama                        |
|-----------------|---------------------------------|
| `npm start`     | Development sunucusunu başlatır |
| `npm run build` | Production build'i oluşturur    |

## 🎯 Browser Desteği

| Browser | Minimum Sürüm |
|---------|---------------|
| Chrome  | 88+           |
| Firefox | 85+           |
| Safari  | 14+           |
| Edge    | 88+           |

## 🔗 Development Proxy

Development modunda API çağrıları `package.json`'da tanımlanan proxy üzerinden yönlendirilir:

```json
{
  "proxy": "http://localhost:3000"
}
```

Bu sayede CORS sorunları olmadan backend API ile iletişim kurulur.

## 🐳 Docker ile Kullanım

Frontend, full-stack Docker imajı içinde çalışır:

```bash
# Ana dizinden build ve çalıştır
docker build -t ev-charger-search .
docker run -p 3000:3000 ev-charger-search
```

## 📄 Kod Standartları

- **TypeScript**: Strict mode aktif
- **ESLint**: React ve TypeScript kuralları
- **Prettier**: Kod formatlama
- **Components**: Functional components with hooks
- **Props**: TypeScript interface tanımlamaları

## 🔗 İlgili Projeler

- **Backend**: [Backend Repository](../backend/)
- **Full Stack**: [Root Repository](../)
