import logging
logger = logging.getLogger(__name__)

class Debug400Middleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if response.status_code == 400:
            with open('debug_400.log', 'a') as f:
                f.write(f"400 Bad Request: {request.path}\n")
                f.write(f"Headers: {request.headers}\n")
                f.write(f"Body: {request.body}\n")
                f.write(f"Response Content: {response.content}\n")
                f.write("-" * 40 + "\n")
        return response
