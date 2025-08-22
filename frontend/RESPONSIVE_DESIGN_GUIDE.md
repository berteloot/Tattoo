# Responsive Design Guide

## Overview

This guide documents the comprehensive responsive design improvements made to the Tattoo Artist Locator frontend. The application now follows a mobile-first approach with responsive breakpoints, flexible layouts, and optimized user experience across all device sizes.

## Responsive Breakpoints

### Tailwind CSS Breakpoints
```css
/* Custom breakpoints added */
xs: 475px      /* Extra small devices */
sm: 640px      /* Small devices */
md: 768px      /* Medium devices */
lg: 1024px     /* Large devices */
xl: 1280px     /* Extra large devices */
2xl: 1536px    /* 2X large devices */
3xl: 1600px    /* 3X large devices */
4xl: 1920px    /* 4X large devices */
```

### Container Responsive Padding
```css
/* Mobile-first container padding */
.container {
  padding: 0 1rem;           /* Default: 16px */
}

@media (min-width: 640px) {
  .container { padding: 0 2rem; }    /* 32px */
}

@media (min-width: 1024px) {
  .container { padding: 0 4rem; }    /* 64px */
}

@media (min-width: 1280px) {
  .container { padding: 0 5rem; }    /* 80px */
}

@media (min-width: 1536px) {
  .container { padding: 0 6rem; }    /* 96px */
}
```

## Typography Scale

### Responsive Font Sizes
```css
/* Mobile-first typography using clamp() */
h1, .disp-1 { 
  font-size: clamp(32px, 6vw, 92px);    /* 32px → 92px */
}

h2, .disp-2 { 
  font-size: clamp(24px, 4vw, 48px);    /* 24px → 48px */
}

h3 { 
  font-size: clamp(20px, 3vw, 24px);    /* 20px → 24px */
}

p { 
  font-size: clamp(14px, 2vw, 16px);    /* 14px → 16px */
}

.small { 
  font-size: clamp(12px, 2vw, 14px);    /* 12px → 14px */
}
```

### Responsive Spacing
```css
/* Mobile-first spacing using clamp() */
.hero { 
  padding: clamp(32px, 8vw, 48px) 0 clamp(16px, 4vw, 24px); 
}

.section { 
  padding: clamp(24px, 6vw, 40px) 0; 
}

.card { 
  gap: clamp(8px, 2vw, 10px); 
}
```

## Grid System

### Responsive Grid Classes
```css
/* Auto-responsive grid layouts */
.grid-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.grid-auto-fill {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

/* Responsive column counts */
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }

@media (min-width: 640px) { 
  .grid-cols-2 { grid-template-columns: repeat(2, 1fr); } 
}

@media (min-width: 1024px) { 
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); } 
}

@media (min-width: 1280px) { 
  .grid-cols-4 { grid-template-columns: repeat(4, 1fr); } 
}
```

### Responsive Grid Component
```jsx
import { ResponsiveGrid } from './UXComponents';

<ResponsiveGrid cols={3} gap="gap-6">
  {/* Grid items */}
</ResponsiveGrid>
```

## Navigation

### Mobile-First Navigation
```jsx
// Desktop navigation (hidden on mobile)
<nav className="hidden md:block">
  <ul>
    {navigation.map((item) => (
      <li key={item.name}>
        <Link to={item.href}>{item.name}</Link>
      </li>
    ))}
  </ul>
</nav>

// Mobile menu button (visible on mobile)
<div className="md:hidden">
  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
    {mobileMenuOpen ? <X /> : <Menu />}
  </button>
</div>

// Mobile navigation (shown when menu is open)
{mobileMenuOpen && (
  <div className="md:hidden">
    {/* Mobile menu content */}
  </div>
)}
```

### Responsive User Menu
```jsx
// Responsive text (shorter on smaller screens)
<span className="hidden lg:inline">DASHBOARD</span>
<span className="lg:hidden">DASH</span>

<span className="hidden lg:inline">ADMIN PANEL</span>
<span className="lg:hidden">ADMIN</span>
```

## Layout Components

### Responsive Container
```jsx
import { ResponsiveContainer } from './UXComponents';

<ResponsiveContainer maxWidth="max-w-7xl">
  {/* Content */}
</ResponsiveContainer>
```

