#!/usr/bin/env python3
"""One-click launcher for the JJK Shibuya prototype."""

from __future__ import annotations

import http.server
import socketserver
import threading
import webbrowser
from pathlib import Path

PORT = 4173


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True



def main() -> None:
    root = Path(__file__).resolve().parent

    # Always serve the project folder so launching from any path works.
    import os

    os.chdir(root)

    handler = http.server.SimpleHTTPRequestHandler
    server = ReusableTCPServer(("", PORT), handler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)

    print(f"Launching JJK Shibuya prototype at http://localhost:{PORT}")
    print("Press Ctrl+C in this terminal to stop the game server.")

    try:
        server_thread.start()
        webbrowser.open(f"http://localhost:{PORT}")
        server_thread.join()
    except KeyboardInterrupt:
        pass
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
