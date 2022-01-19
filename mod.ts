import { serve } from "https://deno.land/std@0.114.0/http/server.ts"
import { DOMParser, NodeList } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts"

function patchURL(links: NodeList | null, attr: string, url: string) {
    Array.prototype.filter.call(links, (link) => {
        const param = link.getAttribute(attr)
        if (!param) {
            return
        }

        if (param.startsWith("https://" + new URL(url).hostname)) {
            link.setAttribute(attr, "localhost:8000/v1/" + param)
        }
    })
}

async function handleRequest(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)
    console.log(pathname)

    // Check if the request is for style.css.
    if (pathname.startsWith("/v1")) {
        let url = pathname.replace("/v1/", "")
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url
        }
        try {
            const res = await fetch(url)
            const body = await res.text()
            // const html = (() => {
            // const doc = new DOMParser().parseFromString(body, "text/html")
            // console.log(doc)
            // const links = doc?.querySelectorAll("script") ?? null
            // patchURL(links, "src", url)
            // for (const link in doc?.querySelectorAll("p")) {
            //     console.log("p", link.textContent)
            // }
            // })()
            return new Response(body, {
                headers: res.headers,
            })
        } catch (err) {
            console.error(err)
            return new Response(`<h1>Internal Server Error</h1> <p>${err}</p>`, {
                status: 500,
                headers: { "content-type": "text/html" },
            })
        }
    }

    if (pathname.startsWith("/yt")) {
        try {
            const res = await fetch("https://www.youtube.com")
            const html = `
            <iframe id="youtube" title="YouTube" src="https://www.youtube.com" allowpaymentrequest allowfullscreen width="100%" height="100%">
            </iframe>
            `
            const headers = res.headers
            headers.set("Content-Security-Policy", "default-src *;")
            return new Response(html, { status: 200, headers: headers })
        } catch (err) {
            console.error(err)
            return new Response(`<h1>Internal Server Error</h1> <p>${err}</p>`, {
                status: 500,
                headers: { "content-type": "text/html" },
            })
        }
    }

    return new Response(
        `<html>
        <head>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <h1>Example?</h1>
        </body>
      </html>`,
        {
            headers: {
                "content-type": "text/html; charset=utf-8",
            },
        }
    )
}

console.log("Listening on http://localhost:8000")
serve(handleRequest)
