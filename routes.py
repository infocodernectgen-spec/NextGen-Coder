from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from .models import db, User, Product, Order, OrderItem, Cart
from datetime import datetime

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
product_bp = Blueprint('products', __name__, url_prefix='/api/products')
order_bp = Blueprint('orders', __name__, url_prefix='/api/orders')
cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ==================== AUTH ROUTES ====================

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    user = User(
        username=data['username'],
        email=data['email'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    login_user(user)
    return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ('username', 'password')):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    login_user(user)
    return jsonify({'message': 'Login successful', 'user': user.to_dict()}), 200

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout user"""
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """Get current user profile"""
    return jsonify(current_user.to_dict()), 200

@auth_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """Update user profile"""
    data = request.get_json()
    
    if 'first_name' in data:
        current_user.first_name = data['first_name']
    if 'last_name' in data:
        current_user.last_name = data['last_name']
    if 'phone' in data:
        current_user.phone = data['phone']
    if 'address' in data:
        current_user.address = data['address']
    
    current_user.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Profile updated', 'user': current_user.to_dict()}), 200

# ==================== PRODUCT ROUTES ====================

@product_bp.route('', methods=['GET'])
def get_products():
    """Get all products"""
    category = request.args.get('category')
    products = Product.query.filter_by(is_available=True)
    
    if category:
        products = products.filter_by(category=category)
    
    return jsonify([p.to_dict() for p in products.all()]), 200

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get product by ID"""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify(product.to_dict()), 200

@product_bp.route('/category/<category>', methods=['GET'])
def get_products_by_category(category):
    """Get products by category"""
    products = Product.query.filter_by(category=category, is_available=True)
    return jsonify([p.to_dict() for p in products.all()]), 200

# ==================== CART ROUTES ====================

@cart_bp.route('', methods=['GET'])
@login_required
def get_cart():
    """Get user's cart"""
    cart_items = Cart.query.filter_by(user_id=current_user.id).all()
    total = sum(item.product.price * item.quantity for item in cart_items)
    
    return jsonify({
        'items': [item.to_dict() for item in cart_items],
        'total': total
    }), 200

@cart_bp.route('/add', methods=['POST'])
@login_required
def add_to_cart():
    """Add product to cart"""
    data = request.get_json()
    
    if not data or 'product_id' not in data:
        return jsonify({'error': 'Product ID required'}), 400
    
    product = Product.query.get(data['product_id'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    quantity = data.get('quantity', 1)
    
    cart_item = Cart.query.filter_by(
        user_id=current_user.id,
        product_id=data['product_id']
    ).first()
    
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = Cart(
            user_id=current_user.id,
            product_id=data['product_id'],
            quantity=quantity
        )
        db.session.add(cart_item)
    
    db.session.commit()
    return jsonify({'message': 'Added to cart', 'item': cart_item.to_dict()}), 201

@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
@login_required
def remove_from_cart(item_id):
    """Remove item from cart"""
    cart_item = Cart.query.get(item_id)
    
    if not cart_item or cart_item.user_id != current_user.id:
        return jsonify({'error': 'Item not found'}), 404
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({'message': 'Removed from cart'}), 200

@cart_bp.route('/clear', methods=['DELETE'])
@login_required
def clear_cart():
    """Clear entire cart"""
    Cart.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    
    return jsonify({'message': 'Cart cleared'}), 200

# ==================== ORDER ROUTES ====================

@order_bp.route('', methods=['POST'])
@login_required
def create_order():
    """Create order from cart"""
    data = request.get_json()
    
    cart_items = Cart.query.filter_by(user_id=current_user.id).all()
    if not cart_items:
        return jsonify({'error': 'Cart is empty'}), 400
    
    total_amount = sum(item.product.price * item.quantity for item in cart_items)
    
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        special_instructions=data.get('special_instructions')
    )
    
    if data.get('delivery_date'):
        order.delivery_date = datetime.fromisoformat(data['delivery_date'])
    
    db.session.add(order)
    db.session.flush()
    
    for cart_item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            unit_price=cart_item.product.price
        )
        db.session.add(order_item)
    
    Cart.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    
    return jsonify({'message': 'Order created', 'order': order.to_dict()}), 201

@order_bp.route('', methods=['GET'])
@login_required
def get_orders():
    """Get user's orders"""
    orders = Order.query.filter_by(user_id=current_user.id).all()
    return jsonify([order.to_dict() for order in orders]), 200

@order_bp.route('/<int:order_id>', methods=['GET'])
@login_required
def get_order(order_id):
    """Get order details"""
    order = Order.query.get(order_id)
    
    if not order or order.user_id != current_user.id:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify(order.to_dict()), 200

@order_bp.route('/<int:order_id>/status', methods=['GET'])
@login_required
def get_order_status(order_id):
    """Get order status"""
    order = Order.query.get(order_id)
    
    if not order or order.user_id != current_user.id:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify({
        'order_id': order.id,
        'status': order.status,
        'created_at': order.created_at.isoformat(),
        'updated_at': order.updated_at.isoformat()
    }), 200

# ==================== ADMIN ROUTES ====================

@admin_bp.route('/products', methods=['POST'])
@login_required
def create_product():
    """Create a new product (admin only)"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not all(k in data for k in ('name', 'price', 'category')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    product = Product(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        category=data['category'],
        image_url=data.get('image_url'),
        stock=data.get('stock', 0)
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'message': 'Product created', 'product': product.to_dict()}), 201

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@login_required
def update_product(product_id):
    """Update product (admin only)"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        product.price = data['price']
    if 'category' in data:
        product.category = data['category']
    if 'description' in data:
        product.description = data['description']
    if 'stock' in data:
        product.stock = data['stock']
    if 'is_available' in data:
        product.is_available = data['is_available']
    
    product.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Product updated', 'product': product.to_dict()}), 200

@admin_bp.route('/orders', methods=['GET'])
@login_required
def get_all_orders():
    """Get all orders (admin only)"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders]), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@login_required
def update_order_status(order_id):
    """Update order status (admin only)"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    if 'status' in data:
        order.status = data['status']
    
    order.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Order status updated', 'order': order.to_dict()}), 200
