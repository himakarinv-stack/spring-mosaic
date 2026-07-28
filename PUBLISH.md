# Publish spring-mosaic to GitHub Packages

Package: `@himakarinv-stack/spring-mosaic`  
Registry: https://npm.pkg.github.com  
Package page: https://github.com/himakarinv-stack/spring-mosaic/pkgs/npm/spring-mosaic

## Publish locally

```powershell
cd "D:\softtech\MCP servers\spring-mosaic"
$env:NODE_AUTH_TOKEN = (& "C:\Program Files\GitHub CLI\gh.exe" auth token)
npm run build
npm publish
```

Requires `gh auth login` as **himakarinv-stack** with `write:packages` (and `read:packages`) scope.

```powershell
gh auth refresh -h github.com -s write:packages,read:packages
```

## Publish via GitHub Release (CI)

1. Push to `main`
2. Tag: `git tag v0.1.0 && git push origin v0.1.0`
3. Create a GitHub Release from that tag
4. Workflow `.github/workflows/publish.yml` publishes automatically

## Consumer install

Add to `~/.npmrc`:

```
@himakarinv-stack:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then:

```bash
npm install --save-dev @himakarinv-stack/spring-mosaic
npx spring-mosaic-setup
```

Or one-shot:

```bash
npx --registry=https://npm.pkg.github.com @himakarinv-stack/spring-mosaic-setup
```
