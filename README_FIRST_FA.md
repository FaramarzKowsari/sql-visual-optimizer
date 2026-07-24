# راهنمای رفع خطای ImportMeta.env

این بسته خطای زیر را رفع می‌کند:

Property 'env' does not exist on type 'ImportMeta'

## فایل‌های بسته

- `src/vite-env.d.ts`
- `tsconfig.app.json`

## نصب

1. محتویات بسته را در ریشه مخزن محلی `sql-visual-optimizer` کپی کنید.
2. هنگام سؤال ویندوز، گزینه `Replace the files in the destination` را بزنید.
3. در GitHub Desktop باید این تغییرات دیده شوند:
   - `src/vite-env.d.ts` (فایل جدید)
   - `tsconfig.app.json` (فایل اصلاح‌شده)
4. Summary:
   `Add Vite environment type declarations`
5. Commit to main
6. Push origin

بعد از Push، CI و Deploy GitHub Pages به صورت خودکار دوباره اجرا می‌شوند.
اجرای قرمز قبلی را Re-run نکنید.
