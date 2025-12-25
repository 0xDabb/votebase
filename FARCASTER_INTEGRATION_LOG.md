# Farcaster Mini App Entegrasyon Günlüğü
**Tarih:** 25 Aralık 2024  
**Proje:** VoteBase (eski adı: Bote App)  
**Canlı URL:** https://dreamy-mermaid-13209a.netlify.app

---

## 📋 Genel Bakış

VoteBase uygulamasını Warpcast Mini App olarak entegre ettik. Kullanıcılar artık Warpcast içinden uygulamayı açabilir, Farcaster hesaplarıyla otomatik giriş yapabilir ve projelere oy verebilir.

---

## ✅ Tamamlanan İşler

### 1. Oy Sistemi Rate Limiting (12 Saat Kuralı)
**Dosyalar:**
- `prisma/schema.prisma`
- `src/app/api/projects/[id]/upvote/route.ts`

**Değişiklikler:**
- ✅ Kullanıcılar 12 saatte sadece 1 oy kullanabilir
- ✅ 12 saat sonra aynı projeye tekrar oy verilebilir
- ✅ `Upvote` modelinden `@@unique([userId, projectId])` kısıtlaması kaldırıldı
- ✅ `@@index([userId, createdAt])` performans index'i eklendi
- ✅ Oy geri çekme sistemi kaldırıldı
- ✅ Proje sahibine bildirim gitmiyor

**Kod Örneği:**
```typescript
const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
const recentUpvotesCount = await prisma.upvote.count({
    where: {
        userId,
        createdAt: { gte: twelveHoursAgo }
    }
})

if (recentUpvotesCount >= 1) {
    return NextResponse.json(
        { error: 'You have used your vote for this 12-hour period.' },
        { status: 429 }
    )
}
```

---

### 2. Branding Güncellemesi: Bote → VoteBase
**Dosyalar:**
- `src/app/layout.tsx`
- `public/manifest.json`
- `public/.well-known/farcaster.json`

**Değişiklikler:**
- ✅ Tüm "Bote" referansları "VoteBase" olarak değiştirildi
- ✅ Buton metni: "Open VoteBase"
- ✅ Meta title: "VoteBase - Discover & Vote for Projects"

---

### 3. Farcaster Mini App Metadata Konfigürasyonu
**Dosyalar:**
- `src/app/layout.tsx`
- `public/.well-known/farcaster.json`
- `public/manifest.json`

**Farcaster Frame Meta Tag (Frames V2 Format):**
```typescript
other: {
  "fc:frame": JSON.stringify({
    version: "1",  // Resmi spesifikasyon
    imageUrl: "https://dreamy-mermaid-13209a.netlify.app/og-image.png",
    button: {
      title: "Open VoteBase",
      action: {
        type: "launch_frame",
        name: "VoteBase",
        url: "https://dreamy-mermaid-13209a.netlify.app",
        splashImageUrl: "https://dreamy-mermaid-13209a.netlify.app/icon.png",
        splashBackgroundColor: "#0F0F0F"
      }
    }
  })
}
```

**farcaster.json (Account Association ile):**
```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjE1MzYzOTksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyQWI0MzZCN2MzMEJERTg1NjE4OUZhODNEMWQ2RkQ2NzNlYkMzQmQ2In0",
    "payload": "eyJkb21haW4iOiJkcmVhbXktbWVybWFpZC0xMzIwOWEubmV0bGlmeS5hcHAifQ",
    "signature": "z93Cx15gv145KvNbUwgzkdT608wTCIqOQTJsVPnwdUNK5te0ftFPqp/ef0FWMt9Dt66X6+MWvUE9wDZfnqfidxw="
  },
  "frame": {
    "version": "1",
    "name": "VoteBase",
    "iconUrl": "https://dreamy-mermaid-13209a.netlify.app/icon.png",
    "homeUrl": "https://dreamy-mermaid-13209a.netlify.app",
    "imageUrl": "https://dreamy-mermaid-13209a.netlify.app/og-image.png",
    "buttonTitle": "Open VoteBase",
    "splashImageUrl": "https://dreamy-mermaid-13209a.netlify.app/icon.png",
    "splashBackgroundColor": "#0F0F0F"
  }
}
```

---

### 4. Farcaster SDK Entegrasyonu
**Dosyalar:**
- `src/contexts/AuthContext.tsx`
- `src/components/FrameSDKInit.tsx` (sonra kaldırıldı)

