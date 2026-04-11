"""
Foresta — Full-stack e-commerce backend (Flask + SQLite)
Run:  pip install flask flask-sqlalchemy werkzeug
      python app.py
Admin: http://localhost:5000/admin  (password: foresta2025 or set ADMIN_PASSWORD env var)
"""

import os, json, uuid, math, re, csv
from datetime import datetime, timedelta
from functools import wraps
from io import StringIO
from flask import (
    Flask, render_template, jsonify, abort,
    request, redirect, url_for, session, flash, Response
)
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

# ══════════════════════════════════════════════════════════════════
#  APP CONFIGURATION
# ══════════════════════════════════════════════════════════════════

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.secret_key          = os.environ.get("SECRET_KEY", "foresta_dev_2025_change_in_prod")
app.permanent_session_lifetime = timedelta(days=30)
app.config["SQLALCHEMY_DATABASE_URI"]        = f"sqlite:///{os.path.join(BASE_DIR, 'foresta.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"]             = 16 * 1024 * 1024   # 16 MB upload limit
app.config["UPLOAD_FOLDER"]                  = os.path.join(BASE_DIR, "static", "uploads", "products")

ADMIN_PASSWORD       = os.environ.get("ADMIN_PASSWORD", "foresta2025")
ADMIN_USERNAME       = os.environ.get("ADMIN_USERNAME", "admin")
SHIPPING_THRESHOLD   = 200
SHIPPING_COST        = 12
ALLOWED_EXTENSIONS   = {"png", "jpg", "jpeg", "webp", "gif"}

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

db = SQLAlchemy(app)


# ══════════════════════════════════════════════════════════════════
#  DATABASE MODELS
# ══════════════════════════════════════════════════════════════════

class Product(db.Model):
    __tablename__ = "products"
    id             = db.Column(db.Integer, primary_key=True)
    slug           = db.Column(db.String(120), unique=True, nullable=False)
    name           = db.Column(db.String(255), nullable=False)
    subtitle       = db.Column(db.String(512))
    collection     = db.Column(db.String(100))
    category       = db.Column(db.String(50))
    price          = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)
    discount       = db.Column(db.Integer, default=0)
    currency       = db.Column(db.String(5), default="$")
    rating         = db.Column(db.Float, default=5.0)
    reviews        = db.Column(db.Integer, default=0)
    badge          = db.Column(db.String(100))
    in_stock       = db.Column(db.Boolean, default=True)
    description    = db.Column(db.Text)
    cover          = db.Column(db.String(600))
    sizes_json     = db.Column(db.Text, default="[]")
    images_json    = db.Column(db.Text, default="[]")
    eco_json       = db.Column(db.Text, default="[]")
    details_json   = db.Column(db.Text, default="{}")
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def sizes(self):
        return json.loads(self.sizes_json or "[]")

    @property
    def images(self):
        return json.loads(self.images_json or "[]")

    @property
    def eco(self):
        return json.loads(self.eco_json or "[]")

    @property
    def details(self):
        return json.loads(self.details_json or "{}")

    def to_dict(self):
        return {
            "id": self.id, "slug": self.slug, "name": self.name,
            "subtitle": self.subtitle, "collection": self.collection,
            "category": self.category, "price": self.price,
            "original_price": self.original_price or self.price,
            "discount": self.discount or 0, "currency": self.currency,
            "rating": self.rating, "reviews": self.reviews,
            "badge": self.badge, "in_stock": self.in_stock,
            "description": self.description, "cover": self.cover,
            "sizes": self.sizes, "images": self.images,
            "eco": self.eco, "details": self.details,
        }


class Order(db.Model):
    __tablename__ = "orders"
    id         = db.Column(db.Integer, primary_key=True)
    order_id   = db.Column(db.String(20), unique=True, nullable=False)
    name       = db.Column(db.String(200))
    email      = db.Column(db.String(200))
    phone      = db.Column(db.String(50))
    address    = db.Column(db.String(500))
    city       = db.Column(db.String(100))
    country    = db.Column(db.String(100))
    postal     = db.Column(db.String(20))
    subtotal    = db.Column(db.Float, default=0)
    shipping    = db.Column(db.Float, default=0)
    discount    = db.Column(db.Float, default=0)
    coupon_code = db.Column(db.String(50))
    total       = db.Column(db.Float, default=0)
    status      = db.Column(db.String(30), default="confirmed")
    gift_note   = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    items      = db.relationship("OrderItem", backref="order", lazy=True, cascade="all, delete-orphan")

    STATUS_COLORS = {
        "confirmed":  "#1A3021",
        "processing": "#A0522D",
        "shipped":    "#2E5D4B",
        "delivered":  "#3A7D44",
        "cancelled":  "#8B2020",
    }

    @property
    def status_color(self):
        return self.STATUS_COLORS.get(self.status, "#666")


class OrderItem(db.Model):
    __tablename__ = "order_items"
    id            = db.Column(db.Integer, primary_key=True)
    order_db_id   = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    product_slug  = db.Column(db.String(120))
    product_name  = db.Column(db.String(255))
    product_cover = db.Column(db.String(600))
    size          = db.Column(db.String(15))
    quantity      = db.Column(db.Integer, default=1)
    price         = db.Column(db.Float)
    line_total    = db.Column(db.Float)


class Subscriber(db.Model):
    __tablename__ = "subscribers"
    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(200), unique=True, nullable=False)
    source     = db.Column(db.String(50), default="newsletter")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Coupon(db.Model):
    __tablename__ = "coupons"
    id             = db.Column(db.Integer, primary_key=True)
    code           = db.Column(db.String(50), unique=True, nullable=False)
    discount_type  = db.Column(db.String(10), default="percent")  # "percent" or "fixed"
    discount_value = db.Column(db.Float, nullable=False)
    max_uses       = db.Column(db.Integer, default=0)   # 0 = unlimited
    used_count     = db.Column(db.Integer, default=0)
    active         = db.Column(db.Boolean, default=True)
    expires_at     = db.Column(db.DateTime, nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)


# ══════════════════════════════════════════════════════════════════
#  SEED DATA
# ══════════════════════════════════════════════════════════════════

