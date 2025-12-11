export const metadata = {
  title: 'Teachable Machine App',
  description: 'Deploy your AI model',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial' }}>
        {children}
      </body>
    </html>
  )
}