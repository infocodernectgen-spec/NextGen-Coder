from flask import Flask
from flask_login import LoginManager
from .config import DevelopmentConfig
from .models import db, User
from .routes import auth_bp, product_bp, order_bp, cart_bp, admin_bp
from .dashboard import dashboard_bp

def create_app(config_class=DevelopmentConfig):
    """Create and configure the Flask app"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(dashboard_bp)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Basic route
    @app.route('/')
    def index():
        return {'message': 'Toady Bakery API v1.0', 'status': 'running'}
    
    @app.route('/health')
    def health():
        return {'status': 'healthy'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='127.0.0.1', port=5000)
