# 🎯 AdManager Pro - Reklam Yönetim Sistemi

Modern, güvenli ve kullanıcı dostu reklam yönetim platformu.

## 📋 İçindekiler

- [Teknolojiler](#-teknolojiler)
- [Özellikler](#-özellikler)
- [Gereksinimler](#-gereksinimler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Demo Hesaplar](#-demo-hesaplar)

## 🚀 Teknolojiler

### Backend
- **NestJS** (v10) - Node.js framework
- **TypeScript** - Tip güvenliği
- **MongoDB** - NoSQL veritabanı
- **Mongoose** - MongoDB ODM
- **JWT** - Token tabanlı authentication
- **Bcrypt** - Şifre hashleme
- **Swagger/OpenAPI** - API dokümantasyonu

### Frontend
- **Next.js** (v16) - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS
- **React Hooks** - State yönetimi

## ✨ Özellikler

### Admin Paneli
- 👥 **Kullanıcı Yönetimi**
  - Kullanıcı listesi görüntüleme
  - Yeni kullanıcı oluşturma
  - Kullanıcı bilgilerini düzenleme
  - Kullanıcı silme
  - Rol yönetimi (Admin, Manager, User)
  - Son giriş/çıkış takibi

- 📊 **Dashboard**
  - Gerçek zamanlı istatistikler
  - Toplam kullanıcı sayısı
  - Aktif kullanıcı sayısı

- 🔐 **Güvenlik**
  - JWT token authentication
  - Şifreli parola depolama
  - Role-based access control

### Kullanıcı Deneyimi
- 🎨 Modern ve responsive tasarım
- 🔔 Toast bildirim sistemi
- 🎯 Kolay navigasyon
- ⚡ Hızlı ve akıcı arayüz

## 📦 Gereksinimler

Projeyi çalıştırmak için sisteminizde aşağıdakiler kurulu olmalıdır:

- **Node.js** (v18 veya üzeri)
- **npm** veya **yarn**
- **MongoDB** (v6 veya üzeri)

## 🔧 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd "fatih terim"
```

### 2. MongoDB'yi Başlatın

MongoDB'nin çalıştığından emin olun:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 3. Backend Kurulumu

```bash
# Backend dizinine gidin
cd nestjs-backend

# Bağımlılıkları yükleyin
npm install

# Demo kullanıcıları oluşturun
npx ts-node src/seed.ts

# Backend'i başlatın
npm run start
```

Backend şu adreste çalışacak: **http://localhost:3000**

### 4. Frontend Kurulumu

Yeni bir terminal penceresi açın:

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Frontend'i başlatın
npm run dev
```

Frontend şu adreste çalışacak: **http://localhost:3001**

## 🎮 Kullanım

### Giriş Yapmak

1. Tarayıcınızda **http://localhost:3001** adresine gidin
2. Ana sayfada **"Giriş Yap"** butonuna tıklayın
3. Demo hesaplardan biriyle giriş yapın (aşağıya bakın)

### Admin Paneli

Admin hesabıyla giriş yaptıktan sonra:

- **Dashboard**: Sistem istatistiklerini görüntüleyin
- **Kullanıcılar**: Kullanıcı yönetimi işlemlerini yapın
- Sol menüden sayfalar arası geçiş yapın
- Çıkış yapmak için sol menünün altındaki **"Çıkış Yap"** butonunu kullanın

## 🔑 Demo Hesaplar

### Admin Hesabı
```
Email: admin@admanager.com
Şifre: admin123
```

### Manager Hesabı
```
Email: manager@admanager.com
Şifre: manager123
```

### User Hesabı
```
Email: demo@admanager.com
Şifre: demo123
```

## 📚 API Dokümantasyonu

Backend çalıştıktan sonra Swagger dokümantasyonuna erişebilirsiniz:

**URL:** http://localhost:3000/api

### Ana Endpoint'ler

#### Authentication
- `POST /auth/login` - Kullanıcı girişi

#### Users
- `GET /users` - Tüm kullanıcıları listele
- `GET /users/:id` - Belirli bir kullanıcıyı getir
- `POST /users` - Yeni kullanıcı oluştur
- `PUT /users/:id` - Kullanıcı bilgilerini güncelle
- `DELETE /users/:id` - Kullanıcıyı sil

## 🗂️ Proje Yapısı

```
fatih terim/
├── nestjs-backend/          # Backend (NestJS)
│   ├── src/
│   │   ├── auth/           # Authentication modülü
│   │   ├── users/          # Kullanıcı modülü
│   │   │   ├── dto/        # Data Transfer Objects
│   │   │   ├── user.schema.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.controller.ts
│   │   ├── seed.ts         # Veritabanı seed
│   │   └── main.ts         # Uygulama giriş noktası
│   └── package.json
│
├── frontend/               # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/      # Admin sayfaları
│   │   │   │   ├── dashboard/
│   │   │   │   └── users/
│   │   │   ├── login/      # Login sayfası
│   │   │   └── page.tsx    # Ana sayfa
│   │   └── components/
│   │       └── AdminSidebar.tsx
│   └── package.json
│
└── README.md              # Bu dosya
```

## 🛠️ Geliştirme Komutları

### Backend
```bash
# Geliştirme modu
npm run start

# Watch mode (otomatik yeniden başlatma)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Frontend
```bash
# Geliştirme modu
npm run dev

# Production build
npm run build
npm run start
```

## 🔄 Veritabanını Sıfırlama

Demo kullanıcıları yeniden oluşturmak için:

```bash
cd nestjs-backend
npx ts-node src/seed.ts
```

## 🐛 Sorun Giderme

### Backend başlamıyor
- MongoDB'nin çalıştığından emin olun
- Port 3000'in kullanılmadığından emin olun

### Frontend başlamıyor
- Port 3001'in kullanılmadığından emin olun
- `node_modules` klasörünü silip `npm install` yapın

### Kullanıcılar yüklenmiyor
- Backend'in çalıştığından emin olun
- Tarayıcı konsolunda hataları kontrol edin
- Backend'i yeniden başlatın

## 📝 Notlar

- Development ortamında CORS izinleri aktif
- JWT secret production'da environment variable olmalı
- MongoDB bağlantısı `localhost:27017/admanager_db`

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 👥 İletişim

Proje Sahibi - AdManager Pro Team

---

⭐ **Beğendiyseniz yıldız vermeyi unutmayın!**
