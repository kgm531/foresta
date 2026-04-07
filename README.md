# Foresta — Full Stack Web App

## Project Structure

```
foresta/
│
├── app.py                        ← Flask backend (routes + product data)
├── requirements.txt              ← Python dependencies
│
├── static/
│   └── logo.png                  ← ضع ملف اللوجو هنا
│
└── templates/
    ├── index.html                ← الصفحة الرئيسية (Homepage)
    ├── products.html             ← صفحة جميع المنتجات (Shop All)
    ├── product_detail.html       ← صفحة تفاصيل المنتج (Product Page)
    └── 404.html                  ← صفحة الخطأ 404
```

## Setup & Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Place logo.png inside the static/ folder

# 3. Move your HTML files:
#    - index.html           → templates/index.html
#    - (other templates are already in templates/)

# 4. Run the app
python app.py
```

Then open: http://localhost:5000

## Routes

| URL                      | Page                        |
|--------------------------|-----------------------------|
| `/`                      | Homepage                    |
| `/products`              | All products listing        |
| `/shop`                  | Same as /products           |
| `/product/<slug>`        | Individual product detail   |
| `/api/products`          | JSON - all products         |
| `/api/product/<slug>`    | JSON - single product       |

## Product Slugs

| Slug                     | Product                     |
|--------------------------|-----------------------------|
| canopy-linen-jacket      | The Canopy Linen Jacket     |
| birch-linen-shirt        | The Birch Linen Shirt       |
| dusk-oversized-coat      | The Dusk Oversized Coat     |
| stone-linen-trousers     | Stone Linen Trousers        |
| morning-ritual-set       | The Morning Ritual Set      |
| forest-floor-knit        | The Forest Floor Knit       |

## Filter & Sort (Products Page)

Query parameters:
- `?category=outerwear|tops|bottoms|sets|all`
- `?collection=Autumn+Canopy|Dusk+Outerwear|...`
- `?sort=default|price-asc|price-desc|rating|discount`

Example: `/products?category=outerwear&sort=rating`
