import "./globals.css";
import "./mobile.css";
export const metadata={title:"Cacsms Finance",description:"Your AI Money Intelligence"};
export const viewport={width:"device-width",initialScale:1,viewportFit:"cover" as const};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
