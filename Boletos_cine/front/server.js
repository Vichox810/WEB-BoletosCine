import { readFileSync, existsSync } from 'fs'
import { createServer } from 'http'
import { extname, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 8080
const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
}

const API_URL = process.env.VITE_API_URL || 'https://backend-api-production-1d2f.up.railway.app'

createServer((req, res) => {
  let filePath = req.url === '/' ? join(DIST, 'index.html') : join(DIST, req.url)
  if (existsSync(filePath) && extname(filePath) !== '.html') {
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(readFileSync(filePath))
  } else {
    let html = readFileSync(join(DIST, 'index.html'), 'utf-8')
    html = html.replace('</head>', `<script>window.__API_URL__="${API_URL}"</script></head>`)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  }
}).listen(PORT, () => {
  console.log(`Frontend sirviendo en http://localhost:${PORT}`)
})
