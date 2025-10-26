# Mellifera Brand Guidelines

## Brand Philosophy

Mellifera is a professional beekeeping management application designed for practical, nature-conscious beekeepers who value quality craftsmanship and reliable tools. The brand reflects the natural beauty of beekeeping while maintaining a sophisticated, trustworthy aesthetic.

## Target Audience

- **Professional Beekeepers**: Commercial operators managing multiple apiaries
- **Hobbyist Beekeepers**: Dedicated enthusiasts with 1-10 hives
- **Age Range**: 35-65 (primary), though accessible to all ages
- **Values**: Sustainability, craftsmanship, precision, nature connection
- **Tech Comfort**: Moderate to high; appreciates well-designed tools

## Color Palette

### Primary Colors

#### Rich Amber (Primary Brand Color)
- **Purpose**: Primary actions, CTAs, brand identity
- **Inspiration**: Pure, high-quality honey catching sunlight
- **Usage**: Buttons, links, highlights, active states
- **Palette**:
  ```
  honey-500: #e68a1f (Primary)
  honey-600: #c96d15 (Hover)
  honey-700: #a75214 (Active)
  ```

#### Warm Beeswax (Secondary)
- **Purpose**: Backgrounds, secondary elements, subtle highlights
- **Inspiration**: Natural beeswax, craft materials
- **Usage**: Cards, secondary buttons, hover states
- **Palette**:
  ```
  beeswax-100: #f9f4e8 (Light backgrounds)
  beeswax-200: #f3e8d0 (Subtle highlights)
  beeswax-500: #d0a955 (Accents)
  ```

### Supporting Colors

#### Deep Forest Green (Accent)
- **Purpose**: Success states, nature-related features, sustainability messaging
- **Inspiration**: Forest canopy, environmental stewardship
- **Usage**: Success messages, eco-features, accent elements
- **Palette**:
  ```
  forest-500: #458567 (Primary green)
  forest-600: #346a52 (Darker variant)
  forest-400: #62a383 (Lighter variant)
  ```

#### Natural Wood (Neutral)
- **Purpose**: Text, borders, neutral elements
- **Inspiration**: Hive boxes, natural wood materials
- **Usage**: Text, borders, dividers, neutral backgrounds
- **Palette**:
  ```
  wood-900: #483e38 (Dark text)
  wood-500: #8f7d6b (Medium neutral)
  wood-100: #edeae5 (Light backgrounds)
  ```

### Semantic Colors

#### Destructive/Warning
- **Color**: Earthy Red `#d94545`
- **Usage**: Errors, warnings, critical alerts
- **Rationale**: Muted red that doesn't clash with natural palette

#### Success
- **Color**: Forest Green `#458567`
- **Usage**: Success messages, completed tasks
- **Rationale**: Reinforces nature connection

## Typography

### Font Philosophy
- **Readability First**: Beekeepers often check apps outdoors in varying light
- **Professional**: Clean, modern sans-serif for credibility
- **Accessible**: High contrast, appropriate sizing

### Recommended Fonts
- **Primary**: Inter, SF Pro, System UI
- **Headings**: Bold (600-700 weight)
- **Body**: Regular (400 weight)
- **Small Text**: Medium (500 weight) for better legibility

### Size Scale
```
text-xs: 0.75rem (12px) - Labels, captions
text-sm: 0.875rem (14px) - Secondary text
text-base: 1rem (16px) - Body text
text-lg: 1.125rem (18px) - Subheadings
text-xl: 1.25rem (20px) - Card titles
text-2xl: 1.5rem (24px) - Page titles
```

## Design Principles

### 1. Natural & Sophisticated
- Use earth tones and natural colors
- Avoid overly bright or artificial colors
- Maintain professional appearance
- Balance warmth with credibility

### 2. Clear & Functional
- High contrast for outdoor readability
- Clear visual hierarchy
- Intuitive navigation
- Minimal cognitive load

### 3. Trustworthy & Reliable
- Consistent design patterns
- Professional polish
- Attention to detail
- Stable, predictable interactions

### 4. Connected to Nature
- Organic shapes where appropriate
- Natural color transitions
- Subtle textures (wood grain, honeycomb patterns)
- Environmental consciousness

## Component Styling

### Buttons

#### Primary Button
```jsx
<Button variant="default">
  // Rich amber background
  // White text
  // Subtle shadow
  // Smooth hover transition
</Button>
```