SEED_PRODUCTS = [
    {
        "slug": "canopy-linen-jacket", "name": "The Canopy Linen Jacket",
        "subtitle": "Unstructured. Unhurried. Unapologetically natural.",
        "collection": "Autumn Canopy", "category": "outerwear",
        "price": 348, "original_price": 435, "discount": 20, "currency": "$",
        "rating": 4.9, "reviews": 238, "badge": "New Season Favourite", "in_stock": True,
        "cover": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80",
        "description": "Hand-finished in Portugal from a 400gsm Belgian linen blend, the Canopy Jacket breathes with the season. Its unlined drop-shoulder silhouette moves like a second skin — equally at home in a forest clearing or a city morning. Stone-washed to achieve a lived-in softness that only deepens with time.",
        "sizes": [{"label":"XS","available":False},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80","thumb":"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70","label":"Front View"},{"src":"https://images.unsplash.com/photo-1594938298603-c8148b9a7691?w=900&q=80","thumb":"https://images.unsplash.com/photo-1594938298603-c8148b9a7691?w=200&q=70","label":"Back View"},{"src":"https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=900&q=80","thumb":"https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=200&q=70","label":"Detail"},{"src":"https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=900&q=80","thumb":"https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=200&q=70","label":"Lifestyle"}],
        "eco": [{"icon":"🌿","title":"100% European Stone-Washed Linen"},{"icon":"♻️","title":"Carbon-Neutral Production"},{"icon":"🌱","title":"1 Tree Planted Per Purchase"}],
        "details": {"Materials & Care":["80% European stone-washed linen, 20% organic cotton","OEKO-TEX® Standard 100 certified","Hand wash cold or gentle machine wash","Dry flat; iron on low while slightly damp"],"Fit & Sizing":["Oversized, drop-shoulder silhouette","Model is 181cm and wears size M","Chest: S(96) M(102) L(108) XL(116) XXL(124) cm"],"Sustainability":["Carbon-neutral production via verified offsets","Natural linen requires 13× less water than cotton","One tree planted for every order"],"Delivery & Returns":["Free carbon-offset shipping on orders over $200","Delivered in 3–5 business days","Free 30-day returns"]},
    },
    {
        "slug": "birch-linen-shirt", "name": "The Birch Linen Shirt",
        "subtitle": "Breathable. Considered. Built for every season.",
        "collection": "Autumn Canopy", "category": "tops",
        "price": 178, "original_price": 210, "discount": 15, "currency": "$",
        "rating": 4.8, "reviews": 142, "badge": "Bestseller", "in_stock": True,
        "cover": "https://images.unsplash.com/photo-1585911735095-7f407bc19baf?w=700&q=80",
        "description": "Woven from single-origin Belgian linen, the Birch Shirt is the cornerstone of our Autumn collection. With its relaxed fit and mother-of-pearl buttons, it layers as beautifully as it stands alone.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":False},{"label":"XXL","available":False}],
        "images": [{"src":"https://images.unsplash.com/photo-1585911735095-7f407bc19baf?w=900&q=80","thumb":"https://images.unsplash.com/photo-1585911735095-7f407bc19baf?w=200&q=70","label":"Front View"},{"src":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80","thumb":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=70","label":"Detail"}],
        "eco": [{"icon":"🌿","title":"100% Belgian Linen"},{"icon":"♻️","title":"Carbon-Neutral Dyeing"},{"icon":"🌱","title":"1 Tree Planted Per Purchase"}],
        "details": {"Materials & Care":["100% single-origin Belgian linen","Garment-dyed with GOTS-certified natural dyes","Machine wash cold on gentle cycle"],"Fit & Sizing":["Relaxed fit with a slightly longer back hem","Model is 178cm and wears size S"],"Sustainability":["Zero-waste cut patterns — 98% fabric utilisation","Natural linen is fully biodegradable"],"Delivery & Returns":["Free carbon-offset shipping on orders over $200","Delivered in 3–5 business days","Free 30-day returns"]},
    },
    {
        "slug": "dusk-oversized-coat", "name": "The Dusk Oversized Coat",
        "subtitle": "For the long walk home. For every long walk.",
        "collection": "Dusk Outerwear", "category": "outerwear",
        "price": 495, "original_price": 495, "discount": 0, "currency": "$",
        "rating": 5.0, "reviews": 89, "badge": "New Arrival", "in_stock": True,
        "cover": "https://images.unsplash.com/photo-1594938298603-c8148b9a7691?w=700&q=80",
        "description": "Sculpted from a heavyweight Portuguese wool-linen blend, the Dusk Coat is designed for the golden hour and everything after.",
        "sizes": [{"label":"XS","available":False},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":False}],
        "images": [{"src":"https://images.unsplash.com/photo-1594938298603-c8148b9a7691?w=900&q=80","thumb":"https://images.unsplash.com/photo-1594938298603-c8148b9a7691?w=200&q=70","label":"Front View"},{"src":"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80","thumb":"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70","label":"Side View"}],
        "eco": [{"icon":"🌿","title":"Wool-Linen Blend"},{"icon":"♻️","title":"Carbon-Neutral Production"},{"icon":"🌱","title":"1 Tree Planted Per Purchase"}],
        "details": {"Materials & Care":["60% Portuguese wool, 40% European linen","OEKO-TEX® Standard 100 certified","Dry clean recommended"],"Fit & Sizing":["Oversized structured silhouette","Model is 179cm and wears size M"],"Sustainability":["Wool sourced from certified RWS farms","Packaging is 100% compostable"],"Delivery & Returns":["Free carbon-offset shipping on orders over $200","Delivered in 3–5 business days","Free 30-day returns"]},
    },
    {
        "slug": "stone-linen-trousers", "name": "Stone Linen Trousers",
        "subtitle": "Ease made precise. A trouser for every day.",
        "collection": "River Stone", "category": "bottoms",
        "price": 198, "original_price": 245, "discount": 19, "currency": "$",
        "rating": 4.7, "reviews": 194, "badge": "Perennial Favourite", "in_stock": True,
        "cover": "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=700&q=80",
        "description": "Cut from a medium-weight stone-washed linen, these trousers achieve the rare balance between structure and ease.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=900&q=80","thumb":"https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=200&q=70","label":"Front View"},{"src":"https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=900&q=80","thumb":"https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=200&q=70","label":"Detail"}],
        "eco": [{"icon":"🌿","title":"Stone-Washed European Linen"},{"icon":"♻️","title":"Natural Dye Process"},{"icon":"🌱","title":"1 Tree Planted Per Purchase"}],
        "details": {"Materials & Care":["100% European stone-washed linen","Machine wash cold; line dry"],"Fit & Sizing":["High-waist, wide-leg silhouette","Model is 175cm and wears size S"],"Sustainability":["Natural linen requires zero irrigation"],"Delivery & Returns":["Free carbon-offset shipping on orders over $200","Delivered in 3–5 business days","Free 30-day returns"]},
    },
    {
        "slug": "morning-ritual-set", "name": "The Morning Ritual Set",
        "subtitle": "Two pieces. One intention. All day ease.",
        "collection": "Morning Ritual", "category": "sets",
        "price": 267, "original_price": 335, "discount": 20, "currency": "$",
        "rating": 4.9, "reviews": 76, "badge": "Limited Edition", "in_stock": True,
        "cover": "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=700&q=80",
        "description": "A top and trouser designed as one. The Morning Ritual Set is our most considered piece.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":False},{"label":"XL","available":False},{"label":"XXL","available":False}],
        "images": [{"src":"https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=900&q=80","thumb":"https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=200&q=70","label":"Full Set"},{"src":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80","thumb":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=70","label":"Detail"}],
        "eco": [{"icon":"🌿","title":"Single-Bolt Linen — Zero Off-Cut Waste"},{"icon":"♻️","title":"Same-Batch Natural Dyeing"},{"icon":"🌱","title":"2 Trees Planted Per Set"}],
        "details": {"Materials & Care":["100% European linen — cut from same bolt","Hand wash cold; line dry together"],"Fit & Sizing":["Top: relaxed fit, crop length","Trouser: mid-rise, tapered leg"],"Sustainability":["Single-bolt cutting eliminates fabric waste","2 trees planted per set purchased"],"Delivery & Returns":["Free carbon-offset shipping on orders over $200","Free 30-day returns — sets must be returned together"]},
    },
    {
        "slug": "forest-floor-knit", "name": "The Forest Floor Knit",
        "subtitle": "Texture you can feel. Warmth you can trust.",
        "collection": "Autumn Canopy", "category": "tops",
        "price": 245, "original_price": 245, "discount": 0, "currency": "$",
        "rating": 4.8, "reviews": 53, "badge": "New Arrival", "in_stock": True,
        "cover": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
        "description": "Hand-knitted in the Portuguese highlands from a merino-linen blend, the Forest Floor Knit carries the texture of the earth in every stitch.",
        "sizes": [{"label":"XS","available":False},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80","thumb":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=70","label":"Front View"},{"src":"https://images.unsplash.com/photo-1585911735095-7f407bc19baf?w=900&q=80","thumb":"https://images.unsplash.com/photo-1585911735095-7f407bc19baf?w=200&q=70","label":"Texture Detail"}],
        "eco": [{"icon":"🌿","title":"RWS Merino & Linen Blend"},{"icon":"♻️","title":"Hand-Knitted — Zero Machine Energy"},{"icon":"🌱","title":"1 Tree Planted Per Purchase"}],
        "details": {"Materials & Care":["70% RWS-certified merino wool, 30% European linen","Hand wash cold in wool detergent","Dry flat away from direct sunlight"],"Fit & Sizing":["Relaxed fit — intentionally oversized","Model is 177cm and wears size S"],"Sustainability":["Hand-knitting eliminates industrial machine energy use","Dyed with plant-based pigments"],"Delivery & Returns":["Free carbon-offset shipping on orders over $200","Delivered in 3–5 business days","Free 30-day returns"]},
    },
    # ── New collection (local images) ──────────────────────────
    {
        "slug": "forest-skyline-sweatshirt", "name": "Forest Skyline Sweatshirt",
        "subtitle": "Detailed landscape. Worn with intention.",
        "collection": "Urban Wild", "category": "tops",
        "price": 145, "original_price": 145, "discount": 0, "currency": "$",
        "rating": 5.0, "reviews": 12, "badge": "New Arrival", "in_stock": True,
        "cover": "/static/img/forest-print-sweatshirt.jfif",
        "description": "A heavyweight sweatshirt featuring an intricate forest skyline print. The bold graphic merges urban energy with wilderness — a statement piece for those who carry the forest with them.",
        "sizes": [{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"/static/img/forest-print-sweatshirt.jfif","thumb":"/static/img/forest-print-sweatshirt.jfif","label":"Front View"}],
        "eco": [{"icon":"🌲","title":"Forest-Inspired Print"},{"icon":"👕","title":"Premium Heavyweight Fabric"},{"icon":"✦","title":"Original Design"}],
        "details": {"Materials & Care":["100% cotton heavyweight fleece","Machine wash cold, tumble dry low"],"Fit & Sizing":["Regular fit, available in S-XXL"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "wild-cat-shadow-tee", "name": "Wild Cat Shadow Tee",
        "subtitle": "Minimalist. Powerful. Untamed.",
        "collection": "Shadow Collection", "category": "tops",
        "price": 89, "original_price": 110, "discount": 19, "currency": "$",
        "rating": 4.9, "reviews": 34, "badge": "Bestseller", "in_stock": True,
        "cover": "/static/img/cat-silhouette-tee.jfif",
        "description": "A drop-shoulder oversized tee featuring a bold cat silhouette in stark contrast. The oversized cut creates a relaxed, street-ready silhouette — wear it as a dress or layered over wide-leg trousers.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":False}],
        "images": [{"src":"/static/img/cat-silhouette-tee.jfif","thumb":"/static/img/cat-silhouette-tee.jfif","label":"Front View"}],
        "eco": [{"icon":"🐱","title":"Original Cat Silhouette Art"},{"icon":"👕","title":"Drop Shoulder Oversized Fit"},{"icon":"✦","title":"Premium Cotton"}],
        "details": {"Materials & Care":["100% cotton","Machine wash cold"],"Fit & Sizing":["Oversized drop-shoulder silhouette","Model wears size S"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "winged-crow-graphic-tee", "name": "Winged Crow Graphic Tee",
        "subtitle": "Dark wings. Quiet power.",
        "collection": "Shadow Collection", "category": "tops",
        "price": 79, "original_price": 79, "discount": 0, "currency": "$",
        "rating": 4.8, "reviews": 21, "badge": "New Arrival", "in_stock": True,
        "cover": "/static/img/winged-crow-tee.jfif",
        "description": "A crow in full wingspan against a crescent moon — this graphic captures the mystery and freedom of nocturnal wildlife. Screen-printed on a premium white tee with a relaxed unisex fit.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"/static/img/winged-crow-tee.jfif","thumb":"/static/img/winged-crow-tee.jfif","label":"Front View"}],
        "eco": [{"icon":"🦅","title":"Original Wildlife Art"},{"icon":"🌙","title":"Moon and Crow Print"},{"icon":"👕","title":"Premium Screen Print"}],
        "details": {"Materials & Care":["100% cotton","Machine wash cold, inside out"],"Fit & Sizing":["Regular unisex fit, true to size"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "forest-text-graphic-tee", "name": "Forest Text Graphic Tee",
        "subtitle": "Bold type. Wild roots.",
        "collection": "Urban Wild", "category": "tops",
        "price": 75, "original_price": 95, "discount": 21, "currency": "$",
        "rating": 4.7, "reviews": 18, "badge": "Sale", "in_stock": True,
        "cover": "/static/img/wildlife-tee-1.jfif",
        "description": "A clean white tee with an eye-catching graphic text print. Minimal effort, maximum statement — this is everyday streetwear with a wild soul.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"/static/img/wildlife-tee-1.jfif","thumb":"/static/img/wildlife-tee-1.jfif","label":"Front View"}],
        "eco": [{"icon":"✍️","title":"Graphic Text Print"},{"icon":"👕","title":"Premium White Cotton"},{"icon":"✦","title":"Casual Fit"}],
        "details": {"Materials & Care":["100% cotton","Machine wash cold"],"Fit & Sizing":["Regular fit, true to size"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "forest-echo-tee", "name": "Forest Echo Tee",
        "subtitle": "Earth tones. Forest soul.",
        "collection": "Autumn Canopy", "category": "tops",
        "price": 85, "original_price": 85, "discount": 0, "currency": "$",
        "rating": 4.9, "reviews": 27, "badge": "New Arrival", "in_stock": True,
        "cover": "/static/img/wildlife-tee-2.jfif",
        "description": "An earthy brown tee with a vivid forest graphic in deep greens and naturals. The colour palette is drawn directly from the forest floor — warm, grounded, alive.",
        "sizes": [{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"/static/img/wildlife-tee-2.jfif","thumb":"/static/img/wildlife-tee-2.jfif","label":"Front View"}],
        "eco": [{"icon":"🌳","title":"Forest Graphic Print"},{"icon":"🟤","title":"Earth Tone Colourway"},{"icon":"👕","title":"Premium Cotton"}],
        "details": {"Materials & Care":["100% cotton","Machine wash cold"],"Fit & Sizing":["Regular fit"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "wilderness-strong-tee", "name": "Wilderness Strong Tee",
        "subtitle": "Stand tall. Stay wild.",
        "collection": "Urban Wild", "category": "tops",
        "price": 79, "original_price": 99, "discount": 20, "currency": "$",
        "rating": 4.8, "reviews": 15, "badge": "Sale", "in_stock": True,
        "cover": "/static/img/wildlife-tee-3.jfif",
        "description": "A bold navy tee with a STRONG print and a striking silhouette design. Made for those who find their strength in nature — this is confidence you can wear.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":False},{"label":"XXL","available":False}],
        "images": [{"src":"/static/img/wildlife-tee-3.jfif","thumb":"/static/img/wildlife-tee-3.jfif","label":"Front View"}],
        "eco": [{"icon":"💪","title":"Bold Graphic Print"},{"icon":"🔵","title":"Deep Navy Colourway"},{"icon":"👕","title":"Premium Cotton"}],
        "details": {"Materials & Care":["100% cotton","Machine wash cold"],"Fit & Sizing":["Regular fit"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "forest-flag-tee", "name": "Forest Flag Tee",
        "subtitle": "Vertical lines. Vertical ambitions.",
        "collection": "Shadow Collection", "category": "tops",
        "price": 79, "original_price": 79, "discount": 0, "currency": "$",
        "rating": 4.7, "reviews": 8, "badge": "New Arrival", "in_stock": True,
        "cover": "/static/img/wildlife-tee-4.jfif",
        "description": "A dark, minimalist tee with a vertical graphic design. Clean lines inspired by the tall trunks of ancient trees — understated and commanding.",
        "sizes": [{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"/static/img/wildlife-tee-4.jfif","thumb":"/static/img/wildlife-tee-4.jfif","label":"Front View"}],
        "eco": [{"icon":"🌲","title":"Vertical Forest Design"},{"icon":"🖤","title":"Dark Colourway"},{"icon":"👕","title":"Premium Cotton"}],
        "details": {"Materials & Care":["100% cotton","Machine wash cold"],"Fit & Sizing":["Regular fit"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "cosmos-night-tee", "name": "Cosmos Night Tee",
        "subtitle": "The universe on your chest.",
        "collection": "Night Sky", "category": "tops",
        "price": 89, "original_price": 110, "discount": 19, "currency": "$",
        "rating": 5.0, "reviews": 41, "badge": "Bestseller", "in_stock": True,
        "cover": "/static/img/wildlife-tee-5.jfif",
        "description": "A premium black tee with a vertical solar system print — the planets aligned, as if nature planned it. A conversation piece for those who look up.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"/static/img/wildlife-tee-5.jfif","thumb":"/static/img/wildlife-tee-5.jfif","label":"Front View"}],
        "eco": [{"icon":"🪐","title":"Solar System Print"},{"icon":"🖤","title":"Premium Black Cotton"},{"icon":"✦","title":"Original Illustration"}],
        "details": {"Materials & Care":["100% premium cotton","Machine wash cold, inside out"],"Fit & Sizing":["Regular unisex fit, true to size"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "forest-creature-sketch-tee", "name": "Forest Creature Sketch Tee",
        "subtitle": "Simple lines. Wild heart.",
        "collection": "Urban Wild", "category": "tops",
        "price": 72, "original_price": 90, "discount": 20, "currency": "$",
        "rating": 4.8, "reviews": 19, "badge": "Sale", "in_stock": True,
        "cover": "/static/img/wildlife-tee-6.jfif",
        "description": "A clean white tee featuring a delicate hand-drawn sketch of a forest creature. Minimalist and charming — the kind of print that makes people look twice.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":False}],
        "images": [{"src":"/static/img/wildlife-tee-6.jfif","thumb":"/static/img/wildlife-tee-6.jfif","label":"Front View"}],
        "eco": [{"icon":"✏️","title":"Hand-Drawn Illustration"},{"icon":"🤍","title":"Clean White Cotton"},{"icon":"✦","title":"Minimalist Design"}],
        "details": {"Materials & Care":["100% cotton","Machine wash cold"],"Fit & Sizing":["Regular fit"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
    {
        "slug": "moon-shadow-tee", "name": "Moon Shadow Tee",
        "subtitle": "The moon knows your name.",
        "collection": "Night Sky", "category": "tops",
        "price": 79, "original_price": 79, "discount": 0, "currency": "$",
        "rating": 4.9, "reviews": 33, "badge": "New Arrival", "in_stock": True,
        "cover": "/static/img/wildlife-tee-7.jfif",
        "description": "A midnight black tee with clean bold MOON typography. Minimalist by design, powerful by nature — for those drawn to the night and all it holds.",
        "sizes": [{"label":"XS","available":True},{"label":"S","available":True},{"label":"M","available":True},{"label":"L","available":True},{"label":"XL","available":True},{"label":"XXL","available":True}],
        "images": [{"src":"/static/img/wildlife-tee-7.jfif","thumb":"/static/img/wildlife-tee-7.jfif","label":"Front View"}],
        "eco": [{"icon":"🌕","title":"Moon Typography"},{"icon":"🖤","title":"Midnight Black Cotton"},{"icon":"✦","title":"Bold Minimal Design"}],
        "details": {"Materials & Care":["100% premium cotton","Machine wash cold"],"Fit & Sizing":["Regular unisex fit"],"Delivery & Returns":["Free shipping on orders over $200","Free 30-day returns"]},
    },
]

CATEGORIES = [
    {"slug": "all", "label": "All Pieces"},
    {"slug": "outerwear", "label": "Outerwear"},
    {"slug": "tops",      "label": "Tops"},
    {"slug": "bottoms",   "label": "Bottoms"},
    {"slug": "sets",      "label": "Sets"},
]


# ── DB init ──────────────────────────────────────────────────────

def init_db():
    """Create tables and seed products if empty."""
    db.create_all()
    if Product.query.count() == 0:
        for p in SEED_PRODUCTS:
            prod = Product(
                slug=p["slug"], name=p["name"], subtitle=p.get("subtitle"),
                collection=p.get("collection"), category=p.get("category"),
                price=p["price"], original_price=p.get("original_price"),
                discount=p.get("discount", 0), currency=p.get("currency", "$"),
                rating=p.get("rating", 5.0), reviews=p.get("reviews", 0),
                badge=p.get("badge"), in_stock=p.get("in_stock", True),
                description=p.get("description"), cover=p.get("cover"),
                sizes_json=json.dumps(p.get("sizes", [])),
                images_json=json.dumps(p.get("images", [])),
                eco_json=json.dumps(p.get("eco", [])),
                details_json=json.dumps(p.get("details", {})),
            )
            db.session.add(prod)
        db.session.commit()


# ── Image upload helper ──────────────────────────────────────────

class Pagination:
    """Simple pagination helper passed to templates."""
    def __init__(self, page, per_page, total):
        self.page     = page
        self.per_page = per_page
        self.total    = total
        self.pages    = math.ceil(total / per_page) if total else 1

    @property
    def has_prev(self): return self.page > 1

    @property
    def has_next(self): return self.page < self.pages

    @property
    def prev_num(self): return self.page - 1

    @property
    def next_num(self): return self.page + 1


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_upload(file_storage):
    """Save an uploaded file and return its public URL."""
    if not file_storage or not allowed_file(file_storage.filename):
        return None
    ext  = file_storage.filename.rsplit(".", 1)[1].lower()
    fname = f"{uuid.uuid4().hex}.{ext}"
    path  = os.path.join(app.config["UPLOAD_FOLDER"], fname)
    file_storage.save(path)
    return f"/static/uploads/products/{fname}"


# ══════════════════════════════════════════════════════════════════
#  CART / WISHLIST HELPERS
# ══════════════════════════════════════════════════════════════════

def _get_cart():
    session.setdefault("cart", [])
    return session["cart"]

def _save_cart(cart):
    session["cart"] = cart; session.modified = True

def get_cart_items():
    items = []
    for e in _get_cart():
        p = Product.query.filter_by(slug=e["slug"]).first()
        if p:
            items.append({"slug":e["slug"],"size":e["size"],"quantity":e["quantity"],
                          "product":p.to_dict(),"line_total":p.price*e["quantity"]})
    return items

def get_cart_count():
    return sum(e["quantity"] for e in _get_cart())

def get_cart_subtotal():
    total = 0
    for e in _get_cart():
        p = Product.query.filter_by(slug=e["slug"]).first()
        if p: total += p.price * e["quantity"]
    return round(total, 2)

def get_shipping(subtotal):
    return 0 if subtotal >= SHIPPING_THRESHOLD else SHIPPING_COST

def _get_wishlist():
    session.setdefault("wishlist", [])
    return session["wishlist"]

def get_wishlist_count():
    return len(_get_wishlist())


def _get_coupon_session():
    return session.get("coupon")  # {"code":..., "discount":..., "type":..., "value":...}

def calculate_coupon_discount(coupon_obj, subtotal):
    if coupon_obj.discount_type == "percent":
        return round(subtotal * coupon_obj.discount_value / 100, 2)
    return min(round(coupon_obj.discount_value, 2), subtotal)


# ══════════════════════════════════════════════════════════════════
#  CONTEXT PROCESSOR + ADMIN AUTH
# ══════════════════════════════════════════════════════════════════

@app.context_processor
def inject_globals():
    return {
        "cart_count":     get_cart_count(),
        "wishlist_count": get_wishlist_count(),
        "wishlist_slugs": _get_wishlist(),
        "now":            datetime.utcnow(),
    }

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect(url_for("admin_login", next=request.path))
        return f(*args, **kwargs)
    return decorated


# ══════════════════════════════════════════════════════════════════
#  PUBLIC ROUTES
# ══════════════════════════════════════════════════════════════════

@app.route("/")
def index():
    featured = Product.query.filter_by(slug="canopy-linen-jacket").first()
    products = Product.query.order_by(Product.created_at.desc()).limit(6).all()
    return render_template("index.html",
        featured=featured.to_dict() if featured else None,
        products=[p.to_dict() for p in products])


@app.route("/shop")
@app.route("/products")
def products():
    category   = request.args.get("category", "all")
    collection = request.args.get("collection", "all")
    sort       = request.args.get("sort", "default")
    q          = request.args.get("q", "").strip().lower()

    qry = Product.query

    if category != "all":
        qry = qry.filter_by(category=category)
    if collection != "all":
        qry = qry.filter_by(collection=collection)

    all_prods = qry.all()

    if q:
        all_prods = [p for p in all_prods
                     if q in p.name.lower() or q in (p.description or "").lower()
                     or q in (p.collection or "").lower() or q in (p.category or "").lower()]

    sort_map = {"price-asc":lambda p:p.price,"price-desc":lambda p:-p.price,
                "rating":lambda p:-p.rating,"discount":lambda p:-(p.discount or 0)}
    if sort in sort_map:
        all_prods.sort(key=sort_map[sort])

    collections = sorted(set(p.collection for p in Product.query.all() if p.collection))

    return render_template("products.html",
        products=[p.to_dict() for p in all_prods],
        categories=CATEGORIES, collections=collections,
        active_category=category, active_collection=collection,
        active_sort=sort, search_query=q, total=len(all_prods))


@app.route("/product/<slug>")
def product_detail(slug):
    product = Product.query.filter_by(slug=slug).first_or_404()
    related = Product.query.filter(Product.category == product.category,
                                   Product.id != product.id).limit(3).all()
    return render_template("product_detail.html",
        product=product.to_dict(),
        related=[r.to_dict() for r in related])


@app.route("/search")
def search():
    q = request.args.get("q", "").strip().lower()
    results = []
    if q:
        results = Product.query.filter(
            db.or_(
                Product.name.ilike(f"%{q}%"),
                Product.description.ilike(f"%{q}%"),
                Product.collection.ilike(f"%{q}%"),
                Product.category.ilike(f"%{q}%"),
                Product.subtitle.ilike(f"%{q}%"),
            )
        ).all()
    return render_template("search.html",
        results=[r.to_dict() for r in results],
        query=q, total=len(results))


# ── Cart ─────────────────────────────────────────────────────────

@app.route("/cart")
def cart():
    items    = get_cart_items()
    subtotal = get_cart_subtotal()
    shipping = get_shipping(subtotal)
    return render_template("cart.html", items=items, subtotal=subtotal,
        shipping=shipping, total=round(subtotal+shipping,2),
        shipping_threshold=SHIPPING_THRESHOLD,
        remaining_for_free=max(0, SHIPPING_THRESHOLD-subtotal))


@app.route("/cart/add", methods=["POST"])
def cart_add():
    data     = request.get_json(silent=True) or request.form
    slug     = (data.get("slug") or "").strip()
    size     = (data.get("size") or "").strip()
    quantity = int(data.get("quantity", 1))
    product  = Product.query.filter_by(slug=slug).first()
    if not product:
        return jsonify({"success":False,"error":"Product not found"}), 404
    if not size:
        return jsonify({"success":False,"error":"Please select a size"}), 400
    valid = any(s["label"]==size and s["available"] for s in product.sizes)
    if not valid:
        return jsonify({"success":False,"error":"Size unavailable"}), 400
    cart = _get_cart()
    for e in cart:
        if e["slug"]==slug and e["size"]==size:
            e["quantity"] = min(e["quantity"]+quantity, 10)
            _save_cart(cart)
            return jsonify({"success":True,"message":f"{product.name} ({size}) updated",
                            "cart_count":get_cart_count(),"cart_subtotal":get_cart_subtotal()})
    cart.append({"slug":slug,"size":size,"quantity":quantity})
    _save_cart(cart)
    return jsonify({"success":True,"message":f"{product.name} ({size}) added to cart",
                    "cart_count":get_cart_count(),"cart_subtotal":get_cart_subtotal()})


@app.route("/cart/remove", methods=["POST"])
def cart_remove():
    data = request.get_json(silent=True) or request.form
    slug = (data.get("slug") or "").strip()
    size = (data.get("size") or "").strip()
    _save_cart([e for e in _get_cart() if not (e["slug"]==slug and e["size"]==size)])
    sub = get_cart_subtotal(); shp = get_shipping(sub)
    return jsonify({"success":True,"cart_count":get_cart_count(),
                    "subtotal":sub,"shipping":shp,"total":round(sub+shp,2)})


@app.route("/cart/update", methods=["POST"])
def cart_update():
    data = request.get_json(silent=True) or request.form
    slug = (data.get("slug") or "").strip()
    size = (data.get("size") or "").strip()
    qty  = int(data.get("quantity", 1))
    cart = _get_cart()
    for e in cart:
        if e["slug"]==slug and e["size"]==size:
            if qty <= 0: cart.remove(e)
            else: e["quantity"] = min(qty, 10)
            break
    _save_cart(cart)
    sub = get_cart_subtotal(); shp = get_shipping(sub)
    return jsonify({"success":True,"cart_count":get_cart_count(),
                    "subtotal":sub,"shipping":shp,"total":round(sub+shp,2)})


@app.route("/cart/count")
def cart_count():
    return jsonify({"count":get_cart_count()})


# ── Wishlist ─────────────────────────────────────────────────────

@app.route("/wishlist")
def wishlist():
    slugs = _get_wishlist()
    prods = [p.to_dict() for p in Product.query.filter(Product.slug.in_(slugs)).all()]
    return render_template("wishlist.html", products=prods)


@app.route("/wishlist/toggle", methods=["POST"])
def wishlist_toggle():
    data = request.get_json(silent=True) or request.form
    slug = (data.get("slug") or "").strip()
    if not Product.query.filter_by(slug=slug).first():
        return jsonify({"success":False,"error":"Product not found"}), 404
    wl = _get_wishlist()
    if slug in wl:
        wl.remove(slug); saved=False; msg="Removed from wishlist"
    else:
        wl.append(slug); saved=True; msg="Saved to wishlist"
    session["wishlist"] = wl; session.modified = True
    return jsonify({"success":True,"saved":saved,"message":msg,"wishlist_count":len(wl)})


# ── Checkout ─────────────────────────────────────────────────────

@app.route("/checkout", methods=["GET"])
def checkout():
    items = get_cart_items()
    if not items: return redirect(url_for("cart"))
    sub = get_cart_subtotal(); shp = get_shipping(sub)
    coupon_data = _get_coupon_session()
    discount = coupon_data["discount"] if coupon_data else 0
    total = max(round(sub + shp - discount, 2), 0)
    return render_template("checkout.html", items=items,
        subtotal=sub, shipping=shp, discount=discount,
        coupon_code=coupon_data["code"] if coupon_data else "",
        total=total)


@app.route("/checkout", methods=["POST"])
def checkout_post():
    items = get_cart_items()
    if not items: return redirect(url_for("cart"))
    name    = request.form.get("name","").strip()
    email   = request.form.get("email","").strip()
    address = request.form.get("address","").strip()
    city    = request.form.get("city","").strip()
    country = request.form.get("country","").strip()
    if not all([name, email, address, city, country]):
        flash("Please fill in all required fields.", "error")
        return redirect(url_for("checkout"))
    order_id = str(uuid.uuid4())[:8].upper()
    sub = get_cart_subtotal(); shp = get_shipping(sub)
    coupon_data = _get_coupon_session()
    discount = coupon_data["discount"] if coupon_data else 0
    total = max(round(sub + shp - discount, 2), 0)
    order = Order(
        order_id=order_id, name=name, email=email,
        phone=request.form.get("phone",""),
        address=address, city=city, country=country,
        postal=request.form.get("postal",""),
        subtotal=sub, shipping=shp, discount=discount,
        coupon_code=coupon_data["code"] if coupon_data else "",
        total=total,
        gift_note=request.form.get("gift_note",""), status="confirmed",
    )
    db.session.add(order)
    db.session.flush()
    for item in items:
        db.session.add(OrderItem(
            order_db_id=order.id,
            product_slug=item["slug"], product_name=item["product"]["name"],
            product_cover=item["product"]["cover"],
            size=item["size"], quantity=item["quantity"],
            price=item["product"]["price"], line_total=item["line_total"],
        ))
    # Increment coupon used count
    if coupon_data:
        cpn = Coupon.query.filter_by(code=coupon_data["code"]).first()
        if cpn:
            cpn.used_count += 1
    # Subscribe email if not already
    if email and not Subscriber.query.filter_by(email=email.lower()).first():
        db.session.add(Subscriber(email=email.lower(), source="checkout"))
    db.session.commit()
    _save_cart([])
    session.pop("coupon", None)
    session["last_order_id"] = order.id
    return redirect(url_for("order_success"))


@app.route("/order-success")
def order_success():
    order_db_id = session.pop("last_order_id", None)
    if not order_db_id: return redirect(url_for("index"))
    order = db.session.get(Order, order_db_id)
    if not order: return redirect(url_for("index"))
    order_data = {
        "order_id": order.order_id,
        "name": order.name, "email": order.email,
        "address": order.address, "city": order.city, "country": order.country,
        "subtotal": order.subtotal, "shipping": order.shipping, "total": order.total,
        "date": order.created_at.strftime("%B %d, %Y"),
        "estimated_delivery": (order.created_at + timedelta(days=5)).strftime("%B %d, %Y"),
        "items": [{"slug":i.product_slug,"size":i.size,"quantity":i.quantity,
                   "line_total":i.line_total,
                   "product":{"name":i.product_name,"cover":i.product_cover}} for i in order.items],
    }
    return render_template("order_success.html", order=order_data)


# ── Newsletter ────────────────────────────────────────────────────

@app.route("/newsletter", methods=["POST"])
def newsletter():
    data  = request.get_json(silent=True) or request.form
    email = (data.get("email") or "").strip().lower()
    if not email or "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"success":False,"error":"Please enter a valid email"}), 400
    if Subscriber.query.filter_by(email=email).first():
        return jsonify({"success":True,"message":"You're already in the forest. ✦"})
    db.session.add(Subscriber(email=email, source="newsletter"))
    db.session.commit()
    return jsonify({"success":True,"message":"Welcome to the forest. ✦"})


# ── Coupons ───────────────────────────────────────────────────────

@app.route("/coupon/apply", methods=["POST"])
def coupon_apply():
    data = request.get_json(silent=True) or request.form
    code = (data.get("code") or "").strip().upper()
    if not code:
        return jsonify({"success": False, "error": "Please enter a coupon code"}), 400
    coupon = Coupon.query.filter_by(code=code, active=True).first()
    if not coupon:
        return jsonify({"success": False, "error": "Invalid or inactive coupon code"}), 400
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return jsonify({"success": False, "error": "This coupon has expired"}), 400
    if coupon.max_uses > 0 and coupon.used_count >= coupon.max_uses:
        return jsonify({"success": False, "error": "This coupon has reached its usage limit"}), 400
    sub = get_cart_subtotal()
    if sub == 0:
        return jsonify({"success": False, "error": "Your cart is empty"}), 400
    discount = calculate_coupon_discount(coupon, sub)
    session["coupon"] = {"code": code, "discount": discount,
                         "type": coupon.discount_type, "value": coupon.discount_value}
    session.modified = True
    msg = (f"{int(coupon.discount_value)}% discount applied!"
           if coupon.discount_type == "percent"
           else f"${coupon.discount_value:.0f} discount applied!")
    shp = get_shipping(sub)
    total = max(round(sub + shp - discount, 2), 0)
    return jsonify({"success": True, "message": msg, "discount": discount,
                    "code": code, "total": total})


@app.route("/coupon/remove", methods=["POST"])
def coupon_remove():
    session.pop("coupon", None)
    session.modified = True
    sub = get_cart_subtotal(); shp = get_shipping(sub)
    return jsonify({"success": True, "total": round(sub + shp, 2)})


# ══════════════════════════════════════════════════════════════════
#  ADMIN — AUTH
# ══════════════════════════════════════════════════════════════════

@app.route("/admin/login", methods=["GET","POST"])
def admin_login():
    if session.get("admin_logged_in"):
        return redirect(url_for("admin_dashboard"))
    if request.method == "POST":
        u = request.form.get("username","").strip()
        p = request.form.get("password","").strip()
        if u == ADMIN_USERNAME and p == ADMIN_PASSWORD:
            session["admin_logged_in"] = True
            session.permanent = True
            next_url = request.args.get("next") or url_for("admin_dashboard")
            return redirect(next_url)
        flash("Invalid username or password.", "error")
    return render_template("admin/login.html")


@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_logged_in", None)
    return redirect(url_for("admin_login"))


# ── Admin helpers ─────────────────────────────────────────────────

def _admin_stats():
    total_orders   = Order.query.count()
    total_revenue  = db.session.query(db.func.sum(Order.total)).scalar() or 0
    total_products = Product.query.count()
    total_subs     = Subscriber.query.count()
    # Month-over-month
    now  = datetime.utcnow()
    m1s  = now.replace(day=1)
    prev = (m1s - timedelta(days=1)).replace(day=1)
    rev_this  = db.session.query(db.func.sum(Order.total)).filter(Order.created_at >= m1s).scalar() or 0
    rev_prev  = db.session.query(db.func.sum(Order.total)).filter(Order.created_at >= prev, Order.created_at < m1s).scalar() or 0
    ord_this  = Order.query.filter(Order.created_at >= m1s).count()
    ord_prev  = Order.query.filter(Order.created_at >= prev, Order.created_at < m1s).count()
    return {
        "total_orders": total_orders, "total_revenue": round(total_revenue, 2),
        "total_products": total_products, "total_subs": total_subs,
        "rev_this": round(rev_this, 2), "rev_prev": round(rev_prev, 2),
        "ord_this": ord_this, "ord_prev": ord_prev,
    }


def _revenue_chart():
    """Returns last 7 days of revenue data."""
    now = datetime.utcnow()
    labels, values = [], []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0)
        nxt = day + timedelta(days=1)
        rev = db.session.query(db.func.sum(Order.total)).filter(
            Order.created_at >= day, Order.created_at < nxt).scalar() or 0
        labels.append(day.strftime("%a"))
        values.append(round(rev, 2))
    return {"labels": labels, "values": values}


# ── Admin Dashboard ───────────────────────────────────────────────

@app.route("/admin")
@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    raw_stats = _admin_stats()
    stats = {
        "revenue":     raw_stats["total_revenue"],
        "orders":      raw_stats["total_orders"],
        "products":    raw_stats["total_products"],
        "subscribers": raw_stats["total_subs"],
    }
    chart_data    = _revenue_chart()
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(8).all()
    out_of_stock  = Product.query.filter_by(in_stock=False).all()
    status_counts = {}
    for o in Order.query.all():
        status_counts[o.status] = status_counts.get(o.status, 0) + 1
    return render_template("admin/dashboard.html",
        stats=stats, chart_data=chart_data,
        recent_orders=recent_orders, out_of_stock=out_of_stock,
        status_counts=status_counts, active_nav="dashboard")


# ── Admin Products ────────────────────────────────────────────────

@app.route("/admin/products")
@admin_required
def admin_products():
    q     = request.args.get("q","").strip()
    cat   = request.args.get("cat","")
    stock = request.args.get("stock","")
    page  = request.args.get("page", 1, type=int)
    qry   = Product.query
    if q:            qry = qry.filter(db.or_(Product.name.ilike(f"%{q}%"), Product.collection.ilike(f"%{q}%")))
    if cat:          qry = qry.filter_by(category=cat)
    if stock == "in":  qry = qry.filter_by(in_stock=True)
    if stock == "out": qry = qry.filter_by(in_stock=False)
    total      = qry.count()
    per        = 12
    prods      = qry.order_by(Product.created_at.desc()).offset((page-1)*per).limit(per).all()
    pagination = Pagination(page, per, total)
    return render_template("admin/products.html",
        products=prods, pagination=pagination,
        q=q, cat=cat, stock=stock,
        categories=CATEGORIES, active_nav="products")


@app.route("/admin/products/new", methods=["GET","POST"])
@admin_required
def admin_product_new():
    if request.method == "POST":
        return _save_product(None)
    return render_template("admin/product_form.html", product=None,
                           action="new", active_nav="product-new")


@app.route("/admin/products/<int:pid>/edit", methods=["GET","POST"])
@admin_required
def admin_product_edit(pid):
    product = db.session.get(Product, pid) or abort(404)
    if request.method == "POST":
        return _save_product(product)
    return render_template("admin/product_form.html", product=product,
                           action="edit", active_nav="products")


def _save_product(product):
    """Shared logic for create / update product."""
    f    = request.form
    name = f.get("name","").strip()
    if not name:
        flash("Product name is required.", "error")
        return redirect(request.referrer)

    # Auto-generate slug from name
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    # If editing keep the existing slug so URLs don't break
    if product and product.slug:
        slug = product.slug

    # Sizes from checkboxes (template sends size_XS, size_S, …)
    size_labels = ["XS","S","M","L","XL","XXL"]
    sizes = [{"label": s, "available": bool(f.get(f"size_{s}"))} for s in size_labels]

    # Eco credentials (template uses 0-based index: eco_icon_0 … eco_icon_2)
    eco = []
    for i in range(3):
        icon  = f.get(f"eco_icon_{i}","").strip()
        title = f.get(f"eco_title_{i}","").strip()
        if title:
            eco.append({"icon": icon or "🌿", "title": title})

    # Details accordion — template sends field name verbatim e.g. "detail_Materials & Care"
    detail_keys = ["Materials & Care","Fit & Sizing","Sustainability","Delivery & Returns"]
    details = {}
    for key in detail_keys:
        raw = f.get(f"detail_{key}","").strip()
        if raw:
            details[key] = [l.strip() for l in raw.splitlines() if l.strip()]

    # Gallery images from indexed URL fields (img_src_0 … img_src_3)
    gallery = []
    for i in range(4):
        src   = f.get(f"img_src_{i}","").strip()
        label = f.get(f"img_label_{i}","Image").strip() or "Image"
        if src:
            gallery.append({"src": src, "thumb": src, "label": label})

    # Cover: file upload takes priority, then URL field, then keep existing
    cover = product.cover if product else ""
    cover_url = f.get("cover_url","").strip()
    if cover_url:
        cover = cover_url
    cover_file = request.files.get("cover_file")
    if cover_file and cover_file.filename:
        uploaded = save_upload(cover_file)
        if uploaded:
            cover = uploaded
    # Fall back to first gallery image if no cover set yet
    if not cover and gallery:
        cover = gallery[0]["src"]
    # If there are no gallery images but there is a cover, use cover as first gallery image
    if not gallery and cover:
        gallery = [{"src": cover, "thumb": cover, "label": "Cover"}]

    price_val = float(f.get("price", 0) or 0)
    orig_val  = float(f.get("original_price", 0) or 0) or price_val
    disc_val  = max(0, round((orig_val - price_val) / orig_val * 100) if orig_val > price_val else 0)

    # in_stock checkbox: template sends hidden=0 + checkbox=1; check if "1" is present
    in_stock = "1" in f.getlist("in_stock")

    if product is None:
        product = Product()
        db.session.add(product)

    product.slug           = slug
    product.name           = name
    product.subtitle       = f.get("subtitle","").strip()
    product.collection     = f.get("collection","").strip()
    product.category       = f.get("category","tops")
    product.price          = price_val
    product.original_price = orig_val
    product.discount       = disc_val
    product.currency       = "$"
    product.rating         = float(f.get("rating", 5.0) or 5.0)
    product.reviews        = int(f.get("reviews", 0) or 0)
    product.badge          = f.get("badge","").strip()
    product.in_stock       = in_stock
    product.description    = f.get("description","").strip()
    product.cover          = cover
    product.sizes_json     = json.dumps(sizes)
    product.images_json    = json.dumps(gallery)
    product.eco_json       = json.dumps(eco)
    product.details_json   = json.dumps(details)
    product.updated_at     = datetime.utcnow()

    db.session.commit()
    flash(f"Product '{product.name}' saved successfully.", "success")
    return redirect(url_for("admin_products"))


@app.route("/admin/products/<int:pid>/delete", methods=["POST"])
@admin_required
def admin_product_delete(pid):
    product = db.session.get(Product, pid) or abort(404)
    name = product.name
    db.session.delete(product)
    db.session.commit()
    flash(f"'{name}' deleted.", "success")
    return redirect(url_for("admin_products"))


@app.route("/admin/products/<int:pid>/toggle-stock", methods=["POST"])
@admin_required
def admin_toggle_stock(pid):
    product = db.session.get(Product, pid) or abort(404)
    product.in_stock = not product.in_stock
    db.session.commit()
    return redirect(url_for("admin_products"))


# ── Admin Orders ──────────────────────────────────────────────────

@app.route("/admin/orders")
@admin_required
def admin_orders():
    q             = request.args.get("q","").strip()
    status_filter = request.args.get("status","")
    page          = request.args.get("page", 1, type=int)
    qry           = Order.query
    if q:             qry = qry.filter(db.or_(Order.name.ilike(f"%{q}%"), Order.email.ilike(f"%{q}%"), Order.order_id.ilike(f"%{q}%")))
    if status_filter: qry = qry.filter_by(status=status_filter)
    total      = qry.count()
    per        = 15
    orders     = qry.order_by(Order.created_at.desc()).offset((page-1)*per).limit(per).all()
    pagination = Pagination(page, per, total)
    return render_template("admin/orders.html",
        orders=orders, pagination=pagination,
        q=q, status_filter=status_filter, active_nav="orders")


@app.route("/admin/orders/<int:oid>")
@admin_required
def admin_order_detail(oid):
    order = db.session.get(Order, oid) or abort(404)
    return render_template("admin/order_detail.html", order=order, active_nav="orders")


@app.route("/admin/orders/<int:oid>/status", methods=["POST"])
@admin_required
def admin_order_status(oid):
    order  = db.session.get(Order, oid) or abort(404)
    status = request.form.get("status","").strip()
    valid  = ["confirmed","processing","shipped","delivered","cancelled"]
    if status in valid:
        order.status = status
        db.session.commit()
        flash(f"Order #{order.order_id} status updated to '{status}'.", "success")
    return redirect(url_for("admin_order_detail", oid=oid))


@app.route("/admin/orders/<int:oid>/delete", methods=["POST"])
@admin_required
def admin_order_delete(oid):
    order = db.session.get(Order, oid) or abort(404)
    db.session.delete(order); db.session.commit()
    flash("Order deleted.", "success")
    return redirect(url_for("admin_orders"))


# ── Admin Subscribers ─────────────────────────────────────────────

@app.route("/admin/subscribers")
@admin_required
def admin_subscribers():
    q      = request.args.get("q","").strip()
    source = request.args.get("source","")
    page   = request.args.get("page", 1, type=int)
    qry    = Subscriber.query
    if q:      qry = qry.filter(Subscriber.email.ilike(f"%{q}%"))
    if source: qry = qry.filter_by(source=source)
    total      = qry.count()
    per        = 20
    subs       = qry.order_by(Subscriber.created_at.desc()).offset((page-1)*per).limit(per).all()
    pagination = Pagination(page, per, total)
    # Source breakdown counts
    source_counts = {}
    for row in db.session.query(Subscriber.source, db.func.count(Subscriber.id))\
                          .group_by(Subscriber.source).all():
        source_counts[row[0]] = row[1]
    return render_template("admin/subscribers.html",
        subscribers=subs, pagination=pagination,
        q=q, source=source, source_counts=source_counts,
        active_nav="subscribers")


@app.route("/admin/subscribers/<int:sid>/delete", methods=["POST"])
@admin_required
def admin_subscriber_delete(sid):
    sub = db.session.get(Subscriber, sid) or abort(404)
    db.session.delete(sub); db.session.commit()
    flash("Subscriber removed.", "success")
    return redirect(url_for("admin_subscribers"))


# ── Admin CSV Exports ─────────────────────────────────────────────

@app.route("/admin/orders/export")
@admin_required
def admin_orders_export():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    si = StringIO()
    w = csv.writer(si)
    w.writerow(["Order ID","Name","Email","Phone","Address","City","Country","Postal",
                "Subtotal","Shipping","Discount","Coupon","Total","Status","Date"])
    for o in orders:
        w.writerow([o.order_id, o.name, o.email, o.phone or "", o.address, o.city,
                    o.country, o.postal or "", o.subtotal, o.shipping,
                    o.discount or 0, o.coupon_code or "", o.total, o.status,
                    o.created_at.strftime("%Y-%m-%d %H:%M")])
    return Response(si.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment;filename=foresta_orders.csv"})


@app.route("/admin/subscribers/export")
@admin_required
def admin_subscribers_export():
    subs = Subscriber.query.order_by(Subscriber.created_at.desc()).all()
    si = StringIO()
    w = csv.writer(si)
    w.writerow(["Email","Source","Date"])
    for s in subs:
        w.writerow([s.email, s.source, s.created_at.strftime("%Y-%m-%d %H:%M")])
    return Response(si.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment;filename=foresta_subscribers.csv"})


# ── Admin Coupons ─────────────────────────────────────────────────

@app.route("/admin/coupons")
@admin_required
def admin_coupons():
    coupons = Coupon.query.order_by(Coupon.created_at.desc()).all()
    return render_template("admin/coupons.html", coupons=coupons, active_nav="coupons")


@app.route("/admin/coupons/new", methods=["GET", "POST"])
@admin_required
def admin_coupon_new():
    if request.method == "POST":
        code = request.form.get("code","").strip().upper()
        if not code:
            flash("Coupon code is required.", "error")
            return redirect(request.referrer)
        if Coupon.query.filter_by(code=code).first():
            flash(f"Coupon '{code}' already exists.", "error")
            return redirect(request.referrer)
        expires_str = request.form.get("expires_at","").strip()
        expires = None
        if expires_str:
            try:
                expires = datetime.strptime(expires_str, "%Y-%m-%d")
            except ValueError:
                pass
        coupon = Coupon(
            code=code,
            discount_type=request.form.get("discount_type","percent"),
            discount_value=float(request.form.get("discount_value", 10) or 10),
            max_uses=int(request.form.get("max_uses", 0) or 0),
            active=True,
            expires_at=expires,
        )
        db.session.add(coupon)
        db.session.commit()
        flash(f"Coupon '{code}' created.", "success")
        return redirect(url_for("admin_coupons"))
    return render_template("admin/coupon_form.html", active_nav="coupons")


@app.route("/admin/coupons/<int:cid>/toggle", methods=["POST"])
@admin_required
def admin_coupon_toggle(cid):
    coupon = db.session.get(Coupon, cid) or abort(404)
    coupon.active = not coupon.active
    db.session.commit()
    flash(f"Coupon '{coupon.code}' {'activated' if coupon.active else 'deactivated'}.", "success")
    return redirect(url_for("admin_coupons"))


@app.route("/admin/coupons/<int:cid>/delete", methods=["POST"])
@admin_required
def admin_coupon_delete(cid):
    coupon = db.session.get(Coupon, cid) or abort(404)
    db.session.delete(coupon); db.session.commit()
    flash("Coupon deleted.", "success")
    return redirect(url_for("admin_coupons"))


# ── API ───────────────────────────────────────────────────────────

@app.route("/api/products")
def api_products():
    return jsonify([p.to_dict() for p in Product.query.all()])

@app.route("/api/product/<slug>")
def api_product(slug):
    p = Product.query.filter_by(slug=slug).first()
    if not p: return jsonify({"error":"Not found"}), 404
    return jsonify(p.to_dict())

@app.route("/api/cart")
def api_cart():
    items = get_cart_items(); sub = get_cart_subtotal(); shp = get_shipping(sub)
    return jsonify({"items":[{"slug":i["slug"],"size":i["size"],"quantity":i["quantity"],
                               "name":i["product"]["name"],"price":i["product"]["price"],
                               "cover":i["product"]["cover"],"line_total":i["line_total"]}
                              for i in items],
                    "count":get_cart_count(),"subtotal":sub,"shipping":shp,"total":round(sub+shp,2)})


# ── SEO ──────────────────────────────────────────────────────────

@app.route("/robots.txt")
def robots_txt():
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin/\n"
        "Disallow: /cart\n"
        "Disallow: /checkout\n"
        "Disallow: /order-success\n\n"
        "Sitemap: https://foresta.store/sitemap.xml\n"
    )
    return Response(content, mimetype="text/plain")


@app.route("/sitemap.xml")
def sitemap_xml():
    products = Product.query.all()
    base = request.host_url.rstrip("/")
    urls = [
        {"loc": "/",          "priority": "1.0", "changefreq": "weekly"},
        {"loc": "/products",  "priority": "0.9", "changefreq": "daily"},
    ]
    for p in products:
        urls.append({"loc": f"/product/{p.slug}", "priority": "0.8", "changefreq": "weekly"})
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        xml_parts.append(
            f'  <url><loc>{base}{u["loc"]}</loc>'
            f'<changefreq>{u["changefreq"]}</changefreq>'
            f'<priority>{u["priority"]}</priority></url>'
        )
    xml_parts.append("</urlset>")
    return Response("\n".join(xml_parts), mimetype="application/xml")


# ── Error handlers ────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error":"File too large (max 16MB)"}), 413


# ══════════════════════════════════════════════════════════════════
# Initialize DB on every startup (works with gunicorn too)
with app.app_context():
    init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
