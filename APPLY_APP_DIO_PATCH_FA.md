# افزودن DOI به src/App.tsx

در فایل `src/App.tsx` دو تغییر کوچک انجام دهید.

## ۱. زیر پاراگراف Hero

این بخش را پیدا کنید:

```tsx
<p>Parse a query, inspect its logical plan, model likely cost centers, surface optimization hypotheses, and compare the estimate with real PostgreSQL EXPLAIN JSON.</p>
```

بلافاصله بعد از آن اضافه کنید:

```tsx
<div className="button-row">
  <a className="secondary-button" href="https://doi.org/10.5281/zenodo.21501361" target="_blank" rel="noreferrer">
    <ShieldCheck size={17} /> DOI 10.5281/zenodo.21501361
  </a>
</div>
```

## ۲. در Footer

داخل `footer-links`، بعد از لینک GitHub اضافه کنید:

```tsx
<a href="https://doi.org/10.5281/zenodo.21501361" target="_blank" rel="noreferrer">Software DOI</a>
```

این تغییر به CSS جدید نیاز ندارد، چون از کلاس‌های موجود پروژه استفاده می‌کند.
