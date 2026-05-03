import "../src/styles/globals.css";

export const metadata = {
  title:       "Meu Enxoval",
  description: "Organize o enxoval do seu apartamento — lista inteligente para casais",
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:            true,
    statusBarStyle:     "black-translucent",
    title:              "Meu Enxoval",
  },
  icons: {
    icon:        [
      { url: "/icons/icon-32x32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icons/icon-192x192.png",sizes: "192x192",type: "image/png" },
      { url: "/icon.svg",              type: "image/svg+xml" },
    ],
    apple:       [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut:    "/icons/icon-128x128.png",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1272AA" },
    { media: "(prefers-color-scheme: dark)",  color: "#0C1B2A" },
  ],
  viewport: {
    width:               "device-width",
    initialScale:        1,
    maximumScale:        1,
    userScalable:        false,
    viewportFit:         "cover",
  },
  openGraph: {
    title:       "Meu Enxoval",
    description: "Organize o enxoval do seu apartamento",
    type:        "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA meta tags extras não cobertos pelo metadata API */}
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="application-name" content="Meu Enxoval"/>
        <meta name="msapplication-TileColor" content="#1272AA"/>
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png"/>
        <link rel="mask-icon" href="/icon.svg" color="#1272AA"/>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        {/* Registra o Service Worker */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(r => console.log('[PWA] SW registered:', r.scope))
                .catch(e => console.warn('[PWA] SW failed:', e));
            });
          }
        `}}/>
      </body>
    </html>
  );
}
