export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const target = url.searchParams.get('url');
    if (!target) return new Response('Missing url', { status: 400 });
    let targetUrl;
    try { targetUrl = new URL(target); } catch (e) { return new Response('Bad url', { status: 400 }); }
    const host = targetUrl.hostname;
    if (!(host.endsWith('doubanio.com') || host.endsWith('douban.com'))) {
        return new Response('Forbidden', { status: 403 });
    }
    const upstream = await fetch(targetUrl.toString(), {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://movie.douban.com/',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
        },
        redirect: 'follow'
    });
    if (!upstream.ok) return new Response('Upstream error', { status: 502 });
    const headers = new Headers();
    const ct = upstream.headers.get('Content-Type');
    if (ct) headers.set('Content-Type', ct);
    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(upstream.body, { status: 200, headers: headers });
}
