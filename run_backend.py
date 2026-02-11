"""
Run the Flask backend server
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app

if __name__ == '__main__':
    app = create_app()
    print("Starting Toady Bakery API...")
    print("Server running at http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
