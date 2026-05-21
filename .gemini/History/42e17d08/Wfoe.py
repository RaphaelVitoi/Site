import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from pydantic import ValidationError

from core.schemas import Task
from database.queue_manager import QueueManager

def start_api_server(manager: QueueManager, port: int = 17042):
    class TaskAPIHandler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass
            
        def do_POST(self):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length).decode('utf-8')
                
                if self.path == '/add':
                    new_task = Task.model_validate_json(post_data)
                    manager.add_task(new_task)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "SUCCESS", "id": new_task.id}).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.end_headers()
            except ValidationError as ve:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(ve)}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        def do_GET(self):
            try:
                parsed_path = urlparse(self.path)
                if parsed_path.path == '/status':
                    query = parse_qs(parsed_path.query)
                    status = query.get('status', [None])[0]
                    if status == 'all': status = None
                    
                    tasks = manager.get_tasks(status)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps([t.model_dump() for t in tasks]).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.end_headers()
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    try:
        server = HTTPServer(('127.0.0.1', port), TaskAPIHandler)
        server.serve_forever()
    except OSError as e:
        logging.error(f"Falha ao iniciar Micro-Servidor na porta {port}: {e}")