# Van Gone Broke for iPhone

The app shows the live site (https://faradaycage.xyz) inside a native iPhone shell made with
[Capacitor](https://capacitorjs.com). Changes to the website appear in the app straight away;
only changes in this folder need a new app version.

What the app adds on top of the site:
- **Daily puzzle reminder**: on the Puzzles page, "Want Dug-Dug to fetch you…" picks a time for a daily
  notification; tapping it opens the puzzles (`components/puzzles/PuzzleReminder.tsx`, `components/AppBridge.tsx`).
- **Share**: the big art view's Share button opens the iPhone share sheet (`components/ShareButton.tsx`).
- **Offline page**: `www/offline.html` shows when there's no signal.
- Links to other sites (Instagram, payment pages) open in Safari.

The site knows it's inside the app through `window.Capacitor` (`lib/nativeApp.ts`), and the app's
browser name ends with `VanGoneBrokeApp/1.0`, so Analytics can tell app visits apart.

## Building

Needs a Mac with Xcode and the iOS platform installed (Xcode → Settings → Components).

```sh
cd ios-app
npm install
npx cap sync ios        # copies capacitor.config.json and www/ into the Xcode project
npx cap open ios        # opens Xcode: pick an iPhone simulator and press Run
```

`node scripts/make-art.mjs` redraws the app icon and launch screen.

## Publishing

Needs an Apple Developer account ($99 a year). In Xcode: App target → Signing & Capabilities → pick your
team, then Product → Archive → Distribute App → App Store Connect. The bundle id is
`xyz.faradaycage.vangonebroke`.
