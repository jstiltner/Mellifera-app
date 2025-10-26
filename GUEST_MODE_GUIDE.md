# Guest Mode Implementation Guide

## Overview

Guest Mode allows users to try Mellifera without creating an account or connecting to a database. All data is stored locally in the browser using localStorage, providing a seamless experience for users who want to explore the app before committing.

## Features

### Core Capabilities
- ✅ **No Account Required** - Start using immediately
- ✅ **Full CRUD Operations** - Create, read, update, delete all entities
- ✅ **Persistent Storage** - Data survives page refreshes
- ✅ **Data Export** - Export guest data for sync when creating account
- ✅ **Graceful Degradation** - Works even when backend is unavailable

### Supported Entities
- Apiaries
- Hives
- Inspections
- Treatments
- Feedings
- Equipment

## Architecture

### Components

#### 1. GuestModeContext (`src/context/GuestModeContext.jsx`)
Central state management for guest mode.

**Key Functions:**
```javascript
enableGuestMode()      // Activate guest mode
disableGuestMode()     // Deactivate (when user logs in)
clearGuestData()       // Clear all local data
exportGuestData()      // Export for sync
importSyncedData()     // Import after sync
```

**Guest Operations:**
```javascript
guestOperations.create(collection, item)
guestOperations.getAll(collection)
guestOperations.getById(collection, id)
guestOperations.update(collection, id, updates)
guestOperations.delete(collection, id)
guestOperations.query(collection, filterFn)
```

#### 2. useGuestModeQuery Hook (`src/hooks/useGuestModeQuery.js`)
Unified data fetching that works in both guest and authenticated modes.

**Usage:**
```javascript
const { data, isLoading } = useGuestModeQuery({
  queryKey: ['hives'],
  queryFn: async () => {
    // API call for authenticated mode
    const response = await fetch('/api/hives');
    return response.json();
  },
  guestCollection: 'hives',
  guestFilter: (hive) => hive.apiaryId === apiaryId, // Optional
});
```

#### 3. GuestModeButton (`src/components/forms/GuestModeButton.jsx`)
Login page component for entering guest mode.

#### 4. GuestModeBanner (`src/components/common/GuestModeBanner.jsx`)
Dashboard banner showing guest mode status and options.

## Implementation Guide

### Step 1: Wrap App with GuestModeProvider

```jsx
// src/index.jsx
import { GuestModeProvider } from './context/GuestModeContext';

root.render(
  <GuestModeProvider>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </GuestModeProvider>
);
```

### Step 2: Add Guest Mode Button to Login

```jsx
// src/components/forms/Login.jsx
import GuestModeButton from './GuestModeButton';

function Login() {
  return (
    <div>
      {/* Existing login form */}
      <GuestModeButton />
    </div>
  );
}
```

### Step 3: Add Guest Mode Banner to Dashboard

```jsx
// src/components/layout/Dashboard.jsx
import GuestModeBanner from '../common/GuestModeBanner';

function Dashboard() {
  return (
    <div>
      <GuestModeBanner />
      {/* Rest of dashboard */}
    </div>
  );
}
```

### Step 4: Update Data Hooks

Replace standard React Query hooks with guest-mode-aware hooks:

```jsx
// Before
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data } = useQuery({
    queryKey: ['hives'],
    queryFn: fetchHives,
  });
}

// After
import { useGuestModeHives } from '../hooks/useGuestModeQuery';

function MyComponent() {
  const { data } = useGuestModeHives();
}
```

### Step 5: Update Mutations

```jsx
import { useGuestModeMutation } from '../hooks/useGuestModeQuery';

function MyComponent() {
  const createHive = useGuestModeMutation({
    mutationFn: async (hiveData) => {
      const response = await fetch('/api/hives', {
        method: 'POST',
        body: JSON.stringify(hiveData),
      });
      return response.json();
    },
    guestCollection: 'hives',
    guestOperation: 'create',
    invalidateKeys: [['hives']],
  });

  const handleCreate = () => {
    createHive.mutate({ name: 'New Hive', /* ... */ });
  };
}
```

## Data Structure

### LocalStorage Keys
```javascript
mellifera_guest_mode    // Boolean: is guest mode active
mellifera_guest_data    // JSON: all guest data
mellifera_guest_id      // String: unique guest session ID
```

### Guest Data Schema
```javascript
{
  apiaries: [
    {
      _id: "uuid",
      name: "My Apiary",
      location: { lat: 0, lng: 0 },
      createdAt: "ISO date",
      updatedAt: "ISO date",
      guestId: "guest-uuid"
    }
  ],
  hives: [
    {
      _id: "uuid",
      name: "Hive 1",
      apiaryId: "apiary-uuid",
      // ... other fields
      createdAt: "ISO date",
      updatedAt: "ISO date",
      guestId: "guest-uuid"
    }
  ],
  inspections: [...],
  treatments: [...],
  feedings: [...],
  equipment: [...],
  lastSync: null
}
```

## User Flow

### 1. First Visit
```
User visits login page
  ↓
Clicks "Continue as Guest"
  ↓
Guest mode activated
  ↓
Redirected to dashboard
  ↓
Can use all features
```

