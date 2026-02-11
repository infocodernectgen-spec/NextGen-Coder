from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .models import db, User, Product, Order, OrderItem
from datetime import datetime, timedelta
from sqlalchemy import func, extract

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

# ==================== DASHBOARD STATISTICS ====================

@dashboard_bp.route('/overview', methods=['GET'])
@login_required
def get_dashboard_overview():
    """Get dashboard overview with key metrics"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    # Calculate metrics
    total_orders = Order.query.count()
    total_revenue = db.session.query(func.sum(Order.total_amount)).scalar() or 0
    total_products = Product.query.count()
    total_customers = User.query.filter_by(is_admin=False).count()
    
    # Orders by status
    orders_by_status = db.session.query(
        Order.status, 
        func.count(Order.id).label('count')
    ).group_by(Order.status).all()
    
    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    
    return jsonify({
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'total_products': total_products,
        'total_customers': total_customers,
        'orders_by_status': {status: count for status, count in orders_by_status},
        'recent_orders': [order.to_dict() for order in recent_orders]
    }), 200

@dashboard_bp.route('/revenue', methods=['GET'])
@login_required
def get_revenue_stats():
    """Get revenue statistics"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    period = request.args.get('period', 'month')  # day, week, month, year
    
    now = datetime.utcnow()
    if period == 'day':
        start_date = now - timedelta(days=1)
    elif period == 'week':
        start_date = now - timedelta(days=7)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    else:  # year
        start_date = now - timedelta(days=365)
    
    revenue_data = db.session.query(
        func.date(Order.created_at).label('date'),
        func.sum(Order.total_amount).label('revenue'),
        func.count(Order.id).label('orders')
    ).filter(Order.created_at >= start_date).group_by(
        func.date(Order.created_at)
    ).all()
    
    return jsonify({
        'period': period,
        'data': [
            {
                'date': str(date),
                'revenue': float(revenue),
                'orders': orders
            }
            for date, revenue, orders in revenue_data
        ]
    }), 200

@dashboard_bp.route('/top-products', methods=['GET'])
@login_required
def get_top_products():
    """Get top selling products"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    limit = request.args.get('limit', 10, type=int)
    
    top_products = db.session.query(
        Product.name,
        Product.id,
        Product.price,
        func.sum(OrderItem.quantity).label('total_quantity'),
        func.sum(OrderItem.quantity * OrderItem.unit_price).label('total_revenue')
    ).join(OrderItem).group_by(
        Product.id
    ).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(limit).all()
    
    return jsonify({
        'top_products': [
            {
                'id': product_id,
                'name': name,
                'price': price,
                'quantity_sold': quantity,
                'revenue': float(revenue)
            }
            for name, product_id, price, quantity, revenue in top_products
        ]
    }), 200

@dashboard_bp.route('/customer-stats', methods=['GET'])
@login_required
def get_customer_stats():
    """Get customer statistics"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    total_customers = User.query.filter_by(is_admin=False).count()
    
    # New customers this month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_customers_this_month = User.query.filter(
        User.is_admin == False,
        User.created_at >= month_start
    ).count()
    
    # Top customers by spending
    top_customers = db.session.query(
        User.username,
        User.email,
        func.count(Order.id).label('order_count'),
        func.sum(Order.total_amount).label('total_spent')
    ).join(Order).group_by(
        User.id
    ).order_by(
        func.sum(Order.total_amount).desc()
    ).limit(10).all()
    
    return jsonify({
        'total_customers': total_customers,
        'new_this_month': new_customers_this_month,
        'top_customers': [
            {
                'username': username,
                'email': email,
                'orders': order_count,
                'total_spent': float(spent)
            }
            for username, email, order_count, spent in top_customers
        ]
    }), 200

