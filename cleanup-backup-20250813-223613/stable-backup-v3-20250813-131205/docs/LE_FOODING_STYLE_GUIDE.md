# Le Fooding Style Guide

## Overview

This document outlines the complete Le Fooding design system implemented across the Tattooed World application. The design is inspired by the clean, editorial aesthetic of lefooding.com with a focus on typography, minimal design, and strategic use of accent colors.

## 🎨 Color Palette

### CSS Variables
```css
:root {
  --bg: #ffffff;          /* Main background - Pure white */
  --text: #111111;        /* Primary text - Near black */
  --muted: #666666;       /* Secondary text - Medium gray */
  --border: #eaeaea;      /* Borders and dividers - Light gray */

  --accent-yellow: #FFE600;  /* Primary accent - Bright yellow */
  --accent-red: #FF3B30;     /* Error/Admin accent - Red */
  --accent-blue: #1E3DFF;    /* Link/Interactive accent - Blue */
}
```

### Color Usage Guidelines

#### Primary Colors
- **White (`--bg`)**: Main background, card backgrounds, button backgrounds
- **Black (`--text`)**: Headlines, body text, primary content
- **Medium Gray (`--muted`)**: Secondary text, metadata, placeholders
- **Light Gray (`--border`)**: Borders, dividers, input borders

#### Accent Colors
- **Yellow (`--accent-yellow`)**: 
  - Category tags
  - Highlights and badges
  - Icon backgrounds
  - Price displays
  - Primary action elements

- **Blue (`--accent-blue`)**:
  - Links and navigation
  - Interactive elements
  - Focus states
  - Secondary actions

- **Red (`--accent-red`)**:
  - Error messages
  - Admin-specific elements
  - Destructive actions
  - Warning states

## 📝 Typography

### Font Stack
```css
--display: "Anton", Impact, "Helvetica Neue Condensed", "Arial Narrow", Arial, sans-serif;
--sans: "Inter", "Helvetica Neue", Arial, sans-serif;
```

### Font Usage

#### Display Typography (Anton)
- **All headlines** (h1, h2, h3)
- **Navigation items**
- **Button text**
- **Card titles**
- **Section titles**
- **Brand/logo text**

#### Body Typography (Inter)
- **Body text and paragraphs**
- **Form labels**
- **Metadata**
- **Descriptions**
- **Small text**

### Typography Scale
```css
/* Main Headlines */
h1, .disp-1 { 
  font-family: var(--display); 
  font-weight: 400; 
  text-transform: uppercase; 
  line-height: .95; 
  letter-spacing: .2px; 
  font-size: clamp(40px, 7vw, 92px); 
  margin: 0 0 .4em; 
}

/* Section Headlines */
h2, .disp-2 { 
  font-family: var(--display); 
  text-transform: uppercase; 
  line-height: .95; 
  font-size: clamp(28px, 4vw, 48px); 
  margin: 0 0 .5em; 
}

/* Sub Headlines */
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

/* Small Text */
.small { 
  font-size: 14px; 
  color: var(--muted); 
}
```

## 🏗️ Layout System

### Container & Spacing
```css
.container { 
  max-width: var(--maxw);  /* 1200px */
  margin: 0 auto; 
  padding: 0 16px; 
}

.section { 
  padding: 40px 0; 
}

--gap: 24px;  /* Standard grid gap */
```

### Grid System
```css
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

## 🧩 Component Classes

### Navigation
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

.brand { 
  font-family: var(--display); 
  letter-spacing: .5px; 
  text-transform: uppercase; 
  font-size: 20px; 
}
```

### Buttons & CTAs
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

### Tags & Badges
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

### Cards
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
```

### Forms
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
}

.input:focus {
  outline: 2px solid var(--accent-blue); 
  outline-offset: 2px;
}

.input::placeholder {
  color: var(--muted);
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
```css
/* Mobile first */
.grid { grid-template-columns: 1fr; }

/* Tablet */
@media (min-width: 640px) { 
  .grid-cols-2 { grid-template-columns: repeat(2, 1fr); } 
}

/* Desktop */
@media (min-width: 1024px) { 
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); } 
}
```

## 🎯 Design Principles

### 1. **No Rounded Corners**
- All elements use sharp, clean edges
- No `border-radius` except for focus outlines

### 2. **Minimal Shadows**
- No heavy drop shadows or box-shadows
- Clean, flat design aesthetic

### 3. **Generous White Space**
- 40px section padding
- 24px grid gaps
- Proper breathing room between elements

### 4. **Typography Hierarchy**
- Anton for headlines and emphasis
- Inter for readability and UI
- All headlines uppercase
- Clear size relationships

### 5. **Strategic Color Use**
- Primarily black and white
- Yellow for highlights and categories
- Blue for interactions
- Red for warnings/admin

### 6. **Hover States**
- Underlines for text links
- Background fills for buttons
- Subtle transforms for images
- No complex animations

## 📄 Page-Specific Implementations

### Home Page
- Hero section with yellow tags
- Statistics cards with transparent backgrounds
- Feature icons with yellow backgrounds
- Artist cards with yellow accents
- Black CTA section with white text

### Artists Page
- Hero section with statistics
- Filter bar with clean inputs
- Grid/list toggle buttons
- Artist cards with hover effects
- Yellow specialty tags

### Authentication Pages
- Centered forms with yellow tags
- Clean input styling
- Blue accent links
- Red error messages
- Consistent button styling

### Layout Component
- Sticky navigation with brand typography
- Clean footer with grid layout
- Mobile-responsive menu
- Consistent spacing throughout

## 🔧 Implementation Notes

### CSS Variables Usage
Always use CSS variables for consistency:
```css
/* Good */
color: var(--accent-yellow);
background: var(--bg);

/* Avoid */
color: #FFE600;
background: white;
```

### Font Loading
Fonts are loaded via Google Fonts:
```css
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700&display=swap");
```

### Accessibility
- Focus outlines use `var(--accent-blue)`
- Sufficient color contrast ratios
- Semantic HTML structure
- Screen reader friendly navigation

## 📝 Usage Examples

### Creating a Yellow Tag
```jsx
<span className="tag tag--yellow">FEATURED</span>
```

### Creating a CTA Button
```jsx
<button className="cta">VIEW PROFILE</button>
```

### Creating a Card
```jsx
<div className="card">
  <div className="card__media">
    <img src="..." alt="..." />
  </div>
  <div style={{ padding: '24px' }}>
    <span className="tag tag--yellow">CATEGORY</span>
    <h3 className="card__title">TITLE</h3>
    <p className="card__meta">Metadata</p>
  </div>
</div>
```

### Creating a Form Input
```jsx
<div>
  <label style={{ 
    display: 'block', 
    marginBottom: '8px', 
    fontSize: '14px', 
    fontWeight: '600', 
    textTransform: 'uppercase' 
  }}>
    EMAIL ADDRESS
  </label>
  <input
    type="email"
    className="input"
    placeholder="Enter your email"
    style={{ width: '100%' }}
  />
</div>
```

## 🚀 Deployment

The Le Fooding styling system is fully implemented and deployed at:
`https://tattooed-world-backend.onrender.com/`

All components follow these guidelines and maintain visual consistency across the entire application.