**AuthContext Güncellemeleri:**
```typescript
// SDK ready() çağrısı hemen yapılıyor (context beklemeden)
await sdk.actions.ready()
console.log('Farcaster SDK ready called')

const context = await sdk.context
if (context?.user) {
    // Backend'e kullanıcı bilgilerini gönder
    const response = await fetch('/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            avatarUrl: context.user.pfpUrl,
        }),
    })
}
```

**Önemli:** `FrameSDKInit` component'i kaldırıldı çünkü `AuthContext` ile çakışıyordu.

---

### 5. Warpcast Manifest Tool Doğrulaması
**URL:** https://warpcast.com/~/developers/manifests

**Doğrulama Sonuçları:**
- ✅ Account Association: Verified
- ✅ Signed by: 0xdabb (FID: 1536399)
- ✅ Mini App Configuration: Valid
- ✅ Domain: dreamy-mermaid-13209a.netlify.app

---

## 🔧 Teknik Detaylar

### Kullanılan Paketler
```json
{
  "@farcaster/frame-sdk": "^0.1.12",
  "@prisma/client": "^5.22.0",
  "next": "16.1.1"
}
```

### Veritabanı Değişiklikleri
**Upvote Model (prisma/schema.prisma):**
```prisma
model Upvote {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([userId])
  @@index([userId, createdAt])  // Rate limiting için
}
```

### API Endpoints
**POST `/api/auth/farcaster`**
- Farcaster kullanıcısını veritabanına kaydeder (upsert)
- FID, username, displayName, avatarUrl bilgilerini alır

**POST `/api/projects/[id]/upvote`**
- 12 saatlik rate limit kontrolü yapar
- Upvote ekler ve proje upvoteCount'unu artırır
- 429 hatası döner (rate limit aşıldığında)

---

## 🐛 Karşılaşılan Sorunlar ve Çözümler

### Sorun 1: "Open VoteBase" Butonu Görünmüyor
**Neden:** Warpcast cache'i eski metadata'yı tutuyordu  
**Çözüm:** 
- Warpcast Manifest Tool kullanıldı
- Query parameter eklendi (`?v=5`)
- Meta tag formatı JSON'a çevrildi

### Sorun 2: Mini App Siyah Ekranda Takılı Kalıyor
**Neden:** İki farklı component SDK'yı aynı anda initialize ediyordu  
**Çözüm:**
- `FrameSDKInit` component'i kaldırıldı
- Sadece `AuthContext` kullanıldı
- `sdk.actions.ready()` hemen çağrıldı (context beklemeden)

### Sorun 3: Account Association Invalid
**Neden:** Placeholder signature kullanılıyordu  
**Çözüm:**
- Warpcast Manifest Tool'da "Generate account association" kullanıldı
- Gerçek signature alındı ve `farcaster.json`'a eklendi

### Sorun 4: Meta Tag Version Hatası
**Neden:** `version: "next"` kullanılıyordu  
**Çözüm:** Resmi spesifikasyona göre `version: "1"` olarak değiştirildi

---

## 📚 Referanslar

- **Farcaster Docs:** https://docs.farcaster.xyz/developers/
- **Mini Apps Spec:** https://miniapps.farcaster.xyz/docs/specification
- **Warpcast Manifest Tool:** https://warpcast.com/~/developers/manifests
- **Frame SDK:** https://www.npmjs.com/package/@farcaster/frame-sdk

---

## 🚀 Deployment Bilgileri

**Platform:** Netlify  
**Auto Deploy:** GitHub push ile otomatik  
**Build Command:** `prisma generate && next build`  
**Environment Variables:**
- `DATABASE_URL` (PostgreSQL)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

---

## 📝 Sıradaki Adımlar (Öneriler)

1. **SDK Deprecation Uyarısı:** `@farcaster/frame-sdk` → `@farcaster/miniapp-sdk` geçişi yapılabilir
2. **Error Handling:** SDK initialization hatalarında daha iyi fallback mekanizması
3. **Analytics:** Mini App kullanım istatistikleri eklenebilir
4. **Notifications:** Farcaster notifications API entegrasyonu
5. **Wallet Integration:** Kullanıcıların cüzdan bağlaması için destek

---

## 👥 Kullanıcı Akışı

1. Kullanıcı Warpcast'te VoteBase linkini görür
2. "Open VoteBase" butonuna basar
3. Uygulama Warpcast içinde Mini App olarak açılır
4. Farcaster SDK otomatik giriş yapar
5. Kullanıcı projelere oy verebilir (12 saatte 1 kez)
6. Oylar veritabanına kaydedilir

---

**Son Güncelleme:** 25 Aralık 2024, 23:21  
**Durum:** ✅ Entegrasyon tamamlandı, test aşamasında
