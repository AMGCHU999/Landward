import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import * as dotenv from 'dotenv'
import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import { orderScreeningCase } from './src/server/certnBridge.js'
import { evaluateTenantRisk } from './src/server/screeningEvaluator.js'

dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') })

function certnApiPlugin(): Plugin {
  return {
    name: 'certn-api-bridge',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/certn/applicants', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const payload = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
          const result = await orderScreeningCase(payload)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
        }
      })

      server.middlewares.use('/api/screening/evaluate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const report = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
          const result = await evaluateTenantRisk(report)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), certnApiPlugin()],
  resolve: {
    alias: { '@root': path.resolve(import.meta.dirname, '../src') },
  },
})
