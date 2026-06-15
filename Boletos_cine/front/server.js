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

createServer((req, res) => {
  const filePath = req.url === '/' ? join(DIST, 'index.html') : join(DIST, req.url)
  if (existsSync(filePath)) {
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(readFileSync(filePath))
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(readFileSync(join(DIST, 'index.html')))
  }
}).listen(PORT, () => {
  console.log(`Frontend sirviendo en http://localhost:${PORT}`)
})
