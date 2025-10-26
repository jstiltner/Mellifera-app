# Migration Guide - Mellifera App Updates

This guide helps you migrate from the previous version to the updated architecture.

## Overview of Changes

### 1. Node Version Update
- **Old**: Node 18.x (strict)
- **New**: Node 20.x+ (flexible)

### 2. Development Authentication
- **New**: Automatic dev user creation
- **Credentials**: `dev@mellifera.local` / `dev123`

### 3. API Configuration
- **Old**: Hardcoded URLs in components
- **New**: Centralized configuration in `src/config/api.js`

### 4. Error Handling
- **Old**: Inconsistent error handling across components
- **New**: Standardized error handling utilities

### 5. Component Architecture
- **Old**: Large monolithic components
- **New**: Modular, focused components

## Migration Steps

### Step 1: Update Node.js

```bash
# Check current version
node --version

# If < 20.x, upgrade Node.js
# Using nvm (recommended):
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### Step 2: Clean Install Dependencies

```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Install with new Node version
npm install
```

### Step 3: Create Environment File

```bash
# Copy the example
cp .env.example .env

# Edit with your values
# Minimum required:
# - ATLAS_URI
# - JWT_SECRET
# - SESSION_SECRET
```

### Step 4: Update Existing Code (If Customized)

#### API Calls

**Before:**
```javascript
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5050';
const response = await axios.get('/api/hives');
```

**After:**
```javascript
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

axios.defaults.baseURL = API_CONFIG.baseURL;
const response = await axios.get(API_ENDPOINTS.HIVES.BASE);
```

#### Error Handling

**Before:**
```javascript
try {
  await someAction();
} catch (error) {
  console.error(error);
  toast.error(error.message);
}
```

**After:**
```javascript
import { handleApiError, showSuccessToast } from '../utils/errorHandler';

try {
  await someAction();
  showSuccessToast('Action completed successfully');
} catch (error) {
  handleApiError(error, 'performing action');
}
```

#### React Query Mutations

**Before:**
```javascript
const mutation = useMutation({
  mutationFn: updateHive,
  onSuccess: () => {
    queryClient.invalidateQueries(['hive']);
  },
  onError: (error) => {
    console.error(error);
  },
});
```

**After:**
```javascript
import { createMutationErrorHandler, createMutationSuccessHandler } from '../utils/errorHandler';

const mutation = useMutation({
  mutationFn: updateHive,
  onSuccess: createMutationSuccessHandler('Hive updated successfully'),
  onError: createMutationErrorHandler('updating hive'),
});
```

### Step 5: Database Setup

#### New Users

```bash
# Start MongoDB
# Then run:
npm run seed:dev
```

#### Existing Users

Your existing database will work as-is. The seed script only creates a user if it doesn't exist.

### Step 6: Start Development

```bash
# This will:
# 1. Create dev user (if needed)
# 2. Start backend (port 5050)
# 3. Start frontend (port 3000)
npm run dev
```

## Breaking Changes

### 1. Vite Proxy Configuration

The proxy no longer rewrites `/api` paths. Update any custom API calls:

**Before:**
```javascript
// Proxy would rewrite /api to /
fetch('/api/hives') // → http://localhost:5050/hives
```

**After:**
```javascript
// Proxy preserves /api
fetch('/api/hives') // → http://localhost:5050/api/hives
```

### 2. CORS Configuration

The server now accepts multiple origins. If you have custom CORS needs, update `server/index.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5050',
  'https://your-production-domain.com', // Add your domain
];
```

### 3. Component Props

Some refactored components have updated prop interfaces:

#### Dashboard Components

**ApiarySection** now expects:
```javascript
<ApiarySection
  apiaries={apiaries}
  onApiaryCreate={handleCreate}
  isLoading={isLoading}
/>
```

**MapSection** now expects:
```javascript
<MapSection apiaries={apiaries} />
```

### 4. Error Handling

The old `errorHandling.js` utilities are deprecated. Use the new `errorHandler.js`:

**Deprecated:**
```javascript
import { errorToast, successToast } from './utils/errorHandling';
```

**New:**
```javascript
import { showErrorToast, showSuccessToast } from './utils/errorHandler';
// Or use the legacy exports:
import { errorToast, successToast } from './utils/errorHandler';
```

## Testing Your Migration

### 1. Verify Environment

```bash
# Check Node version
node --version  # Should be 20.x+

# Check npm version
npm --version   # Should be 10.x+
```

### 2. Test Database Connection

```bash
# Should connect without errors
npm run seed:dev
```

### 3. Test Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and verify:
- [ ] Login page loads
- [ ] Can login with dev credentials
- [ ] Dashboard displays
- [ ] API calls work (check Network tab)
- [ ] No console errors

### 4. Test API Endpoints

Visit http://localhost:5050/api-docs and test:
- [ ] Authentication endpoints
- [ ] Hive endpoints
- [ ] Apiary endpoints

### 5. Test Error Handling

Trigger an error (e.g., invalid login) and verify:
- [ ] User-friendly error message displays
- [ ] Error is logged to console
- [ ] App doesn't crash

## Rollback Plan

If you need to rollback:

### 1. Revert Code Changes

```bash
git checkout <previous-commit-hash>
```

### 2. Reinstall Old Dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. Restore Old Environment

```bash
# Restore your old .env file
cp .env.backup .env
```

## Common Issues

### Issue: "engine-strict" Error

**Solution**: The `.npmrc` file now has `engine-strict=false`. If you still see this:

```bash
npm config set engine-strict false
```

### Issue: Port Already in Use

**Solution**:
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5050
lsof -i :5050 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Issue: MongoDB Connection Failed

**Solution**:
1. Verify MongoDB is running: `mongosh`
2. Check `ATLAS_URI` in `.env`
3. For Atlas, verify IP whitelist

### Issue: Cannot Login

**Solution**:
```bash
# Recreate dev user
npm run seed:dev

# Clear browser storage
# DevTools → Application → Clear storage
```

### Issue: API Calls Failing

**Solution**:
1. Check browser console for errors
2. Verify proxy configuration in `vite.config.js`
3. Check CORS settings in `server/index.js`
4. Ensure backend is running on port 5050

## Getting Help

If you encounter issues:

1. Check the [SETUP.md](SETUP.md) guide
2. Review console errors (browser and terminal)
3. Check [GitHub Issues](https://github.com/jstiltner/Mellifera-app/issues)
4. Contact: mr@jasonstiltner.com

## Next Steps

After successful migration:

1. **Review New Features**: Check `SETUP.md` for new capabilities
2. **Update Documentation**: Update any custom documentation
3. **Test Thoroughly**: Run through all user workflows
4. **Update CI/CD**: Update deployment scripts if needed
5. **Train Team**: Share migration guide with team members

## Changelog

### Added
- Centralized API configuration
- Standardized error handling
- Development user auto-creation
- Comprehensive setup documentation
- Modular component architecture
- Loading states for all mutations
- Better CORS configuration

### Changed
- Node version requirement (18.x → 20.x+)
- Component structure (monolithic → modular)
- Error handling approach
- Vite proxy configuration
- npm engine strictness

### Fixed
- Hardcoded API URLs
- Inconsistent error messages
- Missing loading states
- Port configuration issues
- CORS origin handling

### Deprecated
- Old `errorHandling.js` utilities (use `errorHandler.js`)
- Hardcoded API URLs in components