### Responsive Card
```jsx
import { ResponsiveCard } from './UXComponents';

<ResponsiveCard hover={true} className="p-4 sm:p-6">
  {/* Card content */}
</ResponsiveCard>
```

### Responsive Button
```jsx
import { ResponsiveButton } from './UXComponents';

<ResponsiveButton 
  variant="primary" 
  size="md" 
  fullWidth={false}
>
  Button Text
</ResponsiveButton>
```

## Form Components

### Responsive Input
```jsx
import { ResponsiveInput } from './UXComponents';

<ResponsiveInput
  label="Email Address"
  error={emailError}
  placeholder="Enter your email"
  fullWidth={true}
/>
```

### Responsive Select
```jsx
import { ResponsiveSelect } from './UXComponents';

<ResponsiveSelect
  label="Specialty"
  options={[
    { value: 'traditional', label: 'Traditional' },
    { value: 'japanese', label: 'Japanese' }
  ]}
  fullWidth={true}
/>
```

### Responsive Textarea
```jsx
import { ResponsiveTextarea } from './UXComponents';

<ResponsiveTextarea
  label="Bio"
  rows={4}
  placeholder="Tell us about yourself"
  fullWidth={true}
/>
```

## Utility Classes

### Responsive Display
```css
.hidden-mobile { display: none; }
.visible-mobile { display: block; }

@media (min-width: 640px) {
  .hidden-mobile { display: block; }
  .visible-mobile { display: none; }
}
```

### Responsive Spacing
```css
.mobile-p-0 { padding: 0; }
.mobile-p-4 { padding: 1rem; }
.mobile-p-6 { padding: 1.5rem; }
.mobile-p-8 { padding: 2rem; }

@media (min-width: 640px) {
  .mobile-p-0 { padding: 0; }
  .mobile-p-4 { padding: 1rem; }
  .mobile-p-6 { padding: 1.5rem; }
  .mobile-p-8 { padding: 2rem; }
}
```

### Responsive Text Alignment
```css
.text-center-mobile { text-align: center; }
.text-left-mobile { text-align: left; }

@media (min-width: 640px) {
  .text-center-mobile { text-align: center; }
  .text-left-mobile { text-align: left; }
}
```

### Responsive Flexbox
```css
.flex-col-mobile { flex-direction: column; }
.flex-row-mobile { flex-direction: row; }

@media (min-width: 640px) {
  .flex-col-mobile { flex-direction: row; }
  .flex-row-mobile { flex-direction: row; }
}
```

## Component Examples

### Responsive Hero Section
```jsx
<section className="hero">
  <div className="container">
    <span className="tag tag--yellow">GLOBAL PLATFORM</span>
    <h1>THE WORLD'S LEADING TATTOO ARTIST NETWORK</h1>
    <p className="deck">
      Connect with exceptional tattoo artists worldwide...
    </p>
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
      <Link to="/map" className="cta text-center">
        <MapPin className="w-4 h-4 mr-2" />
        EXPLORE WORLDWIDE
      </Link>
      <Link to="/register" className="cta text-center">
        <Plus className="w-4 h-4 mr-2" />
        JOIN AS ARTIST
      </Link>
    </div>
  </div>
</section>
```

### Responsive Stats Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <Users className="h-6 w-6 text-gray-400" />
        <div className="ml-5 w-0 flex-1">
          <dt className="text-sm font-medium text-gray-500">Total Users</dt>
          <dd className="text-lg font-medium text-gray-900">
            {stats.totalUsers?.toLocaleString() || 0}
          </dd>
        </div>
      </div>
    </div>
  </div>
  {/* More stat cards... */}
</div>
```

### Responsive Filters
```jsx
<div className="border border-gray-200 p-4 sm:p-6 mb-8 md:mb-12 rounded-lg">
  <div className="space-y-4 sm:space-y-6">
    {/* Search */}
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search artists, studios, cities..."
          className="input w-full pl-12 text-base"
        />
      </div>
    </div>
    
    {/* Filters Row */}
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 sm:min-w-[200px]">
        <select className="input w-full text-base">
          <option value="">ALL SPECIALTIES</option>
          {/* Options */}
        </select>
      </div>
      <div className="flex-1 sm:min-w-[150px]">
        <select className="input w-full text-base">
          <option value="rating">SORT BY RATING</option>
          {/* Options */}
        </select>
      </div>
    </div>
  </div>
