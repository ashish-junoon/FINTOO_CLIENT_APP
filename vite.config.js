import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const manifestForPlugIn = {
  registerType:'autoUpdate',
  includeAssets:['favicon.ico', "apple-touch-icon.png", "maskable-icon.png"],
  workbox: {
    maximumFileSizeToCacheInBytes: 25 * 1024 * 1024 // 25 MB
  },
  manifest:{
    name:"Fintoo",
    short_name:"Fintoo",
    description:"Fintoo",
    icons:[{
      src: '/android-chrome-192x192.png',
      sizes:'192x192',
      type:'image/png',
      purpose:'any'
    },
    {
      src:'/android-chrome-512x512.png',
      sizes:'512x512',
      type:'image/png',
      purpose:'any'
    },
    {
      src: '/apple-touch-icon.png',
      sizes:'180x180',
      type:'image/png',
      purpose:'any',
    },
    {
      src: '/maskable-icon.png',
      sizes:'512x512',
      type:'image/png',
      purpose:'any maskable',
    }
  ],
  theme_color:'#1F316F',
  background_color:'#87a5ff',
  display:"standalone",
  scope:'/',
  start_url:"/?source=pwa",
  orientation:'portrait',
  },
  devOptions: {
    enabled: true,   // to enables PWA in dev
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(manifestForPlugIn)],
})