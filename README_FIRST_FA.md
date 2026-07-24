# بسته اصلاح DOI نسخه 1.1.0

DOI جدید و رسمی:

```text
10.5281/zenodo.21522569
```

DOI قبلی نسخه 1.0.0 که باید در تاریخچه حفظ شود:

```text
10.5281/zenodo.21501361
```

## روش استفاده

1. فایل ZIP را Extract کنید.
2. روی فایل زیر دوبار کلیک کنید:

```text
APPLY_DOI_UPDATE.bat
```

3. ابزار ابتدا این مسیر پیش‌فرض را بررسی می‌کند:

```text
Documents\GitHub\sql-visual-optimizer
```

اگر مخزن در جای دیگری باشد، مسیر کامل پوشه را از شما می‌پرسد.

4. ابزار قبل از هر تغییری یک نسخه پشتیبان خارج از مخزن و داخل پوشه موقت ویندوز می‌سازد:

```text
%TEMP%\sql-visual-optimizer-doi-backup-YYYYMMDD-HHMMSS
```

این پوشه وارد Commit نخواهد شد.

5. DOI جدید در فایل‌های زیر ثبت می‌شود:

```text
README.md
.zenodo.json
CITATION.cff
index.html
src/App.tsx
src/components/About.tsx
public/guidebook/index.html
public/images/doi-badge.svg
public/llms.txt
docs/GUIDEBOOK.md
docs/RELEASE_NOTES_v1.1.0.md
```

6. در پایان، ابزار این فرمان‌ها را اجرا می‌کند:

```text
npm run test
npm run build
```

## Commit در GitHub Desktop

Summary:

```text
Register Zenodo v1.1.0 DOI across the project
```

Description:

```text
Add the Zenodo v1.1.0 DOI to citation metadata, the application, README, guidebook, structured data, release notes, and machine-readable project files while preserving the v1.0.0 DOI in version history.
```

سپس:

```text
Commit to main
Push origin
```

بعد از Push منتظر بمانید هر دو Workflow سبز شوند:

```text
CI
Deploy GitHub Pages
```
