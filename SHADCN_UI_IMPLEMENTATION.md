# shadcn/ui Implementation Guide

## Overview

This document describes the implementation of shadcn/ui with Radix UI primitives in the Mellifera beekeeping management application. The new design system provides a modern, accessible, and consistent UI across the application.

## What Was Implemented

### 1. Core Infrastructure

#### Dependencies Installed
```json
{
  "@radix-ui/react-dialog": "^latest",
  "@radix-ui/react-dropdown-menu": "^latest",
  "@radix-ui/react-select": "^latest",
  "@radix-ui/react-tabs": "^latest",
  "@radix-ui/react-toast": "^latest",
  "@radix-ui/react-tooltip": "^latest",
  "@radix-ui/react-slot": "^latest",
  "@radix-ui/react-label": "^latest",
  "class-variance-authority": "^latest",
  "clsx": "^latest",
  "tailwind-merge": "^latest",
  "lucide-react": "^latest",
  "tailwindcss-animate": "^latest"
}
```

#### Utility Functions
- **File**: `src/lib/utils.js`
- **Purpose**: Provides `cn()` function for merging Tailwind classes with proper precedence
- **Usage**: `cn("base-classes", conditionalClasses, className)`

### 2. Design Tokens

#### CSS Variables (`src/styles/globals.css`)
Implemented a comprehensive design token system with:
- **Light Mode**: Clean, professional color scheme with honey-gold accents
- **Dark Mode**: Comfortable dark theme with maintained brand colors
- **Semantic Colors**: Primary, secondary, destructive, muted, accent
- **Component Colors**: Background, foreground, border, input, ring
- **Custom Radius**: Configurable border radius via CSS variables

#### Tailwind Configuration (`tailwind.config.js`)
Extended Tailwind with:
- shadcn/ui design tokens (HSL-based colors)
- Custom beekeeping theme colors (honey, hive, bee)
- Container utilities
- Animation keyframes for Radix components
- Responsive breakpoints

### 3. UI Components Created

All components are located in `src/components/ui/`:

#### Button (`button.jsx`)
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon
- **Features**: 
  - Accessible focus states
  - Hover animations
  - Disabled states
  - Can render as child component via `asChild` prop

**Usage Example**:
```jsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">Click Me</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

#### Card (`card.jsx`)
- **Components**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Features**: Consistent spacing, shadows, and borders

**Usage Example**:
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Hive Statistics</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>
```

#### Dialog (`dialog.jsx`)
- **Based on**: Radix UI Dialog primitive
- **Components**: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- **Features**: 
  - Accessible modal dialogs
  - Smooth animations
  - Backdrop overlay
  - Close button with icon
  - Keyboard navigation (ESC to close)

**Usage Example**:
```jsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

#### Input (`input.jsx`)
- **Features**: 
  - Consistent styling
  - Focus ring
  - Disabled states
  - File input support
  - Placeholder styling

**Usage Example**:
```jsx
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="Enter email" />
```

#### Label (`label.jsx`)
- **Based on**: Radix UI Label primitive
- **Features**: Accessible form labels with proper associations

**Usage Example**:
```jsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

#### Badge (`badge.jsx`)
- **Variants**: default, secondary, destructive, outline
- **Features**: Status indicators, tags, labels

**Usage Example**:
```jsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Active</Badge>
<Badge variant="destructive">Critical</Badge>
```

#### Alert (`alert.jsx`)
- **Variants**: default, destructive
- **Components**: Alert, AlertTitle, AlertDescription
- **Features**: Icon support, semantic colors

**Usage Example**:
```jsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Error message here</AlertDescription>
</Alert>
```

### 4. Updated Components

#### Login Page (`src/components/forms/Login.jsx`)
**Improvements**:
- Modern card-based layout
- Proper form field spacing with Label + Input
- Alert component for error messages
- Gradient background
- Improved button styling
- Better visual hierarchy

**Before/After**:
- Before: Basic HTML inputs with inline Tailwind classes
- After: Semantic UI components with consistent design tokens

#### Guest Mode Button (`src/components/forms/GuestModeButton.jsx`)
**Improvements**:
- Uses Button component with outline variant
- Lucide React icons (UserCircle, Check)
- Better visual feedback
- Consistent with design system

