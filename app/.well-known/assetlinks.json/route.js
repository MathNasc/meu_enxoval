// app/.well-known/assetlinks.json/route.js
// Serve Digital Asset Links via Next.js route handler.
// Motivo: Vercel bloqueia arquivos em diretórios .dotfile no public/.
// Esta rota garante que o Android consiga verificar a propriedade do domínio
// e esconda a URL bar no TWA gerado pelo PWABuilder.

export async function GET() {
  const assetlinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.vercel.meu_enxoval.twa",
        sha256_cert_fingerprints: [
          "A6:11:61:EA:1B:0D:05:0C:18:76:7B:5D:96:F9:31:6B:B4:DD:DB:BD:34:9A:A7:F4:4D:93:DF:E3:F9:B7:A6:3D"
        ]
      }
    }
  ];

  return new Response(JSON.stringify(assetlinks, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
