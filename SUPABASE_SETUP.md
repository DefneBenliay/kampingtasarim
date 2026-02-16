# Supabase Kurulum Rehberi - Home Sayfası Kaydetme İşlemi

Home sayfasında değişikliklerin kaydedilmesi için Supabase'de aşağıdaki adımları takip edin:

## 1. Tablo Oluşturma

Supabase SQL Editor'de aşağıdaki SQL'i çalıştırın:

```sql
-- site_content tablosunu oluştur
CREATE TABLE IF NOT EXISTS site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL UNIQUE,
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- section kolonuna unique constraint ekle (eğer yoksa)
CREATE UNIQUE INDEX IF NOT EXISTS site_content_section_key ON site_content(section);
```

## 2. Row Level Security (RLS) Politikaları

RLS politikalarını ayarlayın:

```sql
-- RLS'yi etkinleştir
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Anyone can read site_content"
ON site_content
FOR SELECT
USING (true);

-- Sadece admin kullanıcılar yazabilir (profiles tablosundaki role='admin' olanlar)
CREATE POLICY "Only admins can insert site_content"
ON site_content
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Sadece admin kullanıcılar güncelleyebilir
CREATE POLICY "Only admins can update site_content"
ON site_content
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Sadece admin kullanıcılar silebilir
CREATE POLICY "Only admins can delete site_content"
ON site_content
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
```

## 3. Storage Bucket Oluşturma (Resim yükleme için)

```sql
-- Storage bucket oluştur (Supabase Dashboard > Storage > New Bucket)
-- Bucket adı: images
-- Public bucket: Yes
-- File size limit: 5MB (veya istediğiniz limit)
-- Allowed MIME types: image/*
```

Storage politikaları:

```sql
-- Herkes resimleri görebilir
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Sadece admin kullanıcılar resim yükleyebilir
CREATE POLICY "Only admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Sadece admin kullanıcılar resim silebilir
CREATE POLICY "Only admins can delete images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
```

## 4. Kontrol Listesi

- [ ] `site_content` tablosu oluşturuldu mu?
- [ ] `section` kolonu UNIQUE constraint'e sahip mi?
- [ ] RLS politikaları ayarlandı mı?
- [ ] Admin kullanıcınız var mı? (profiles tablosunda role='admin')
- [ ] Storage bucket 'images' oluşturuldu mu?
- [ ] Storage politikaları ayarlandı mı?

## 5. Test Etme

1. Admin olarak giriş yapın
2. Home sayfasına gidin
3. "Düzenle" butonuna tıklayın
4. Başlık veya açıklamayı değiştirin
5. "Kaydet" butonuna tıklayın
6. Tarayıcı konsolunu açın (F12) ve hata mesajlarını kontrol edin

## Sorun Giderme

Eğer hala çalışmıyorsa:

1. **Tarayıcı konsolunu kontrol edin (F12)**
   - Hangi hata mesajı görünüyor?
   - Error code nedir?

2. **Supabase Dashboard'u kontrol edin**
   - Table Editor'da `site_content` tablosu görünüyor mu?
   - RLS politikaları aktif mi?
   - Test verisi ekleyebiliyor musunuz?

3. **Kullanıcı kontrolü**
   - Admin olarak giriş yaptınız mı?
   - `profiles` tablosunda `role='admin'` mi?

4. **Network sekmesini kontrol edin (F12 > Network)**
   - Kaydet butonuna tıkladığınızda hangi istek gönderiliyor?
   - Response nedir?
