# Cloudflare Pages Deployment Guide

This guide will help you deploy the FreelanceOS web application to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account**: Create a free Cloudflare account at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install Wrangler CLI globally
   ```bash
   npm install -g wrangler
   ```
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

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

# Cloudflare Pages Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Environment
NODE_ENV=production
```

## Step 2: Build for Production

```bash
npm run build:cloudflare
```

## Step 3: Deploy to Cloudflare Pages

### Option A: Using Wrangler CLI

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Deploy**:
   ```bash
   npm run deploy:cloudflare
   ```

   **Alternative direct command**:
   ```bash
   npx wrangler pages deploy dist --project-name=freelance-os
   ```

### Option B: Using Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard** > Pages
2. **Connect to Git** (GitHub, GitLab, etc.)
3. **Select your repository**
4. **Configure Build Settings**:
   - **Framework preset**: Vite
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

5. **Add Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

6. **Deploy**: Click "Save and Deploy"

**Important**: Don't use the custom deploy command in the Cloudflare Pages build settings. Use the standard build command and let Cloudflare Pages handle the deployment automatically.

## Step 4: Configure Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Click "Custom domains"
3. Add your domain name
4. Update DNS records as instructed

## Step 5: Verify Deployment

1. Visit your Cloudflare Pages URL
2. Test all functionality:
   - Login/Signup
   - Dashboard navigation
   - Messaging system
   - Settings page

## Configuration Files

The following files have been created/updated for Cloudflare deployment:

- `public/_headers` - Security headers
- `public/_redirects` - Client-side routing
- `wrangler.toml` - Cloudflare Workers configuration
- `vite.config.ts` - Optimized build configuration
- `DEPLOYMENT.md` - This deployment guide

## Troubleshooting

### Build Errors
- Check that all environment variables are set correctly
- Ensure `npm run build:cloudflare` works locally first

### Routing Issues
- Verify `_redirects` file is in `public` folder
- Check that client-side routing works in preview

### Environment Variables
- Ensure all variables are prefixed with `VITE_` for client-side access
- Check Cloudflare Pages environment variables in dashboard

### Supabase Connection
- Verify Supabase URL and anon key are correct
- Check Supabase project settings for allowed origins

## Performance Optimizations

The build configuration includes:
- Code splitting for better performance
- Asset optimization
- Proper caching headers
- Security headers

## Next Steps

After successful deployment:
1. Set up custom domain
2. Configure SSL certificates (automatic with Cloudflare)
3. Set up analytics
4. Monitor performance with Cloudflare Analytics
