# EV Charger Search

Elektrikli araç şarj istasyonu fiyatlarını karşılaştıran, filtreleme imkanı sunan ve kullanıcıların en uygun şarj
istasyonlarını bulmalarına yardımcı olan modern bir web uygulaması.

## ✨ Özellikler

### 🔍 Kullanıcı Özellikleri

- **Fiyat Karşılaştırma**: Birden fazla şarj istasyonu fiyatını karşılaştırma
- **Gelişmiş Filtreleme**: AC/DC soket tipi, firma adı, fiyat aralığı filtreleri
- **Sıralama Seçenekleri**: Ada göre, fiyata göre (artan/azalan) sıralama
- **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu arayüz
- **Tema Desteği**: Koyu/açık tema seçenekleri
- **Arama Paylaşımı**: Arama sonuçlarını kaydetme ve paylaşma

### 🛠️ Teknik Özellikler

- **Full-Stack**: Node.js backend + React frontend
- **Modern Teknolojiler**: TypeScript, Material-UI, Express.js
- **Veritabanı**: SQLite ile veri saklama ve önbellekleme
- **Admin Paneli**: Fiyat yönetimi ve veri işlemleri
- **API First**: RESTful API mimarisi
- **Containerized**: Docker ile dağıtım desteği

## 🏗️ Mimari

```
ev-charger-search/
├── backend/                    # Node.js + Express API sunucusu
│   ├── src/
│   │   ├── config/            # Environment konfigürasyonu
│   │   ├── middleware/        # Authentication middleware
│   │   ├── services/          # Business logic servisleri
│   │   └── utils/             # Yardımcı araçlar
│   └── package.json
├── frontend/                   # React + Material-UI arayüzü
│   ├── src/
│   │   ├── components/        # React bileşenleri
│   │   ├── page/              # Sayfa bileşenleri
│   │   ├── service/           # API servisleri
│   │   └── theme/             # Material-UI tema yapılandırması
│   └── package.json
├── Dockerfile                 # Multi-stage Docker yapılandırması
├── .gitignore                 # Git ignore dosyası
└── README.md                  # Bu dosya
```

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Node.js** 24.5+
- **npm** 9+
- **Docker** (isteğe bağlı)

### Yöntem 1: Docker ile (Tavsiye Edilen)

```bash
# Projeyi klonlayın
git clone <repository-url>
cd ev-charger-search

# Environment dosyasını oluşturun
echo "PORT=4000" > .env
# .env dosyasını düzenleyin (ADMIN_DEFAULT_PASSWORD admin hesabı oluşması için bir kez verilip sonra silinebilir)

# Docker imajını build edin
docker build -t ev-charger-search .

# Uygulamayı çalıştırın
docker run -p 4000:4000 --env-file .env ev-charger-search
```

Uygulama `http://localhost:4000` adresinde çalışacaktır.

### Yöntem 2: Manuel Kurulum

#### Backend

```bash
cd backend
npm install
npm start
```

#### Frontend (separate development)

```bash
cd frontend
npm install
npm start
```

## 🔗 Uygulama Linkleri

- **Ana Sayfa**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`

## 🛠️ Teknoloji Yığını

### Backend

- **Node.js** 24.5 - JavaScript runtime
- **Express.js** 5.1.0 - Web framework
- **TypeScript** - Type-safe geliştirme
- **SQLite3** - Veritabanı
- **bcrypt** - Şifreleme

### Frontend

- **React** 19.0.0 - UI kütüphanesi
- **Material-UI** 6.3.1 - Component kütüphanesi
- **React Router** 7.1.1 - Client-side routing
- **Axios** - HTTP istekleri
- **TypeScript** - Type-safe geliştirme

### Development

- **Docker** - Containerization
- **Git** - Version control
- **nodemon** - Development server

## 🔧 Kurulum Detayları

### Environment Değişkenleri

Production ortamı için aşağı değişkenleri ayarlamanız gerekir:

```bash
# .env dosyası
PORT=4000
DB_FILE=./data.db
CACHE_DURATION=24
ADMIN_DEFAULT_PASSWORD=güvenli-admin-sifreniz
NODE_ENV=production
```

**Değişkenler:**

- `ADMIN_DEFAULT_PASSWORD`: Admin panel şifresi (admin hesabı oluşması için bir kez verilip sonra silinebilir)
- `PORT`: Sunucu portu (default: 4000)
- `DB_FILE`: SQLite veritabanı yolu (default: ./data.db)
- `CACHE_DURATION`: Önbellekleme süresi saat (default: 24)
- `NODE_ENV`: Environment modu (development/production)

## 🔐 Güvenlik

- **Authentication**: Admin panel için Basic Authentication
- **Password Hashing**: Bcrypt ile güvenli şifre saklama
- **Input Validation**: Tüm kullanıcı girdilerinin validasyonu
- **Environment Security**: Production modunda zorunlu konfigürasyon
- **CORS**: Cross-origin isteklerin güvenli yönetimi

## 📊 Veri Akışı

1. **Veri Kaynakları**: External API ve manuel girişler
2. **Önbellekleme**: SQLite veritabanı ile veri önbellekleme
3. **API Katmanı**: RESTful API ile veri sunumu
4. **Frontend**: React ile modern kullanıcı arayüzü
5. **Real-time**: Admin değişikliklerinin anında yansıması

## 🧪 Test

```bash
# Backend testleri
cd backend
npm test

# Frontend testleri
cd frontend
npm test
```

## 📁 Dosya Yapısı Detayları

### Backend Modülleri

- `config/environment.ts` - Konfigürasyon yönetimi
- `middleware/auth.ts` - Authentication middleware
- `services/admin-service.ts` - Admin işlemleri
- `services/data-service.ts` - Veri yönetimi ve cache
- `utils/scraper.ts` - External API entegrasyonu

### Frontend Bileşenleri

- `components/shared/` - Paylaşılan UI bileşenleri
- `components/admin/` - Admin panel bileşenleri
- `page/` - Sayfa seviyesi bileşenler
- `theme/` - Material-UI tema yapılandırması

## 🚀 Deployment

### Production Deployment

1. **Sunucu Hazırlığı:**
   ```bash
   # Sunucuya git
   git clone <repository-url>
   cd ev-charger-search
   ```

2. **Docker ile Deployment:**
   ```bash
   docker build -t ev-charger-search .
   docker run -d -p 4000:4000 --name ev-charger --env-file .env ev-charger-search
   ```

3. **Reverse Proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:4000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Monitoring

- Uygulama logları: `docker logs ev-charger`
- Health check: `GET /api/data`
- Admin panel: `http://your-domain.com/admin`

## 🔗 İlgili Linkler

- **Backend Dokümantasyonu**: [backend/README.md](./backend/README.md)
- **Frontend Dokümantasyonu**: [frontend/README.md](./frontend/README.md)

---

**EV Charger Search** - Elektrikli araç sahipleri için en iyi şarj deneyimi 🚗⚡
