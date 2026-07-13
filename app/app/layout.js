import './globals.css'

export const metadata = {
  title: 'StartPage — Быстрый доступ',
  description: 'Стартовая страница с закреплёнными ссылками',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
