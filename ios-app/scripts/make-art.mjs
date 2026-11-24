// Draws the app icon (1024×1024) and launch screen (2732×2732) with the site's own fonts.
// Run from ios-app: node scripts/make-art.mjs   (uses Playwright from the website's node_modules)
import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const font = f => readFileSync(new URL(`../../app/fonts/${f}`, import.meta.url)).toString('base64')
const faces = `
  @font-face { font-family: P; font-weight: 700; src: url(data:font/woff2;base64,${font('playfair-display-latin.woff2')}) format('woff2'); }
  @font-face { font-family: PI; font-style: italic; src: url(data:font/woff2;base64,${font('playfair-display-italic-latin.woff2')}) format('woff2'); }`
// The site's collection and menu colours
const stripes = ['#7a3040', '#b0552f', '#c9a24a', '#1a6060', '#1e3a8a', '#4a3a7a']
const bars = stripes.map(c => `<i style="background:${c}"></i>`).join('')

const icon = `<style>${faces}
  html,body { margin:0; width:1024px; height:1024px; }
  body { background:#1a1014; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .vgb { font-family:P; font-weight:700; font-size:330px; line-height:1; color:#faf8f5; letter-spacing:.04em; margin-top:-40px; }
  .sub { font-family:PI; font-style:italic; font-size:92px; color:#d9a8b0; margin-top:6px; }
  .bars { position:absolute; left:0; right:0; bottom:0; height:120px; display:flex; } .bars i { flex:1; }
</style><div class="vgb">VGB</div><div class="sub">art studio</div><div class="bars">${bars}</div>`

const splash = `<style>${faces}
  html,body { margin:0; width:2732px; height:2732px; }
  body { background:#faf8f5; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .vgb { font-family:P; font-weight:700; font-size:220px; letter-spacing:.5em; margin-right:-.5em; color:#1a1014; }
  .bars { display:flex; width:560px; height:18px; margin-top:60px; } .bars i { flex:1; }
</style><div class="vgb">VGB</div><div class="bars">${bars}</div>`

const assets = `${root}ios/App/App/Assets.xcassets`
const b = await chromium.launch()
async function shot(html, size, outs) {
  const p = await b.newPage({ viewport: { width: size, height: size } })
  await p.setContent(html); await p.evaluate(() => document.fonts.ready)
  const jpg = `${root}scripts/.tmp.jpg`
  await p.screenshot({ path: jpg, type: 'jpeg', quality: 100 })
  // Saved through JPEG so the PNG has no see-through layer (the App Store refuses icons with one)
  for (const out of outs) execFileSync('sips', ['-s', 'format', 'png', jpg, '--out', out], { stdio: 'ignore' })
  rmSync(jpg); await p.close()
}
await shot(icon, 1024, [`${assets}/AppIcon.appiconset/AppIcon-512@2x.png`])
await shot(splash, 2732, ['', '-1', '-2'].map(s => `${assets}/Splash.imageset/splash-2732x2732${s}.png`))
await b.close()
console.log('icon and launch screen written')
