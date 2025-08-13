# CSS Reference - Le Fooding Style System

## CSS Variables

```css
/* Color System */
:root {
  --bg: #ffffff;
  --text: #111111;
  --muted: #666666;
  --border: #eaeaea;

  --accent-yellow: #FFE600;
  --accent-red: #FF3B30;
  --accent-blue: #1E3DFF;

  --display: "Anton", Impact, "Helvetica Neue Condensed", "Arial Narrow", Arial, sans-serif;
  --sans: "Inter", "Helvetica Neue", Arial, sans-serif;

  --maxw: 1200px;
  --gap: 24px;
}
```

## Typography Classes

```css
/* Headlines */
h1, .disp-1 { 
  font-family: var(--display); 
  font-weight: 400; 
  text-transform: uppercase; 
  line-height: .95; 
  letter-spacing: .2px; 
  font-size: clamp(40px, 7vw, 92px); 
  margin: 0 0 .4em; 
}

h2, .disp-2 { 
  font-family: var(--display); 
  text-transform: uppercase; 
  line-height: .95; 
  font-size: clamp(28px, 4vw, 48px); 
  margin: 0 0 .5em; 
}

h3 { 
  font-family: var(--display); 
  text-transform: uppercase; 
  font-size: 24px; 
  line-height: 1; 
  margin: 0 0 .6em; 
}

/* Body Text */
p { 
  font-size: 16px; 
  line-height: 1.6; 
  margin: 0 0 1em; 
  color: var(--text); 
}

.small { 
  font-size: 14px; 
  color: var(--muted); 
}
```

## Layout Classes

```css
/* Container & Sections */
.container { 
  max-width: var(--maxw); 
  margin: 0 auto; 
  padding: 0 16px; 
}

.section { 
  padding: 40px 0; 
}

/* Grid System */
.grid { 
  display: grid; 
  gap: var(--gap); 
}

@media (min-width: 640px) { 
  .grid-cols-2 { grid-template-columns: repeat(2, 1fr); } 
}

@media (min-width: 1024px) { 
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); } 
}
```

## Navigation Classes

```css
.nav {
  position: sticky; 
  top: 0; 
  z-index: 100;
  background: var(--bg); 
  border-bottom: 1px solid var(--border); 
  height: 64px;
  display: flex; 
  align-items: center;
}

.nav .container { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  height: 100%; 
}

.brand { 
  font-family: var(--display); 
  letter-spacing: .5px; 
  text-transform: uppercase; 
  font-size: 20px; 
}

.nav ul { 
  display: flex; 
  gap: 20px; 
  list-style: none; 
  margin: 0; 
  padding: 0; 
}

.nav a { 
  text-transform: uppercase; 
  font-size: 13px; 
}

.nav a[aria-current="page"] { 
  text-decoration: underline; 
  text-underline-offset: 2px; 
}
```

## Hero Section Classes

```css
.hero { 
  padding: 48px 0 24px; 
  border-bottom: 1px solid var(--border); 
}

.hero .deck { 
  max-width: 60ch; 
  color: var(--muted); 
}
```

## Button Classes

```css
.cta {
  display: inline-block; 
  margin-top: 16px; 
  padding: 10px 16px;
  border: 1px solid var(--text); 
  background: var(--bg); 
  color: var(--text);
  text-transform: uppercase; 
  font-weight: 600; 
  font-size: 13px; 
  transition: background .2s, color .2s;
}

.cta:hover { 
  background: var(--text); 
  color: #fff; 
  text-decoration: none; 
}
```

## Tag Classes

```css
.tag { 
  display: inline-block; 
  padding: 2px 8px; 
  font-size: 12px; 
  font-weight: 700; 
  text-transform: uppercase; 
}

.tag--yellow { 
  background: var(--accent-yellow); 
  color: #000; 
}

.tag--red { 
  background: var(--accent-red); 
  color: #fff; 
}

.tag--blue { 
  background: var(--accent-blue); 
  color: #fff; 
}
```

## Card Classes

```css
.card { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.card__media { 
  position: relative; 
  overflow: hidden; 
  aspect-ratio: 16/9; 
}

.card__media img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  transform: scale(1); 
  transition: transform .3s ease-in-out; 
}

.card:hover .card__media img { 
  transform: scale(1.03); 
}

.card__category { 
  margin-top: 6px; 
}

.card__title { 
  font-family: var(--display); 
  text-transform: uppercase; 
  font-size: 24px; 
  line-height: 1; 
}

.card__meta { 
  color: var(--muted); 
  font-size: 14px; 
}

.card:hover .card__title { 
  text-decoration: underline; 
  text-underline-offset: 2px; 
}
```

