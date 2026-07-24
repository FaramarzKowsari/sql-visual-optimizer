# راهنمای ساخت Release نسخه 1.1.0 و دریافت DOI جدید

## 1. نصب فایل‌ها

محتویات این بسته را در ریشه مخزن محلی `sql-visual-optimizer` کپی کنید و فایل‌های موجود را Replace کنید.

فایل‌های تغییرکرده:
- `.zenodo.json`
- `CITATION.cff`
- `package.json`

فایل جدید:
- `docs/RELEASE_NOTES_v1.1.0.md`

## 2. Commit

Summary:
`Prepare v1.1.0 guidebook release metadata`

Description:
`Update software, citation, and Zenodo metadata for the official infographic guidebook release.`

سپس:
- Commit to main
- Push origin
- صبر کنید CI و Deploy GitHub Pages سبز شوند.

## 3. ساخت GitHub Release

- Tag: `v1.1.0`
- Target: `main`
- Title: `SQL Visual Optimizer v1.1.0 — Official Infographic Guidebook Release`
- Description: تمام محتوای `docs/RELEASE_NOTES_v1.1.0.md`
- Set as latest release: روشن
- Pre-release: خاموش
- Publish release

## 4. دریافت DOI

پس از پردازش Zenodo، یک Version DOI جدید برای v1.1.0 ظاهر می‌شود.
شماره DOI جدید یا تصویر صفحه Zenodo را برای مرحله نهایی درج DOI در تمام فایل‌ها ارسال کنید.

DOI نسخه v1.0.0 را حذف یا بازنویسی نکنید:
`10.5281/zenodo.21501361`