</div>
```

## Mobile-First Patterns

### 1. Stack on Mobile, Row on Desktop
```jsx
// Mobile: vertical stack, Desktop: horizontal row
<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
  <div className="flex-1">
    <h3>Title</h3>
    <p>Description</p>
  </div>
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
    <button className="btn">Action 1</button>
    <button className="btn">Action 2</button>
  </div>
</div>
```

### 2. Single Column on Mobile, Multi-Column on Desktop
```jsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3+ columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  {/* Grid items */}
</div>
```

### 3. Full Width on Mobile, Constrained on Desktop
```jsx
// Mobile: full width, Desktop: constrained width
<div className="w-full lg:w-auto">
  <button className="w-full sm:w-auto">Button</button>
</div>
```

### 4. Centered on Mobile, Left-Aligned on Desktop
```jsx
// Mobile: center, Desktop: left
<div className="text-center lg:text-left">
  <h2>Title</h2>
  <p>Description</p>
</div>
```

## Performance Considerations

### 1. Responsive Images
```jsx
// Use appropriate image sizes for different breakpoints
<img
  src={imageUrl}
  alt="Description"
  className="w-full h-auto object-cover"
  loading="lazy"
/>
```

### 2. Conditional Rendering
```jsx
// Only render heavy components when needed
{isDesktop && <HeavyComponent />}
{isMobile && <LightweightComponent />}
```

### 3. Responsive Loading States
```jsx
// Show appropriate loading states for different screen sizes
{loading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
) : (
  // Actual content
)}
```

## Testing Responsive Design

### 1. Browser DevTools
- Use Chrome DevTools Device Toolbar
- Test different device sizes
- Check responsive breakpoints

### 2. Common Test Sizes
```css
/* Test these viewport sizes */
320px   /* Small mobile */
375px   /* iPhone SE */
414px   /* iPhone Plus */
768px   /* iPad */
1024px  /* iPad Pro */
1280px  /* Desktop */
1440px  /* Large desktop */
1920px  /* Full HD */
```

### 3. Responsive Testing Checklist
- [ ] Mobile navigation works correctly
- [ ] Touch targets are appropriately sized (44px minimum)
- [ ] Text is readable on all screen sizes
- [ ] Images scale properly
- [ ] Forms are usable on mobile
- [ ] Buttons and links are accessible
- [ ] No horizontal scrolling on mobile
- [ ] Content doesn't overflow containers

## Best Practices

### 1. Mobile-First Approach
- Start with mobile design
- Add complexity for larger screens
- Use progressive enhancement

### 2. Flexible Units
- Use `clamp()` for responsive typography
- Use `minmax()` for responsive grids
- Use `vw` and `vh` sparingly

### 3. Consistent Spacing
- Use consistent spacing scale
- Maintain visual hierarchy
- Consider touch-friendly spacing

### 4. Performance
- Optimize images for different screen sizes
- Use lazy loading for off-screen content
- Minimize JavaScript on mobile

### 5. Accessibility
- Ensure touch targets are large enough
- Maintain keyboard navigation
- Test with screen readers

## Troubleshooting

### Common Issues

#### 1. Content Overflow
```css
/* Prevent horizontal overflow */
.container {
  overflow-x: hidden;
  width: 100%;
}

/* Use responsive padding */
.p-4 { padding: 1rem; }
@media (min-width: 640px) {
  .p-4 { padding: 1.5rem; }
}
```

#### 2. Grid Layout Issues
```css
/* Ensure grid items don't overflow */
.grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

/* Use responsive gaps */
.gap-4 { gap: 1rem; }
@media (min-width: 640px) {
  .gap-4 { gap: 1.5rem; }
}
```

#### 3. Text Scaling Issues
```css
/* Use clamp for smooth text scaling */
.text-responsive {
  font-size: clamp(14px, 2.5vw, 18px);
  line-height: 1.5;
}
```

## Conclusion

This responsive design system provides a solid foundation for creating mobile-first, accessible, and performant user interfaces. By following these patterns and using the provided components, developers can ensure consistent responsive behavior across all pages and components.

Remember to:
- Test on real devices when possible
- Use the browser dev tools for responsive testing
- Follow the mobile-first approach
- Maintain consistency across breakpoints
- Consider performance implications
- Ensure accessibility compliance
