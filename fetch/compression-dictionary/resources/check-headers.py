import json

def main(request, response):
    headers = {}
    for header in request.headers:
        key = header.decode('utf-8')
        value = request.headers.get(header).decode('utf-8')
        headers[key] = value
    return json.dumps(headers)
