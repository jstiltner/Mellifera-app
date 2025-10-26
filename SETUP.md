# Mellifera App - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x or higher (LTS recommended)
- **npm**: Version 10.x or higher (comes with Node.js)
- **MongoDB**: Either local installation or MongoDB Atlas account
- **Git**: For version control

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jstiltner/Mellifera-app.git
cd Mellifera-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required - Database
ATLAS_URI=mongodb://localhost:27017/mellifera-dev

# Required - Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d
SESSION_SECRET=your-super-secret-session-key-change-this

# Optional - OAuth (for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Optional - AWS (for voice features)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Optional - OpenAI (for NLU features)
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
NODE_ENV=development
PORT=5050
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services app
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `ATLAS_URI` in `.env`

### 5. Run the Application

The development script will automatically:
1. Create a default dev user
2. Start the backend server (port 5050)
3. Start the frontend dev server (port 3000)

```bash
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5050
- **API Documentation**: http://localhost:5050/api-docs

### 7. Login

Use the default development credentials:

```
Email: dev@mellifera.local
Password: dev123
```

## Detailed Setup

### Database Setup

#### Local MongoDB

1. **Install MongoDB**:
   - macOS: `brew install mongodb-community`
   - Ubuntu: Follow [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
   - Windows: Download from [MongoDB website](https://www.mongodb.com/try/download/community)

2. **Start MongoDB**:
   ```bash
   mongod --dbpath /path/to/data/directory
   ```

3. **Verify Connection**:
   ```bash
   mongosh
   ```

#### MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and update `.env`

### Development User

The app automatically creates a development user when you run `npm run dev`. If you need to manually create it:

```bash
npm run seed:dev
```

This creates:
- Email: `dev@mellifera.local`
- Password: `dev123`

### Optional Features Setup

#### Voice Features (AWS Polly)

1. Create AWS account
2. Create IAM user with Polly permissions
3. Get access key and secret key
4. Add to `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=us-east-1
   ```

#### Natural Language Understanding (OpenAI)

1. Create account at [OpenAI](https://platform.openai.com/)
2. Generate API key
3. Add to `.env`:
   ```env
   OPENAI_API_KEY=your-openai-key
   ```

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5050/auth/google/callback`
6. Add credentials to `.env`

#### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:5050/auth/facebook/callback`
5. Add credentials to `.env`

## Available Scripts

```bash
# Development
npm run dev              # Start both client and server with auto-reload
npm run dev:client       # Start only frontend (Vite)
npm run dev:server       # Start only backend (Nodemon)
npm run seed:dev         # Create development user

# Production
npm start                # Start production server
npm run build            # Build frontend for production

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
```

## Project Structure

```
Mellifera-app/
├── server/              # Backend (Express.js)
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── scripts/         # Utility scripts
│   └── index.js         # Server entry point
├── src/                 # Frontend (React)
│   ├── api/             # API client functions
│   ├── components/      # React components
│   ├── config/          # Frontend configuration
│   ├── context/         # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── styles/          # CSS/Tailwind styles
│   ├── utils/           # Utility functions
│   └── index.jsx        # Frontend entry point
├── public/              # Static assets
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 5050 are already in use:

```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

Or change ports in:
- Frontend: `vite.config.js` (server.port)
- Backend: `.env` (PORT variable)

### MongoDB Connection Issues

1. **Check MongoDB is running**:
   ```bash
   mongosh
   ```

2. **Verify connection string** in `.env`

3. **Check firewall settings** (for Atlas)

4. **Whitelist IP address** (for Atlas)

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear build cache
rm -rf dist .vite
npm run build
```

### Authentication Issues

1. **Clear browser storage**:
   - Open DevTools (F12)
   - Application tab → Clear storage

2. **Recreate dev user**:
   ```bash
   npm run seed:dev
   ```

3. **Check JWT_SECRET** in `.env`

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite HMR (instant)
- Backend: Nodemon (restarts on file changes)

### API Testing

Use the Swagger UI at http://localhost:5050/api-docs to test API endpoints.

### Database GUI

Recommended tools:
- [MongoDB Compass](https://www.mongodb.com/products/compass) (official)
- [Studio 3T](https://studio3t.com/) (feature-rich)
- [Robo 3T](https://robomongo.org/) (lightweight)

### Browser DevTools

- React DevTools: [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- React Query DevTools: Built-in (bottom-left corner in dev mode)

## Production Deployment

### Environment Variables

Set production values for:
- `NODE_ENV=production`
- Strong `JWT_SECRET` and `SESSION_SECRET`
- Production `ATLAS_URI`
- Remove or secure development credentials

### Build

```bash
npm run build
```

### Docker Deployment

```bash
# Build image
docker build -t mellifera-app -f Dockerfile.prod .

# Run container
docker run -p 5050:5050 --env-file .env mellifera-app
```

### Kubernetes Deployment

See `kubernetes/` directory for deployment manifests.

## Support

- **Issues**: [GitHub Issues](https://github.com/jstiltner/Mellifera-app/issues)
- **Documentation**: [README.md](README.md)
- **Contact**: mr@jasonstiltner.com

## License

This project is proprietary software. All rights reserved.