#### Secondary Button
```jsx
<Button variant="outline">
  // Transparent background
  // Wood-colored border
  // Hover: Beeswax background
</Button>
```

#### Accent Button
```jsx
<Button variant="accent">
  // Forest green background
  // For nature/eco features
</Button>
```

### Cards
- **Background**: White/Card color
- **Border**: Subtle wood-200
- **Shadow**: Soft, natural (shadow-lg)
- **Radius**: Medium (0.5rem)
- **Padding**: Generous (p-6)

### Forms
- **Inputs**: Clean, high contrast
- **Labels**: Clear, medium weight
- **Focus**: Amber ring
- **Validation**: Forest green (success), Earthy red (error)

## Dark Mode

### Philosophy
- **Use Case**: Evening planning, indoor use
- **Tone**: Warm, comfortable, not harsh
- **Contrast**: Maintained for readability

### Dark Mode Palette
```
Background: Deep wood tones (#1a1612)
Text: Warm off-white (#f5f1e8)
Primary: Glowing amber (slightly brighter)
Accents: Sage green (softer than light mode)
```

## Iconography

### Style
- **Type**: Line icons (Lucide React)
- **Weight**: Medium (2px stroke)
- **Size**: Consistent (h-5 w-5 for inline, h-6 w-6 for standalone)
- **Color**: Inherit from text or use primary color

### Common Icons
- 🐝 Bee/Hive: Brand identity
- 📊 Charts: Analytics
- 📍 Location: Apiary mapping
- 📝 Notes: Inspections
- ⚠️ Alert: Warnings
- ✓ Check: Success/completion

## Spacing & Layout

### Spacing Scale
```
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
6: 1.5rem (24px)
8: 2rem (32px)
12: 3rem (48px)
```

### Layout Principles
- **Generous Whitespace**: Don't crowd elements
- **Consistent Padding**: Use spacing scale
- **Visual Rhythm**: Maintain consistent gaps
- **Responsive**: Mobile-first approach

## Imagery

### Photography Style
- **Subject**: Real beekeeping scenes
- **Tone**: Natural, authentic, professional
- **Treatment**: Warm color grading
- **Avoid**: Stock photos, overly staged shots

### Illustrations
- **Style**: Simple, line-based
- **Color**: Brand palette
- **Use**: Onboarding, empty states, feature highlights

## Voice & Tone

### Voice Characteristics
- **Professional**: Knowledgeable but not pretentious
- **Helpful**: Supportive and encouraging
- **Clear**: Direct and unambiguous
- **Respectful**: Values user expertise

### Tone Examples
- ✅ "Your hive inspection is complete"
- ❌ "Yay! You did it!"
- ✅ "3 hives need attention"
- ❌ "Uh oh! Problems detected!"

## Accessibility

### WCAG Compliance
- **Target**: WCAG 2.1 AA minimum
- **Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Focus States**: Always visible
- **Keyboard Navigation**: Full support

### Color Blindness
- **Never rely on color alone**: Use icons, text, patterns
- **Test**: Deuteranopia, Protanopia, Tritanopia
- **High Contrast Mode**: Support system preferences

## Animation

### Principles
- **Subtle**: Enhance, don't distract
- **Fast**: 150-300ms for most transitions
- **Natural**: Ease-out for entrances, ease-in for exits
- **Purposeful**: Every animation has a reason

### Common Animations
- **Hover**: Slight scale (1.02), color shift
- **Click**: Brief scale down (0.98)
- **Page Transitions**: Fade + slight slide
- **Loading**: Subtle pulse or spinner

## Do's and Don'ts

### ✅ Do
- Use natural, earthy colors
- Maintain high contrast
- Keep interfaces clean and uncluttered
- Test in outdoor lighting conditions
- Respect user expertise
- Provide clear feedback
- Use consistent patterns

### ❌ Don't
- Use bright, artificial colors
- Overcomplicate interfaces
- Use childish or playful language
- Ignore accessibility
- Assume technical knowledge
- Hide important information
- Break established patterns

## Implementation Notes

### CSS Variables
All colors are defined as HSL values in CSS variables for easy theming:
```css
--primary: 32 95% 44%; /* Rich Amber */
--accent: 142 40% 35%; /* Forest Green */
```

### Tailwind Classes
Use semantic color names:
```jsx
className="bg-primary text-primary-foreground"
className="bg-accent text-accent-foreground"
```

### Component Library
All components follow shadcn/ui patterns with custom brand colors applied through design tokens.

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
**Maintained By**: Mellifera Design Team