## Design System Benefits

### 1. Consistency
- All components use the same design tokens
- Predictable behavior across the application
- Unified color palette and spacing

### 2. Accessibility
- Radix UI primitives are WCAG compliant
- Proper ARIA attributes
- Keyboard navigation support
- Focus management

### 3. Maintainability
- Centralized styling in CSS variables
- Easy theme switching (light/dark)
- Component variants reduce code duplication
- Type-safe with TypeScript support (if needed)

### 4. Developer Experience
- Intuitive API
- Composable components
- Clear documentation
- Easy to extend

## Color Palette

### Brand Colors (Beekeeping Theme)
```css
--honey-light: #FFA500
--honey: #FFD700
--honey-dark: #FF8C00

--hive-light: #F4E0B9
--hive: #E6CC95
--hive-dark: #D8B671

--bee-light: #F5E050
--bee: #FFD700
--bee-dark: #DAA520
```

### Semantic Colors (Light Mode)
```css
--primary: 45 93% 47% (Honey gold)
--secondary: 39 77% 83% (Hive light)
--accent: 45 100% 51% (Bee yellow)
--destructive: 0 84.2% 60.2% (Red)
--muted: 210 40% 96.1% (Light gray)
```

### Semantic Colors (Dark Mode)
```css
--primary: 45 93% 47% (Honey gold - same)
--secondary: 39 39% 41% (Hive dark)
--accent: 45 93% 47% (Bee yellow)
--destructive: 0 62.8% 30.6% (Dark red)
--muted: 217.2 32.6% 17.5% (Dark gray)
```

## Migration Guide

### Replacing Old Components

#### Old Button → New Button
```jsx
// Before
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  Click Me
</button>

// After
import { Button } from '@/components/ui/button';
<Button>Click Me</Button>
```

#### Old Modal → New Dialog
```jsx
// Before
<Modal isOpen={open} onClose={setOpen}>
  <div className="p-4">
    <h2>Title</h2>
    <p>Content</p>
  </div>
</Modal>

// After
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <p>Content</p>
  </DialogContent>
</Dialog>
```

#### Old Input → New Input + Label
```jsx
// Before
<input 
  type="text" 
  className="border rounded px-3 py-2"
  placeholder="Enter text"
/>

// After
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input id="field" placeholder="Enter text" />
</div>
```

## Next Steps

### Recommended Component Updates

1. **Dashboard** (`src/components/layout/Dashboard.jsx`)
   - Replace custom cards with Card components
   - Use Badge for status indicators
   - Implement Dialog for modals

2. **HiveDetails** (`src/pages/HiveDetails.jsx`)
   - Use Card for hive information sections
   - Replace buttons with Button component
   - Add Alert for warnings/errors

3. **Forms** (Various form components)
   - Standardize with Input + Label
   - Use Button variants consistently
   - Add form validation with Alert

4. **Lists** (HiveList, InspectionList, etc.)
   - Use Card for list items
   - Add Badge for statuses
   - Implement consistent spacing

5. **Modals** (Throughout app)
   - Replace all custom modals with Dialog
   - Ensure consistent behavior
   - Add proper close handlers

### Additional Components to Create

Consider adding these shadcn/ui components as needed:

- **Select**: Dropdown selections
- **Tabs**: Tabbed interfaces
- **Toast**: Notifications
- **Tooltip**: Helpful hints
- **Dropdown Menu**: Context menus
- **Accordion**: Collapsible sections
- **Table**: Data tables
- **Form**: Form validation wrapper

## Testing Checklist

- [ ] Login page renders correctly
- [ ] Guest mode button works
- [ ] Light/dark mode toggle works
- [ ] All button variants display properly
- [ ] Form inputs are accessible
- [ ] Dialogs open/close correctly
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Colors match brand guidelines
- [ ] Responsive design works on mobile

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## Support

For questions or issues with the new design system:
1. Check this documentation
2. Review component source code in `src/components/ui/`
3. Consult shadcn/ui documentation
4. Check Radix UI docs for primitive behavior

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
**Status**: Initial Implementation Complete