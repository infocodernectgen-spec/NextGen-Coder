# API Documentation

## Toady Bakery REST API

### Base URL
```
http://localhost:5000
```

## Authentication Routes

### Signup
- **POST** `/api/auth/signup`
- **Body:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "username": "john_doe",
    "password": "password123"
  }
  ```

### Logout
- **POST** `/api/auth/logout`
- **Requires:** Authentication

### Get Profile
- **GET** `/api/auth/profile`
- **Requires:** Authentication

### Update Profile
- **PUT** `/api/auth/profile`
- **Requires:** Authentication
- **Body:**
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890",
    "address": "123 Main St"
  }
  ```

## Product Routes

### Get All Products
- **GET** `/api/products`
- **Query:** `?category=Cakes`

### Get Product by ID
- **GET** `/api/products/<product_id>`

### Get Products by Category
- **GET** `/api/products/category/<category>`

## Shopping Cart Routes

### Get Cart
- **GET** `/api/cart`
- **Requires:** Authentication

### Add to Cart
- **POST** `/api/cart/add`
- **Requires:** Authentication
- **Body:**
  ```json
  {
    "product_id": 1,
    "quantity": 2
  }
  ```

### Remove from Cart
- **DELETE** `/api/cart/remove/<item_id>`
- **Requires:** Authentication

### Clear Cart
- **DELETE** `/api/cart/clear`
- **Requires:** Authentication

## Order Routes

### Create Order
- **POST** `/api/orders`
- **Requires:** Authentication
- **Body:**
  ```json
  {
    "special_instructions": "Please add extra frosting",
    "delivery_date": "2026-02-15T10:00:00"
  }
  ```

### Get User Orders
- **GET** `/api/orders`
- **Requires:** Authentication

### Get Order Details
- **GET** `/api/orders/<order_id>`
- **Requires:** Authentication

### Get Order Status
- **GET** `/api/orders/<order_id>/status`
- **Requires:** Authentication

## Admin Routes

### Create Product
- **POST** `/api/admin/products`
- **Requires:** Admin Authentication
- **Body:**
  ```json
  {
    "name": "Red Velvet Cake",
    "description": "Classic red velvet cake",
    "price": 39.99,
    "category": "Cakes",
    "stock": 10,
    "image_url": "/assets/images/red-velvet.jpg"
  }
  ```

### Update Product
- **PUT** `/api/admin/products/<product_id>`
- **Requires:** Admin Authentication

### Get All Orders
- **GET** `/api/admin/orders`
- **Requires:** Admin Authentication

### Update Order Status
- **PUT** `/api/admin/orders/<order_id>/status`
- **Requires:** Admin Authentication
- **Body:**
  ```json
  {
    "status": "shipped"
  }
  ```

## Dashboard & Analytics Routes

### Dashboard Overview
- **GET** `/api/dashboard/overview`
- **Requires:** Admin Authentication
- **Returns:** Total orders, revenue, products, customers, recent orders

### Revenue Statistics
- **GET** `/api/dashboard/revenue?period=month`
- **Requires:** Admin Authentication
- **Query:** `period` = day, week, month, or year
- **Returns:** Daily revenue data and order counts

### Top Products
- **GET** `/api/dashboard/top-products?limit=10`
- **Requires:** Admin Authentication
- **Returns:** Best-selling products with quantities and revenue

### Customer Statistics
- **GET** `/api/dashboard/customer-stats`
- **Requires:** Admin Authentication
- **Returns:** Total customers, new customers this month, top spenders

### Inventory Status
- **GET** `/api/dashboard/inventory?threshold=5`
- **Requires:** Admin Authentication
- **Returns:** Low stock items, out of stock count, inventory value

### Order Analytics
- **GET** `/api/dashboard/order-analytics`
- **Requires:** Admin Authentication
- **Returns:** Average order value, status breakdown, monthly metrics

### Sales Trend
- **GET** `/api/dashboard/sales-trend?days=30`
- **Requires:** Admin Authentication
- **Returns:** Daily sales data over specified days

### Category Sales
- **GET** `/api/dashboard/category-stats`
- **Requires:** Admin Authentication
- **Returns:** Sales by category with revenue and average prices

### Performance Summary
- **GET** `/api/dashboard/performance-summary`
- **Requires:** Admin Authentication
- **Returns:** Current vs last month comparison with growth percentages

## Demo Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Demo Account:**
- Username: `demo`
- Password: `demo123`

## Error Responses

```json
{
  "error": "Error message here"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
