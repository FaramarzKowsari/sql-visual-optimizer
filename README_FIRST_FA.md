# راهنمای اعمال اصلاح Badge DOI

این بسته دو فایل دارد:

- `README.md`
- `public/images/doi-badge.svg`

## روش نصب

1. محتویات بسته را در ریشه مخزن محلی `sql-visual-optimizer` کپی کنید.
2. هنگام سؤال ویندوز، گزینه **Replace the files in the destination** را بزنید.
3. در GitHub Desktop باید این دو تغییر را ببینید:
   - README.md
   - public/images/doi-badge.svg
4. Summary:
   `Fix DOI badge with repository-hosted SVG`
5. Commit to main
6. Push origin

Badge جدید از داخل خود مخزن بارگیری می‌شود و دیگر به endpoint تصویری Zenodo وابسته نیست.
لینک روی Badge همچنان DOI رسمی را باز می‌کند:
https://doi.org/10.5281/zenodo.21501361
