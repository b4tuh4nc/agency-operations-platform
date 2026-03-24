# 🚀 Kurulum Rehberi - Sıfırdan Başlangıç

Bu rehber, bilgisayarınızı sıfırladıktan sonra uygulamayı çalıştırmak için gereken tüm adımları içerir.

## 📦 1. Gerekli Yazılımları Yükleyin

### Node.js Kurulumu

1. **Node.js İndirin:**
   - Tarayıcınızda https://nodejs.org/ adresine gidin
   - **LTS (Long Term Support)** sürümünü indirin (önerilen: v20.x veya üzeri)
   - İndirilen `.msi` dosyasını çalıştırın

2. **Kurulumu Tamamlayın:**
   - Kurulum sihirbazını takip edin
   - Varsayılan ayarları kabul edin
   - Kurulum tamamlandıktan sonra bilgisayarınızı yeniden başlatın

3. **Kurulumu Kontrol Edin:**
   - PowerShell veya CMD'yi açın
   - Şu komutları çalıştırın:
   ```bash
   node --version
   npm --version
   ```
   - Her iki komut da bir versiyon numarası göstermelidir (örnek: v20.10.0)

### MongoDB Kurulumu

1. **MongoDB İndirin:**
   - Tarayıcınızda https://www.mongodb.com/try/download/community adresine gidin
   - **Windows** için MongoDB Community Server'ı seçin
   - En son sürümü (v7.x veya v6.x) indirin

2. **MongoDB'yi Kurun:**
   - İndirilen `.msi` dosyasını çalıştırın
   - Kurulum tipi olarak **"Complete"** seçin
   - **"Install MongoDB as a Service"** seçeneğini işaretleyin
   - **"Install MongoDB Compass"** seçeneğini de işaretleyin (veritabanı görüntüleme aracı)
   - Kurulumu tamamlayın

3. **MongoDB Servisini Kontrol Edin:**
   - Windows tuşu + R tuşlarına basın
   - `services.msc` yazın ve Enter'a basın
   - Listede **"MongoDB"** servisini bulun
   - Durumunun **"Çalışıyor"** olduğundan emin olun
   - Eğer çalışmıyorsa, sağ tıklayıp **"Başlat"** seçeneğini seçin

## 🔧 2. Projeyi Hazırlayın

### Proje Klasörüne Gidin

PowerShell veya CMD'de proje klasörünüze gidin:

```bash
cd "C:\Users\Batuh\Desktop\fatih terim"
```

## 📥 3. Backend Kurulumu

1. **Backend klasörüne gidin:**
   ```bash
   cd nestjs-backend
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```
   Bu işlem birkaç dakika sürebilir. Tüm paketlerin yüklendiğinden emin olun.

3. **Demo kullanıcıları oluşturun:**
   ```bash
   npx ts-node src/seed.ts
   ```
   Bu komut veritabanına demo kullanıcıları ekler.

4. **Backend'i başlatın:**
   ```bash
   npm run start:dev
   ```
   Backend başarıyla başladığında şu mesajı göreceksiniz:
   ```
   Uygulama http://localhost:3000 adresinde çalışıyor
   Swagger dokümantasyonu: http://localhost:3000/api
   ```

## 🎨 4. Frontend Kurulumu

**YENİ BİR TERMİNAL PENCERESİ AÇIN** (Backend çalışırken)

1. **Proje ana klasörüne gidin:**
   ```bash
   cd "C:\Users\Batuh\Desktop\fatih terim"
   ```

2. **Frontend klasörüne gidin:**
   ```bash
   cd frontend
   ```

3. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```
   Bu işlem birkaç dakika sürebilir.

4. **Frontend'i başlatın:**
   ```bash
   npm run dev
   ```
   Frontend başarıyla başladığında şu mesajı göreceksiniz:
   ```
   ▲ Next.js 16.0.1
   - Local:        http://localhost:3001
   ```

## ✅ 5. Uygulamayı Kullanın

1. Tarayıcınızda **http://localhost:3001** adresine gidin
2. Ana sayfada **"Giriş Yap"** butonuna tıklayın
3. Demo hesaplardan biriyle giriş yapın:

### Demo Hesaplar

**Admin Hesabı:**
- Email: `admin@admanager.com`
- Şifre: `admin123`

**Manager Hesabı:**
- Email: `manager@admanager.com`
- Şifre: `manager123`

**User Hesabı:**
- Email: `demo@admanager.com`
- Şifre: `demo123`

## 🐛 Sorun Giderme

### PowerShell Script Çalıştırma Hatası (Execution Policy)

**Hata:** `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled`

**Çözüm 1 - PowerShell Execution Policy'yi Değiştir (Önerilen):**

1. **PowerShell'i Yönetici Olarak Açın:**
   - Windows tuşuna basın
   - "PowerShell" yazın
   - Sağ tıklayıp **"Yönetici olarak çalıştır"** seçin

2. **Execution Policy'yi Değiştirin:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   - "Evet" veya "Y" yazıp Enter'a basın

3. **PowerShell'i Kapatıp Yeniden Açın**

4. **Kontrol Edin:**
   ```powershell
   Get-ExecutionPolicy
   ```
   - "RemoteSigned" yazmalı

**Çözüm 2 - CMD Kullanın (Alternatif):**

PowerShell yerine **CMD (Komut İstemi)** kullanabilirsiniz:
- Windows tuşu + R
- `cmd` yazın ve Enter
- CMD'de npm komutları sorunsuz çalışır

**Çözüm 3 - Geçici Bypass (Tek Seferlik):**

PowerShell'de şu komutu kullanın:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm install"
```

### Node.js kurulu değil hatası
- Node.js'in kurulu olduğundan emin olun: `node --version`
- Bilgisayarınızı yeniden başlatın
- PowerShell'i yönetici olarak çalıştırın

### MongoDB bağlantı hatası
- MongoDB servisinin çalıştığından emin olun (services.msc'den kontrol edin)
- MongoDB'nin varsayılan portunda (27017) çalıştığından emin olun
- MongoDB Compass ile bağlantıyı test edin: `mongodb://localhost:27017`

### Port zaten kullanılıyor hatası
- Port 3000 (backend) veya 3001 (frontend) başka bir uygulama tarafından kullanılıyor olabilir
- Görev Yöneticisi'nden (Task Manager) ilgili process'leri kapatın
- Veya bilgisayarınızı yeniden başlatın

### npm install hataları
- İnternet bağlantınızı kontrol edin
- `npm cache clean --force` komutunu çalıştırın
- `node_modules` klasörünü silip tekrar `npm install` yapın

### TypeScript hatası
- `npm install -g typescript ts-node` komutunu çalıştırın
- Veya proje klasöründe `npm install` yapın

## 📝 Notlar

- Backend ve Frontend'i **ayrı terminal pencerelerinde** çalıştırmanız gerekir
- MongoDB servisi her zaman çalışır durumda olmalıdır
- İlk kurulumda `npm install` işlemi 5-10 dakika sürebilir
- Sonraki başlatmalarda sadece `npm run start:dev` (backend) ve `npm run dev` (frontend) komutlarını kullanın

## 🎉 Başarılı Kurulum Kontrol Listesi

- [ ] Node.js kurulu ve çalışıyor (`node --version`)
- [ ] npm kurulu ve çalışıyor (`npm --version`)
- [ ] MongoDB kurulu ve servisi çalışıyor
- [ ] Backend bağımlılıkları yüklendi (`nestjs-backend/node_modules` klasörü var)
- [ ] Frontend bağımlılıkları yüklendi (`frontend/node_modules` klasörü var)
- [ ] Demo kullanıcılar oluşturuldu (`npx ts-node src/seed.ts` başarılı)
- [ ] Backend çalışıyor (http://localhost:3000)
- [ ] Frontend çalışıyor (http://localhost:3001)
- [ ] Giriş yapabiliyorsunuz

---

**Sorun yaşarsanız, hata mesajlarını not alın ve yardım isteyin!**


