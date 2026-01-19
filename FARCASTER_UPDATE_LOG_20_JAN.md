# Farcaster Entegrasyon Güncellemeleri - 20 Ocak 2026

## 📋 Özet

Farcaster Mini App entegrasyonu genişletildi. Push notifications, kullanıcı paylaşımı ve SDK action'ları eklendi.

---

## ✅ Yeni Eklenen Özellikler

### 1. Push Notification Sistemi

**Dosyalar:**
- `prisma/schema.prisma` - User modeline notification alanları eklendi
- `src/app/api/webhook/route.ts` - Webhook handler güncellendi
- `src/app/api/notifications/send/route.ts` - Bildirim gönderme API'si (YENİ)

**User Modeline Eklenen Alanlar:**
```prisma
notificationToken   String?   // Farcaster notification token
notificationUrl     String?   // Farcaster client API URL
notificationsEnabled Boolean  @default(false)
miniAppAdded        Boolean   @default(false)
```

**Webhook Events:**
- `miniapp_added` - Kullanıcı uygulamayı eklediğinde
- `miniapp_removed` - Kullanıcı uygulamayı kaldırdığında
- `notifications_enabled` - Bildirimler aktif edildiğinde
- `notifications_disabled` - Bildirimler kapatıldığında

---

### 2. Farcaster Actions Hook

**Dosya:** `src/hooks/useFarcasterActions.ts`

**Sağlanan Fonksiyonlar:**
- `addMiniApp()` - Kullanıcıyı uygulamayı eklemeye davet eder
- `composeCast(text, embedUrl)` - Cast composer açar
- `shareProject(project)` - Proje paylaşımı
- `haptic(type)` - Haptic feedback
- `openLink(url)` - Harici link açma
- `viewProfile(fid)` - Farcaster profil görüntüleme

---

### 3. UI Bileşenleri

**AddToFarcasterButton** (`src/components/farcaster/AddToFarcasterButton.tsx`)
- Kullanıcıları bildirimleri etkinleştirmeye davet eden banner/button
- Variants: `banner`, `button`, `compact`
- Ana sayfada banner olarak gösteriliyor

**ShareButton** (`src/components/farcaster/ShareButton.tsx`)
- Proje paylaşım butonu
- Variants: `icon`, `button`, `text`
- Sizes: `sm`, `md`, `lg`

---

### 4. Bildirim Gönderme API'si

**Endpoint:** `POST /api/notifications/send`

**Request Body:**
```json
{
  "fid": 12345,          // veya "userId": "cuid..."
  "title": "New Upvote!",
  "body": "Your project received a new upvote",
  "targetUrl": "/projects/abc123",
  "notificationId": "upvote-abc123-1234567890"
}
```

**Özellikler:**
- Admin authorization gerektirir
- Rate limit handling
- Token invalidation on error
- Internal notification table'a kayıt

---

## 🔧 Veritabanı Değişiklikleri

```bash
# Prisma client yeniden generate edilmeli
npx prisma generate

# Veritabanı şeması güncellenmeli (Vercel'de otomatik)
npx prisma db push
```

---

## 📁 Yeni Dosyalar

```
src/
├── hooks/
│   ├── index.ts
│   └── useFarcasterActions.ts
├── components/
│   └── farcaster/
│       ├── index.ts
│       ├── AddToFarcasterButton.tsx
│       └── ShareButton.tsx
└── app/
    └── api/
        └── notifications/
            └── send/
                └── route.ts
```

---

## 📝 Güncellenen Dosyalar

- `prisma/schema.prisma` - User modeli güncellendi
- `src/app/api/webhook/route.ts` - Notification token depolama eklendi
- `src/app/(main)/page.tsx` - AddToFarcasterButton banner eklendi

---

## 🚀 Deployment Adımları

1. GitHub'a push:
   ```bash
   git add .
   git commit -m "Add Farcaster notification system and share components"
   git push origin main
   ```

2. Vercel otomatik deploy edecek

3. Vercel'de environment variables kontrol:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `ADMIN_PASSWORD`

---

## 📚 Referanslar

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/)
- [Notifications Guide](https://miniapps.farcaster.xyz/docs/guides/notifications)
- [SDK Reference](https://miniapps.farcaster.xyz/docs/sdk/context)

---

**Son Güncelleme:** 20 Ocak 2026, 01:55
**Durum:** ✅ Kod tamamlandı, deploy bekliyor
