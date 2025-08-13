# Quick Style Reference

## 🎨 Colors

### CSS Variables
```css
--bg: #ffffff           /* White background */
--text: #111111         /* Black text */
--muted: #666666        /* Gray text */
--border: #eaeaea       /* Light gray borders */

--accent-yellow: #FFE600 /* Yellow highlights */
--accent-red: #FF3B30    /* Red errors/admin */
--accent-blue: #1E3DFF   /* Blue links */
```

### Usage
- **Yellow**: Tags, highlights, icons, prices
- **Blue**: Links, interactive elements, focus
- **Red**: Errors, admin elements, warnings

## 📝 Fonts

### Typography
- **Anton**: Headlines, navigation, buttons (uppercase)
- **Inter**: Body text, forms, metadata

### Classes
```css
h1, h2, h3    /* Anton, uppercase, display */
p             /* Inter, 16px, line-height 1.6 */
.small        /* Inter, 14px, muted color */
```

## 🏗️ Layout

### Spacing
```css
.container    /* 1200px max-width, 16px padding */
.section      /* 40px vertical padding */
--gap: 24px   /* Standard grid gap */
```

### Grid
```css
.grid              /* CSS Grid with 24px gap */
.grid-cols-2       /* 2 columns on tablet+ */
.grid-cols-3       /* 3 columns on desktop+ */
```

## 🧩 Components

### Tags
```jsx
<span className="tag tag--yellow">FEATURED</span>
<span className="tag tag--blue">VERIFIED</span>
<span className="tag tag--red">ADMIN</span>
```

### Buttons
```jsx
<button className="cta">CLICK ME</button>
<Link to="/path" className="cta">LINK</Link>
```

### Cards
```jsx
<div className="card">
  <div className="card__media">...</div>
  <div style={{ padding: '24px' }}>
    <span className="tag tag--yellow">CATEGORY</span>
    <h3 className="card__title">TITLE</h3>
    <p className="card__meta">Metadata</p>
  </div>
</div>
```

### Forms
```jsx
<input 
  className="input" 
  style={{ width: '100%' }}
  placeholder="Enter text"
/>
```

### Navigation
```jsx
<header className="nav">
  <div className="container">
    <Link to="/" className="brand">BRAND</Link>
    <nav>
      <ul>
        <li><Link to="/path">MENU ITEM</Link></li>
      </ul>
    </nav>
  </div>
</header>
```

## 📱 Responsive

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

### Usage
```css
/* Mobile first */
.element { ... }

/* Tablet+ */
@media (min-width: 640px) { ... }

/* Desktop+ */
@media (min-width: 1024px) { ... }
```

## ✅ Design Rules

1. **No rounded corners** - Use sharp edges
2. **No heavy shadows** - Keep it flat
3. **Generous spacing** - 40px sections, 24px gaps
4. **Uppercase headlines** - All display text
5. **Strategic color** - Mostly black/white + accents
6. **Underline hovers** - Not animations

## 🚀 Quick Start

1. Use CSS variables: `color: var(--accent-yellow)`
2. Anton for headlines: `font-family: var(--display)`
3. Inter for body: `font-family: var(--sans)`
4. Uppercase display text: `text-transform: uppercase`
5. Clean spacing: `padding: 24px`, `gap: 24px`
