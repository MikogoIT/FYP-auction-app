import functions_framework

@functions_framework.http
def hello_world(request):
    # This will appear in your Cloud Function logs
    print("Hello from Functions Framework!")
    return ("Function executed, check logs for the print output.", 200)
