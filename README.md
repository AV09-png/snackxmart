# X SnackSmart

A modern e-commerce website for snacks and beverages, with a secure admin panel for order management.

## Features

- Modern and responsive design
- Shopping cart functionality
- Secure checkout process
- Admin panel for order management
- Cross-device order synchronization using GitHub Issues
- Order export functionality

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/av09-png/xsnackmart.git
   cd xsnackmart
   ```

2. Set up GitHub configuration:
   - Copy `js/config.template.js` to `js/config.js`
   - Create a GitHub Personal Access Token:
     1. Go to GitHub Settings > Developer settings > Personal access tokens
     2. Click "Generate new token (classic)"
     3. Give it a name (e.g., "SnackSmart Orders")
     4. Select the `repo` scope
     5. Click "Generate token"
     6. Copy the token
   - Update `js/config.js` with your token and repository information:
     ```javascript
     const config = {
         githubToken: 'YOUR_GITHUB_TOKEN',
         githubRepo: 'your-username/your-repository',
         githubApiUrl: 'https://api.github.com'
     };
     ```

3. Deploy to GitHub Pages:
   - Go to repository Settings > Pages
   - Set source branch to `main`
   - Set folder to `/ (root)`
   - Click Save

4. Access the website:
   - Main website: `https://your-username.github.io/your-repository`
   - Admin panel: `https://your-username.github.io/your-repository/admin-orders.html`

## Admin Access

- Access the admin panel at `/admin-orders.html`
- Default password: `av09`

## Order Management

Orders are stored in two places:
1. Browser's localStorage (for local access)
2. GitHub Issues (for cross-device access)

The admin panel combines orders from both sources and removes duplicates.

## Development

To modify the website:
1. Clone the repository
2. Make your changes
3. Test locally using a web server
4. Commit and push changes
5. GitHub Pages will automatically update

## Security Notes

- Keep your GitHub token secure and never commit it to the repository
- Change the admin password in `admin-orders.html` before deployment
- Consider implementing proper authentication for production use

## License

MIT License - Feel free to use and modify for your own projects. 