### 2. Creating Account Later
```
User in guest mode
  ↓
Clicks "Create Account to Sync" in banner
  ↓
Guest data exported to sessionStorage
  ↓
Redirected to registration
  ↓
After registration, data synced to backend
  ↓
Guest mode disabled, user authenticated
```

### 3. Data Persistence
```
User creates hives/inspections
  ↓
Data saved to localStorage
  ↓
User closes browser
  ↓
User returns later
  ↓
Guest mode auto-restored
  ↓
All data still available
```

## Backend Considerations

### Server Startup Without MongoDB

The seed script now handles missing MongoDB gracefully:

```javascript
// server/scripts/seedDevUser.js
if (!process.env.ATLAS_URI) {
  console.log('⚠️  MongoDB not configured - skipping dev user seeding');
  console.log('   Guest mode will be available without database');
  return; // Don't exit, allow server to start
}
```

### API Endpoints

When MongoDB is unavailable, API endpoints should return appropriate errors:

```javascript
// Example middleware
function requireDatabase(req, res, next) {
  if (!mongoose.connection.readyState) {
    return res.status(503).json({
      error: 'Database Unavailable',
      message: 'Please use guest mode or configure database',
    });
  }
  next();
}
```

## Testing

### Manual Testing Checklist

- [ ] Can enter guest mode from login page
- [ ] Guest mode banner appears on dashboard
- [ ] Can create apiaries in guest mode
- [ ] Can create hives in guest mode
- [ ] Can create inspections in guest mode
- [ ] Data persists after page refresh
- [ ] Can view item counts in banner
- [ ] Can clear guest data
- [ ] Can export guest data
- [ ] Guest mode works without backend running

### Unit Tests

```javascript
// Example test
describe('GuestModeContext', () => {
  it('should enable guest mode', () => {
    const { result } = renderHook(() => useGuestMode());
    act(() => {
      result.current.enableGuestMode();
    });
    expect(result.current.isGuestMode).toBe(true);
  });

  it('should create items in guest mode', () => {
    const { result } = renderHook(() => useGuestMode());
    act(() => {
      result.current.enableGuestMode();
      result.current.guestOperations.create('hives', {
        name: 'Test Hive',
      });
    });
    expect(result.current.guestData.hives).toHaveLength(1);
  });
});
```

## Limitations

### Current Limitations
1. **No Cross-Device Sync** - Data only on current browser
2. **Browser Storage Limits** - ~5-10MB depending on browser
3. **No AI Features** - Requires backend services
4. **No Voice Features** - Requires AWS services
5. **No Collaboration** - Single-user only

### Future Enhancements
1. **IndexedDB Support** - For larger datasets
2. **Service Worker** - For offline functionality
3. **Data Compression** - To maximize storage
4. **Partial Sync** - Sync only changed data
5. **Conflict Resolution** - Handle sync conflicts

## Security Considerations

### Data Privacy
- Guest data never leaves the browser
- No tracking or analytics on guest users
- Data cleared when user clears browser data

### Best Practices
- Don't store sensitive information in guest mode
- Encourage users to create accounts for important data
- Provide clear warnings about data persistence

## Troubleshooting

### Guest Data Not Persisting
**Problem:** Data disappears after refresh

**Solutions:**
1. Check if localStorage is enabled
2. Verify browser isn't in private/incognito mode
3. Check browser storage quota

### Can't Enter Guest Mode
**Problem:** Guest mode button doesn't work

**Solutions:**
1. Check console for JavaScript errors
2. Verify GuestModeProvider is wrapping app
3. Check if localStorage is accessible

### Data Not Syncing After Registration
**Problem:** Guest data lost when creating account

**Solutions:**
1. Verify exportGuestData() is called before registration
2. Check sessionStorage for exported data
3. Implement sync endpoint on backend

## API Reference

### GuestModeContext

```typescript
interface GuestModeContextValue {
  isGuestMode: boolean;
  guestId: string | null;
  guestData: GuestData;
  enableGuestMode: () => void;
  disableGuestMode: () => void;
  clearGuestData: () => void;
  guestOperations: GuestOperations;
  exportGuestData: () => ExportedData;
  importSyncedData: (data: any) => void;
}
```

### useGuestModeQuery

```typescript
function useGuestModeQuery<T>({
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  guestCollection: string;
  guestFilter?: (item: any) => boolean;
  ...options: UseQueryOptions;
}): UseQueryResult<T>;
```

### useGuestModeMutation

```typescript
function useGuestModeMutation<T>({
  mutationFn: (variables: any) => Promise<T>;
  guestCollection: string;
  guestOperation: 'create' | 'update' | 'delete';
  invalidateKeys?: QueryKey[];
  ...options: UseMutationOptions;
}): UseMutationResult<T>;
```

## Conclusion

Guest Mode provides a frictionless way for users to try Mellifera without any setup. By storing data locally and providing a clear path to account creation, we reduce barriers to entry while maintaining data integrity and user trust.

For questions or issues, refer to the main documentation or create an issue on GitHub.

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-26  
**Status:** Implementation Complete