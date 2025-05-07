import os
import webbrowser
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

# Change the current working directory to the root folder
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Start the server on port 3000
PORT = 3000
handler = SimpleHTTPRequestHandler
httpd = TCPServer(("", PORT), handler)

# Open the default browser to the home.html page
home_url = f'http://localhost:{PORT}/templates/home.html'
webbrowser.open(home_url)

print(f"Serving at http://localhost:{PORT}")
httpd.serve_forever()
