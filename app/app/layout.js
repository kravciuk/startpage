import './globals.css'

export const metadata = {
  title: 'StartPage — Quick Access',
  description: 'Start page with pinned links',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
