# راه‌اندازی پروژه با GitHub Desktop

## ۱. فایل را از حالت ZIP خارج کنید

پوشه نهایی باید مستقیماً شامل فایل‌های زیر باشد:

```text
package.json
README.md
src/
public/
.github/
```

نباید یک پوشه تودرتوی اضافی مانند `sql-visual-optimizer/sql-visual-optimizer/` ایجاد شود.

## ۲. مخزن محلی را در GitHub Desktop بسازید

در GitHub Desktop:

1. از منوی **File** گزینه **New repository** را انتخاب کنید.
2. در بخش Name بنویسید:

```text
sql-visual-optimizer
```

3. Local path را روی پوشه‌ای تنظیم کنید که می‌خواهید مخزن در آن ساخته شود.
4. گزینه Initialize with README را فعال نکنید؛ پروژه از قبل README دارد.
5. Git ignore و License را روی None بگذارید؛ هر دو فایل از قبل وجود دارند.
6. روی **Create repository** کلیک کنید.

اگر GitHub Desktop یک پوشه خالی جدید ساخت، تمام فایل‌های این پروژه را داخل همان پوشه کپی کنید.

## ۳. اجرای محلی

در GitHub Desktop از منوی **Repository → Open in Command Prompt** یا **Open in Terminal** استفاده کنید و اجرا کنید:

```bash
npm install
npm run dev
```

آدرس محلی که Vite نمایش می‌دهد را در مرورگر باز کنید.

برای کنترل نهایی:

```bash
npm run test
npm run build
```

## ۴. اولین Commit

در Summary بنویسید:

```text
Initial release: browser-based SQL optimization laboratory
```

سپس روی **Commit to main** کلیک کنید.

## ۵. انتشار در GitHub

روی **Publish repository** کلیک کنید و این تنظیمات را اعمال کنید:

- Name: `sql-visual-optimizer`
- Description: `A browser-based SQL optimization laboratory for query plans, cost analysis, indexes, and performance education.`
- تیک **Keep this code private** را بردارید تا مخزن Public شود.

## ۶. فعال‌سازی GitHub Pages

پس از انتشار:

1. صفحه مخزن را در GitHub باز کنید.
2. وارد **Settings** شوید.
3. در ستون چپ **Pages** را انتخاب کنید.
4. در Build and deployment، Source را روی **GitHub Actions** بگذارید.
5. به تب **Actions** برگردید و اجرای `Deploy GitHub Pages` را بررسی کنید.

پس از موفقیت Workflow، برنامه در این نشانی در دسترس خواهد بود:

```text
https://FaramarzKowsari.github.io/sql-visual-optimizer/
```

## ۷. Topics پیشنهادی مخزن

```text
sql
query-optimization
database
execution-plan
data-engineering
typescript
react
rust
webassembly
postgresql
mysql
sqlite
education-technology
ai-research
```

## ۸. Social Preview

پس از انتشار، برای تصویر Social Preview می‌توان از صفحه اصلی برنامه اسکرین‌شات ۱۲۸۰×۶۴۰ تهیه و از مسیر زیر بارگذاری کرد:

```text
Settings → General → Social preview → Edit
```