## Form Classes

```css
.input {
  display: flex; 
  height: 40px; 
  width: 100%; 
  border: 1px solid var(--border); 
  background: white; 
  padding: 12px 16px; 
  font-size: 16px; 
  font-family: var(--sans);
  file:border: 0; 
  file:bg-transparent; 
  file:text-sm; 
  file:font-medium; 
}

.input::placeholder {
  color: var(--muted);
}

.input:focus-visible {
  outline: none; 
  ring: 2px solid var(--accent-blue); 
  ring-offset: 2px;
}

.input:disabled {
  cursor: not-allowed; 
  opacity: 50%;
}
```

## Section Header Classes

```css
.section-header { 
  display: flex; 
  align-items: baseline; 
  justify-content: space-between; 
  margin-bottom: 16px; 
}

.section-title { 
  font-family: var(--display); 
  text-transform: uppercase; 
  font-size: 28px; 
  line-height: 1; 
}

.section-link { 
  font-size: 13px; 
  text-transform: uppercase; 
}
```

## Footer Classes

```css
.footer { 
  border-top: 1px solid var(--border); 
  padding: 32px 0; 
}

.footer .cols { 
  display: grid; 
  gap: 24px; 
}

@media (min-width: 768px) { 
  .footer .cols { 
    grid-template-columns: repeat(4, 1fr); 
  } 
}

.footer a { 
  font-size: 14px; 
}
```

## Utility Classes

```css
/* Focus States */
:focus { 
  outline: 2px solid var(--accent-blue); 
  outline-offset: 2px; 
}

/* Image Defaults */
img { 
  display: block; 
  max-width: 100%; 
  height: auto; 
}

/* Link Defaults */
a { 
  color: var(--text); 
  text-decoration: none; 
  transition: color .2s, text-underline-offset .2s; 
}

a:hover { 
  color: var(--accent-red); 
  text-decoration: underline; 
  text-underline-offset: 2px; 
}
```

## Tailwind Integration Classes

```css
/* Legacy Tailwind compatibility */
.btn {
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 14px; 
  font-weight: 500; 
  transition: colors;
}

.btn-primary {
  border: 1px solid #111111; 
  background: white; 
  color: #111111; 
  text-transform: uppercase; 
  font-weight: 600; 
  font-size: 12px;
}

.btn-primary:hover {
  background: #111111; 
  color: white;
}

.card {
  border: 1px solid var(--border); 
  background: white;
}

.card-header {
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
  padding: 24px;
}

.card-title {
  font-size: 24px; 
  font-weight: 600; 
  line-height: 1; 
  letter-spacing: -0.025em;
}

.card-description {
  font-size: 14px; 
  color: var(--muted);
}

.card-content {
  padding: 24px; 
  padding-top: 0;
}

.card-footer {
  display: flex; 
  align-items: center; 
  padding: 24px; 
  padding-top: 0;
}
```

## Animation Classes

```css
/* Spinner Animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Pulse Animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s infinite;
}
```

## Usage Examples

### HTML Structure
```html
<section class="hero">
  <div class="container">
    <span class="tag tag--yellow">FEATURED</span>
    <h1>MAIN HEADLINE</h1>
    <p class="deck">Description text</p>
    <a href="#" class="cta">CALL TO ACTION</a>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">SECTION TITLE</h2>
      <a href="#" class="section-link">VIEW ALL →</a>
    </div>
    
    <div class="grid grid-cols-3">
      <div class="card">
        <div class="card__media">
          <img src="..." alt="...">
        </div>
        <div style="padding: 24px;">
          <span class="tag tag--yellow">CATEGORY</span>
          <h3 class="card__title">CARD TITLE</h3>
          <p class="card__meta">Metadata</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Inline Styles (React)
```jsx
<div style={{ 
  display: 'flex', 
  gap: '16px', 
  padding: '24px',
  border: '1px solid var(--border)'
}}>
  <span className="tag tag--yellow">TAG</span>
  <button className="cta">BUTTON</button>
</div>
```
