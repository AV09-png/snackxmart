# Deployment Guide for SnackSmart

This guide will help you deploy the SnackSmart website to a production environment.

## Prerequisites

1. A domain name (e.g., yourwebsite.com)
2. A web hosting service (recommended options below)
3. SSL certificate for HTTPS
4. Node.js installed on the server

## Deployment Options

### Option 1: Traditional Web Hosting (e.g., DigitalOcean, AWS EC2)

1. Set up a server with Ubuntu/Debian
2. Install Node.js and npm
3. Set up Nginx as a reverse proxy
4. Install PM2 for process management

### Option 2: Platform as a Service (Recommended for beginners)

- Heroku
- Vercel
- Netlify (frontend) + Heroku (backend)

## Deployment Steps

1. **Environment Setup**
   ```bash
   # Create .env file with production settings
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **SSL Certificate**
   - Obtain SSL certificate (Let's Encrypt recommended)
   - Update SSL certificate paths in .env

4. **Database Setup**
   - Set up a production database
   - Update database connection strings in .env

5. **Start the Application**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start the application
   pm2 start server.js --name snacksmart
   ```

6. **Nginx Configuration (if using traditional hosting)**
   ```nginx
   server {
       listen 80;
       server_name yourwebsite.com www.yourwebsite.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl;
       server_name yourwebsite.com www.yourwebsite.com;

       ssl_certificate /path/to/certificate.pem;
       ssl_certificate_key /path/to/private-key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Security Checklist

✅ SSL/HTTPS enabled
✅ Environment variables configured
✅ Admin password changed
✅ Rate limiting enabled
✅ CORS configured
✅ Session security enabled
✅ Error handling implemented
✅ Logging configured

## Monitoring

1. Set up monitoring using PM2
   ```bash
   pm2 monitor
   ```

2. Consider adding application monitoring:
   - New Relic
   - Datadog
   - PM2 Plus

## Backup

1. Set up regular backups for:
   - Database
   - User uploads
   - Configuration files

## Troubleshooting

Common issues and solutions:

1. **502 Bad Gateway**
   - Check if Node.js application is running
   - Verify Nginx configuration
   - Check port settings

2. **SSL Certificate Issues**
   - Verify certificate paths
   - Check certificate expiration
   - Ensure proper certificate chain

3. **Performance Issues**
   - Enable Nginx caching
   - Optimize static assets
   - Configure PM2 clustering

## Support

For additional support:
1. Check the error logs: `pm2 logs`
2. Monitor application: `pm2 monit`
3. Check system resources: `htop`

## Regular Maintenance

1. Update dependencies regularly
2. Monitor disk space
3. Rotate logs
4. Update SSL certificates
5. Backup data
6. Monitor security advisories 