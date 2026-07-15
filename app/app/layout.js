import './globals.css'

export const metadata = {
  title: 'StartPage — Быстрый доступ',
  description: 'Стартовая страница с закреплёнными ссылками',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
