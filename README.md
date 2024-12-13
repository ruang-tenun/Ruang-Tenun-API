# Ruang Tenun Backend API

The Ruang Tenun Backend API is a program used to provide data for the Ruang Tenun application. It is built using Express.js, Prisma, and MySQL.

## Technologies Used

- **Express.js**: A fast and minimalist web framework for Node.js.
- **Prisma**: A modern ORM for Node.js and TypeScript that helps with database access.
- **MySQL**: A relational database management system.
- **Node.js**: JavaScript runtime environment.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x or later)
- [MySQL](https://www.mysql.com/) (or a MySQL-compatible database service)
- [npm](https://www.npmjs.com/) (Node package manager)

## Installation

Follow these steps to set up your environment:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/ruang-tenun/Ruang-Tenun-API.git
    cd Ruang-Tenun-API
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Install Prisma CLI globally** (if not installed already):
    ```bash
    npm install -g prisma
    ```

## Configuration

1. **Set up environment variables**:
    - Create a `.env` file in the root directory and define your database URL:
    ```env
    DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/database_name"
    ```

2. **Configure Prisma**:
    - In your project, Prisma configuration is defined in the `prisma/schema.prisma` file. Ensure the provider is set to MySQL and the database URL matches the `.env` file.

## Running the Application

To run the Express.js server locally, use the following command:

```bash
npm run start:dev
```
# API Documentation

This document outlines the API endpoints available for user, seller, category, product, link, favorite, and profile management. All endpoints that require authentication must include a valid Bearer token.

## Auth

### POST /api/register
Register a new user.

**Request Body** (raw JSON):
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "08123456789",
  "address": "123 Main St, Jakarta"
}
```

### POST /api/register/seller
Register a new seller.

**Request Body** (raw JSON):
```json
{
  "name": "tenun_store",
  "email": "tenunstore@example.com",
  "password": "storepassword123",
  "phone": "08123456789",
  "address": "456 Batik St, Jakarta"
}
```


### POST /api/login
Login a user.

**Request Body** (raw JSON):
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### GET /api/logout
Logout a user (requires Bearer token).

---

## Categories

### POST /api/categories
Add a new category (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "name": "Tenun Lampung",
  "description": "Traditional woven fabrics from Lampung, Indonesia.",
  "address": "Lampung"
}
```

### PUT /api/categories/:id
Update a category by ID (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "name": "Tenun Sumba",
  "description": "Handwoven fabrics from Sumba Island.",
  "address": "Sumba"
}
```

### GET /api/categories
Get all categories (requires Bearer token).

### GET /api/categories/:id
Get category details by ID (requires Bearer token).

### DELETE /api/categories/:id
Delete a category by ID (requires Bearer token).

---

## Products

### POST /api/products
Add a new product (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "name": "Tenun Lampung Red",
  "address": "Lampung",
  "latitude": "-5.2437",
  "longitude": "105.2545",
  "image_url": "https://example.com/images/tenun_lampung_red.jpg",
  "category_id": 1,
  "seller_id": 2
}
```

### GET /api/products
Get all products (requires Bearer token).

### GET /api/products/:id
Get product details by ID (requires Bearer token).

### GET /api/products?category=:category_id
Get products by category ID (requires Bearer token).

### GET /api/products?seller=:seller_id
Get products by seller ID (requires Bearer token).

### PUT /api/products/:id
Update a product by ID (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "name": "Tenun Sumba Blue",
  "address": "Sumba",
  "image_url": "https://example.com/images/tenun_sumba_blue.jpg",
  "category_id": 2,
  "seller_id": 2
}
```

### DELETE /api/products/:id
Delete a product by ID (requires Bearer token).

---

## Links

### POST /api/links
Add a new link (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "product_id": 5,
  "ecommerce_name": "Shopee",
  "link_url": "https://shopee.com/product/12345"
}
```

### GET /api/links
Get all links (requires Bearer token).

### GET /api/links/:id
Get link details by ID (requires Bearer token).

### PUT /api/links/:id
Update a link by ID (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "product_id": 5,
  "ecommerce_name": "Tokopedia",
  "link_url": "https://tokopedia.com/product/12345"
}
```

### DELETE /api/links/:id
Delete a link by ID (requires Bearer token).

---

## Favorites

### POST /api/favorites
Add a new favorite (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "user_id": 3,
  "product_id": 2
}
```

### GET /api/favorites
Get all favorites (requires Bearer token).

### GET /api/favorites/:id
Get favorite details by ID (requires Bearer token).

### GET /api/favorites?user=:user_id
Get favorites by user ID (requires Bearer token).

### PUT /api/favorites/:id
Update a favorite by ID (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "user_id": 3,
  "product_id": 4
}
```

### DELETE /api/favorites/:id
Delete a favorite by ID (requires Bearer token).

---

## Profile

### PUT /api/profile/user/:id
Update user profile by ID (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "username": "johnny_doe",
  "email": "johnny.doe@example.com",
  "password": "newpassword123",
  "phone": "08123456789",
  "address": "456 Another St, Jakarta"
}
```

### PUT /api/profile/seller/:id
Update seller profile by ID (requires Bearer token).

**Request Body** (raw JSON):
```json
{
  "name": "super_tenun_store",
  "email": "superstore@example.com",
  "password": "newstorepassword123",
  "phone": "08123456789",
  "address": "789 Batik Ave, Jakarta"
}
```

### DELETE /api/profile/user/:id
Delete user by ID (requires Bearer token).

### DELETE /api/profile/user
Delete user by username (requires Bearer token).

**Query Params**:
- `username`: User's username (e.g., `john_doe`)

### DELETE /api/profile/seller/:id
Delete seller by ID (requires Bearer token).

### DELETE /api/profile/seller
Delete seller by email (requires Bearer token).

**Query Params**:
- `email`: Seller's email (e.g., `superstore@example.com`)

### GET /api/profile/user/:id
Get user details by ID (requires Bearer token).

### GET /api/profile/user
Get user details by username (requires Bearer token).

**Query Params**:
- `username`: User's username (e.g., `johnny_doe`)

### GET /api/profile/seller/:id
Get seller details by ID (requires Bearer token).

### GET /api/profile/seller
Get seller details by name (requires Bearer token).

**Query Params**:
- `name`: Seller's name (e.g., `super_store`)