@dashboard_bp.route('/inventory', methods=['GET'])
@login_required
def get_inventory_stats():
    """Get inventory status"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    low_stock_threshold = request.args.get('threshold', 5, type=int)
    
    # Low stock items
    low_stock = Product.query.filter(
        Product.stock <= low_stock_threshold
    ).all()
    
    # Out of stock
    out_of_stock = Product.query.filter_by(stock=0).count()
    
    # Total inventory value
    inventory_value = db.session.query(
        func.sum(Product.price * Product.stock)
    ).scalar() or 0
    
    return jsonify({
        'low_stock_items': [
            {
                'id': p.id,
                'name': p.name,
                'stock': p.stock,
                'price': p.price
            }
            for p in low_stock
        ],
        'out_of_stock_count': out_of_stock,
        'total_inventory_value': float(inventory_value),
        'total_products': Product.query.count()
    }), 200

@dashboard_bp.route('/order-analytics', methods=['GET'])
@login_required
def get_order_analytics():
    """Get detailed order analytics"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    # Average order value
    avg_order_value = db.session.query(
        func.avg(Order.total_amount)
    ).scalar() or 0
    
    # Total orders by status
    status_breakdown = db.session.query(
        Order.status,
        func.count(Order.id).label('count')
    ).group_by(Order.status).all()
    
    # Orders this month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    orders_this_month = Order.query.filter(
        Order.created_at >= month_start
    ).count()
    
    revenue_this_month = db.session.query(
        func.sum(Order.total_amount)
    ).filter(Order.created_at >= month_start).scalar() or 0
    
    # Average order process time
    completed_orders = Order.query.filter_by(status='delivered').all()
    if completed_orders:
        avg_time = sum(
            (order.updated_at - order.created_at).total_seconds() 
            for order in completed_orders
        ) / len(completed_orders) / 86400  # Convert to days
    else:
        avg_time = 0
    
    return jsonify({
        'average_order_value': float(avg_order_value),
        'status_breakdown': {status: count for status, count in status_breakdown},
        'orders_this_month': orders_this_month,
        'revenue_this_month': float(revenue_this_month),
        'average_processing_days': round(avg_time, 2)
    }), 200

@dashboard_bp.route('/sales-trend', methods=['GET'])
@login_required
def get_sales_trend():
    """Get sales trend over time"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    days = request.args.get('days', 30, type=int)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    daily_sales = db.session.query(
        func.date(Order.created_at).label('date'),
        func.sum(Order.total_amount).label('revenue'),
        func.count(Order.id).label('order_count')
    ).filter(Order.created_at >= start_date).group_by(
        func.date(Order.created_at)
    ).order_by(func.date(Order.created_at)).all()
    
    return jsonify({
        'period_days': days,
        'sales_data': [
            {
                'date': str(date),
                'revenue': float(revenue),
                'orders': order_count
            }
            for date, revenue, order_count in daily_sales
        ]
    }), 200

@dashboard_bp.route('/category-stats', methods=['GET'])
@login_required
def get_category_stats():
    """Get sales by category"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    category_stats = db.session.query(
        Product.category,
        func.count(OrderItem.id).label('items_sold'),
        func.sum(OrderItem.quantity * OrderItem.unit_price).label('revenue'),
        func.avg(Product.price).label('avg_price')
    ).join(OrderItem).join(Product).group_by(
        Product.category
    ).all()
    
    return jsonify({
        'categories': [
            {
                'name': category,
                'items_sold': items_sold,
                'revenue': float(revenue),
                'average_price': float(avg_price)
            }
            for category, items_sold, revenue, avg_price in category_stats
        ]
    }), 200

@dashboard_bp.route('/performance-summary', methods=['GET'])
@login_required
def get_performance_summary():
    """Get overall performance summary"""
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    now = datetime.utcnow()
    
    # This month metrics
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    # Last month metrics
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)
    last_month_end = month_start - timedelta(seconds=1)
    
    # Current month
    current_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= month_start
    ).scalar() or 0
    
    current_orders = Order.query.filter(Order.created_at >= month_start).count()
    
    # Last month
    last_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= last_month_start,
        Order.created_at <= last_month_end
    ).scalar() or 0
    
    last_orders = Order.query.filter(
        Order.created_at >= last_month_start,
        Order.created_at <= last_month_end
    ).count()
    
    # Calculate growth
    revenue_growth = ((current_revenue - last_revenue) / last_revenue * 100) if last_revenue > 0 else 0
    orders_growth = ((current_orders - last_orders) / last_orders * 100) if last_orders > 0 else 0
    
    return jsonify({
        'current_month': {
            'revenue': float(current_revenue),
            'orders': current_orders
        },
        'last_month': {
            'revenue': float(last_revenue),
            'orders': last_orders
        },
        'growth': {
            'revenue_percent': round(revenue_growth, 2),
            'orders_percent': round(orders_growth, 2)
        }
    }), 200
