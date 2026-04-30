# Netlify Dashboard Deployment Guide

This guide will help you deploy the FreelanceOS web application using the Netlify Dashboard web interface.

## Prerequisites

1. **Netlify Account**: Create a free Netlify account at [netlify.com](https://netlify.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Supabase Project**: Have your Supabase URL and anon key ready

## Step 1: Go to Netlify Dashboard

1. **Login** to your Netlify account at [app.netlify.com](https://app.netlify.com)
2. **Click "Add new site"** in the top right
3. **Select "Import an existing project"**

## Step 2: Connect to Git Repository

1. **Choose your Git provider** (GitHub, GitLab, Bitbucket)
2. **Authorize Netlify** to access your repositories
3. **Select your FreelanceOS repository**
4. **Click "Connect to Git provider"**

## Step 3: Configure Build Settings

Netlify will automatically detect your project. Configure these settings:

### Build Settings
- **Branch to deploy**: `main` (or your default branch)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### Environment Variables
Click "Show advanced" > "New variable" and add:

1. **VITE_SUPABASE_URL**: `https://your-project.supabase.co`
2. **VITE_SUPABASE_ANON_KEY**: `your_supabase_anon_key`

## Step 4: Deploy Site

1. **Review settings** and click "Deploy site"
2. **Wait for deployment** (usually takes 1-2 minutes)
3. **Visit your site** at the provided URL

## Step 5: Verify Deployment

Test these features on your deployed site:

1. **Homepage loads** correctly
2. **Login/Signup** works
3. **Dashboard navigation** functions
4. **Messages system** operates
5. **Settings page** saves preferences

## Configuration Files

The following files are automatically used by Netlify:

- `netlify.toml` - Build settings, redirects, headers
- `public/_redirects` - Client-side routing
- `public/_headers` - Security headers

## What's Configured Automatically

### Build Process
- TypeScript compilation
- Vite build optimization
- Asset bundling and minification

### Routing
- All routes redirect to `index.html` for React Router
- Proper handling of dynamic routes

### Security
- XSS protection headers
- Content type security
- Frame protection
- HTTPS enforcement

### Performance
- Asset caching (1 year for static files)
- Code splitting
- Automatic CDN distribution

## Troubleshooting

### Build Fails
- Check that `npm run build` works locally
- Verify environment variables are correct
- Ensure all dependencies are installed

### Routing Issues
- Verify `public/_redirects` file exists
- Check that client-side routing works locally

### Environment Variables
- Variables must start with `VITE_` for client-side access
- Check Supabase URL format (https://project.supabase.co)
- Verify anon key is correct

### White Screen
- Check browser console for errors
- Verify environment variables are loaded
- Check Supabase connection

## Next Steps

After successful deployment:

1. **Custom Domain** (optional)
   - Site settings > Domain management
   - Add custom domain
   - Update DNS records

2. **Form Handling** (if needed)
   - Configure form submissions
   - Set up notification emails

3. **Analytics**
   - Enable Netlify Analytics
   - Monitor site performance

## Continuous Deployment

Netlify automatically:
- Deploys on every Git push
- Uses the same build settings
- Applies all redirects and headers
- Maintains environment variables

Your site will stay up-to-date automatically when you push changes to your repository.
