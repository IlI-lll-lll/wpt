def main(request, response):
    match = b"/fetch/compression-dictionary/resources/*"
    content = b"This is a test dictionary.\n"
    if b"match" in request.GET:
        match = request.GET.first(b"match")
    if b"content" in request.GET:
        content = request.GET.first(b"content")
    options = b"match=\"" + match + b"\""
    if b"id" in request.GET:
        options += b", id=\"" + request.GET.first(b"id") + b"\""
    response.headers.set(b"Use-As-Dictionary", options)
    response.headers.set(b"Cache-Control", b"max-age=3600")
    return content
