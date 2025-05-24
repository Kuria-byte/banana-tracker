import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Farm Manager",
    short_name: "FarmManager",
    description: "Farm management and banana growth tracking app.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    icons: [
      { src: "/android/android-launchericon-48-48.png", sizes: "48x48", type: "image/png", purpose: "any" },
      { src: "/android/android-launchericon-72-72.png", sizes: "72x72", type: "image/png", purpose: "any" },
      { src: "/android/android-launchericon-96-96.png", sizes: "96x96", type: "image/png", purpose: "any" },
      { src: "/android/android-launchericon-144-144.png", sizes: "144x144", type: "image/png", purpose: "any" },
      { src: "/android/android-launchericon-192-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/android/android-launchericon-512-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // iOS icons (add most common sizes)
      { src: "/ios/57.png", sizes: "57x57", type: "image/png", purpose: "any" },
      { src: "/ios/60.png", sizes: "60x60", type: "image/png", purpose: "any" },
      { src: "/ios/72.png", sizes: "72x72", type: "image/png", purpose: "any" },
      { src: "/ios/76.png", sizes: "76x76", type: "image/png", purpose: "any" },
      { src: "/ios/114.png", sizes: "114x114", type: "image/png", purpose: "any" },
      { src: "/ios/120.png", sizes: "120x120", type: "image/png", purpose: "any" },
      { src: "/ios/144.png", sizes: "144x144", type: "image/png", purpose: "any" },
      { src: "/ios/152.png", sizes: "152x152", type: "image/png", purpose: "any" },
      { src: "/ios/167.png", sizes: "167x167", type: "image/png", purpose: "any" },
      { src: "/ios/180.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/ios/192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/ios/256.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/ios/512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/ios/1024.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
    ],
  }
} 