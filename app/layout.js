export const metadata = {
  title: "Meu Enxoval",
  description: "Organize o enxoval do seu apartamento",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
