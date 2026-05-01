# Vercel Deployment Guide

This guide will help you deploy the FreelanceOS web application to Vercel.

## Prerequisites

1. **Vercel Account**: Create a free Vercel account at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install Vercel CLI globally
   ```bash
   npm install -g vercel
   ```
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
4. **Supabase Project**: Have your Supabase URL and anon key ready

## Step 1: Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vercel Configuration
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Environment
NODE_ENV=production
```

## Step 2: Build for Production

```bash
npm run build:vercel
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   npm run deploy:vercel
   ```

### Option B: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard** > [vercel.com](https://vercel.com/dashboard)
2. **Click "Add New..."** > "Project"
3. **Import Git Repository**:
   - Connect your Git provider (GitHub, GitLab, etc.)
   - Select your FreelanceOS repository
   - Click "Import"

4. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

6. **Deploy**: Click "Deploy"

## Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Project settings > Domains
2. Click "Add" to add custom domain
3. Follow DNS configuration instructions

## Step 5: Verify Deployment

Test these features on your deployed site:

1. **Homepage loads** correctly
2. **Login/Signup** works
3. **Dashboard navigation** functions
4. **Messages system** operates
5. **Settings page** saves preferences

## Configuration Files

The following files have been created/updated for Vercel deployment:

- `vercel.json` - Vercel configuration
- `public/_redirects` - Client-side routing
- `public/_headers` - Security headers
- `VERCEL_DEPLOYMENT.md` - This deployment guide

## Vercel Configuration

### Build Settings
- **Framework**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Install command**: `npm install`

### Rewrites
All routes are rewritten to `index.html` for client-side routing.

### Headers
Security headers are configured for:
- XSS protection
- Frame options
- Content type options
- Referrer policy
- Permissions policy

### Asset Caching
Static assets are cached for 1 year for optimal performance.

## Automatic Optimizations

Vercel automatically provides:
- **Global CDN** - Edge deployment worldwide
- **HTTPS** - SSL certificates included
- **Automatic builds** - On Git push
- **Preview deployments** - For every pull request
- **Analytics** - Built-in performance monitoring

## Troubleshooting

### Build Errors
- Check that all environment variables are set correctly
- Ensure `npm run build` works locally first
- Verify dependencies are installed

### Routing Issues
- Verify `vercel.json` rewrites are correct
- Check that client-side routing works locally

### Environment Variables
- Variables must start with `VITE_` for client-side access
- Check Vercel environment variables in project settings

### Supabase Connection
- Verify Supabase URL and anon key are correct
- Check Supabase project settings for allowed origins

### White Screen
- Check browser console for errors
- Verify environment variables are loaded
- Check Supabase connection

## Next Steps

After successful deployment:

1. **Custom Domain** (optional)
   - Project settings > Domains
   - Add custom domain
   - Update DNS records

2. **Environment Variables**
   - Add any additional variables needed
   - Configure different values for preview/production

3. **Analytics**
   - Monitor site performance
   - Track visitor analytics

## Continuous Deployment

Vercel automatically:
- Deploys on every Git push to main branch
- Creates preview deployments for pull requests
- Uses the same build settings
- Applies all rewrites and headers
- Maintains environment variables

Your site will stay up-to-date automatically when you push changes to your repository.

## Vercel vs Netlify

### Advantages of Vercel:
- **Better performance** - Global edge network
- **Preview deployments** - Automatic for PRs
- **Built-in analytics** - Performance monitoring
- **Better developer experience** - Faster builds
- **Automatic HTTPS** - Included by default

### Migration Benefits:
- **Simpler configuration** - Less setup required
- **Better caching** - Automatic optimization
- **Global CDN** - Faster load times worldwide
- **Zero-config deployment** - Works out of the box
