"""
Lucky Meesho Clone - Secure Python Backend
Designed for deployment on Render.com with Supabase DB integration.

To run locally:
1. Install dependencies:
   pip install fastapi uvicorn supabase python-dotenv pydantic
2. Run server:
   python server.py
"""

import os
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Lucky Meesho Clone Backend",
    description="Secure intermediate API protecting Supabase and validating requests",
    version="1.0.0"
)

# Configure CORS so your frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# SECURE CONFIGURATION
# -------------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "lucky-secret-admin-pass-123")

supabase: Optional[Client] = None
use_supabase = False

if SUPABASE_URL and SUPABASE_ANON_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("✅ Python Supabase client initialized.")
        use_supabase = True
    except Exception as e:
        print(f"❌ Failed to initialize Supabase: {e}")
else:
    print("⚠️ Supabase credentials missing. Operating in Local Memory Fallback Mode.")

# -------------------------------------------------------------
# PYDANTIC MODEL SCHEMAS (Request Validation / Type Safety)
# -------------------------------------------------------------
class ProductHighlight(BaseModel):
    label: str
    value: str

class AdditionalDetail(BaseModel):
    label: str
    value: str

class VariantSwatch(BaseModel):
    colorName: str
    imageUrl: str
    price: float
    originalPrice: float

class Review(BaseModel):
    id: str
    userName: str
    userAvatar: Optional[str] = None
    rating: float
    title: str
    comment: str
    postedDate: str
    images: List[str] = []
    helpfulCount: int

class Product(BaseModel):
    id: str
    title: str
    description: str
    category: str
    subCategory: str
    price: float
    originalPrice: float
    discountPercent: float
    isAd: Optional[bool] = False
    codPrice: float
    hasUpiOffer: Optional[bool] = False
    rating: float
    ratingCount: int
    reviewCount: int
    images: List[str]
    variants: List[VariantSwatch]
    soldBy: str
    soldByRating: float
    productHighlights: List[ProductHighlight] = []
    additionalDetails: List[AdditionalDetail] = []
    sizeOptions: List[str]
    tag: Optional[str] = None
    timeLeftText: Optional[str] = None
    reviews: List[Review] = []

class CartItemInput(BaseModel):
    product: Dict[str, Any] # Will verify catalog item by ID server-side
    selectedVariantIndex: int
    selectedSize: str
    quantity: int

class ShippingAddressInput(BaseModel):
    name: str
    phone: str
    addressLine: str
    city: str
    pincode: str
    state: str

class OrderInput(BaseModel):
    items: List[CartItemInput]
    appliedCouponCode: Optional[str] = None
    isUpiPayment: Optional[bool] = False
    shippingAddress: ShippingAddressInput

class Coupon(BaseModel):
    code: str
    discountType: str # "flat" | "percentage"
    value: float
    minPurchase: float
    description: str

class SubCategory(BaseModel):
    name: str
    image: str

class Category(BaseModel):
    id: str
    name: str
    icon: str
    subCategories: List[SubCategory]

class CategoryReorder(BaseModel):
    ids: List[str]

class OrderStatusUpdate(BaseModel):
    status: str

# -------------------------------------------------------------
# LOCAL MEMORY FALLBACK STORAGE (Seeded with initial states)
# -------------------------------------------------------------
local_products: List[Dict[str, Any]] = []
local_orders: List[Dict[str, Any]] = []
local_coupons: List[Dict[str, Any]] = [
    {
        "code": "LUCKY50",
        "discountType": "flat",
        "value": 50.0,
        "minPurchase": 299.0,
        "description": "Flat ₹50 OFF on orders above ₹299"
    },
    {
        "code": "MEESHO15",
        "discountType": "percentage",
        "value": 15.0,
        "minPurchase": 0.0,
        "description": "15% OFF on all items (No minimum order)"
    },
    {
        "code": "FESTIVE100",
        "discountType": "flat",
        "value": 100.0,
        "minPurchase": 499.0,
        "description": "Flat ₹100 OFF on orders above ₹499"
    },
    {
        "code": "WELCOME20",
        "discountType": "percentage",
        "value": 20.0,
        "minPurchase": 0.0,
        "description": "Flat 20% OFF on all products"
    }
]

local_categories: List[Dict[str, Any]] = [
    {
        "id": "cat-popular",
        "name": "Popular",
        "icon": "star",
        "subCategories": [
            {"name": "Top Brands", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop"},
            {"name": "Premium Collection", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop"}
        ]
    },
    {
        "id": "cat-kurti-saree",
        "name": "Kurti, Saree & Lehenga",
        "icon": "shirt",
        "subCategories": [
            {"name": "Kurtis & Dress", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop"},
            {"name": "Sarees", "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop"}
        ]
    },
    {
        "id": "cat-women-western",
        "name": "Women Western",
        "icon": "sparkles",
        "subCategories": [
            {"name": "Westernwear", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop"},
            {"name": "Dresses", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop"}
        ]
    },
    {
        "id": "cat-lingerie",
        "name": "Lingerie",
        "icon": "heart",
        "subCategories": [
            {"name": "Bras & Panties", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop"}
        ]
    },
    {
        "id": "cat-men",
        "name": "Men",
        "icon": "smile",
        "subCategories": [
            {"name": "Men Fashion", "image": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop"}
        ]
    },
    {
        "id": "cat-kids",
        "name": "Kids & Toys",
        "icon": "baby",
        "subCategories": [
            {"name": "Kids", "image": "https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=200&h=200&fit=crop"}
        ]
    },
    {
        "id": "cat-home",
        "name": "Home & Kitchen",
        "icon": "home",
        "subCategories": [
            {"name": "Cookware", "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&h=200&fit=crop"}
        ]
    }
]

# -------------------------------------------------------------
# DYNAMIC RATE LIMITER (Protects against DDoS / Burp scraping)
# -------------------------------------------------------------
ip_request_history: Dict[str, List[datetime]] = {}
LIMIT_WINDOW_SEC = 60
MAX_REQUESTS_PER_WINDOW = 100

def check_rate_limit(client_ip: str):
    now = datetime.now()
    history = ip_request_history.setdefault(client_ip, [])
    # Filter only requests within the limit window
    cutoff = now - timedelta(seconds=LIMIT_WINDOW_SEC)
    history = [t for t in history if t > cutoff]
    ip_request_history[client_ip] = history
    
    if len(history) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please slow down your requests."
        )
    history.append(now)

# -------------------------------------------------------------
# ADMIN VERIFICATION CHECK
# -------------------------------------------------------------
def verify_admin_header(x_admin_secret: Optional[str] = Header(None)):
    if not x_admin_secret or x_admin_secret != ADMIN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized Access. Invalid X-Admin-Secret header. Blocked request manipulation."
        )

# -------------------------------------------------------------
# CORE MIDDLEMAN CONTROLLERS (Secure & Parameterized)
# -------------------------------------------------------------

@app.middleware("http")
async def apply_rate_limiting_middleware(request: Request, call_next):
    # Basic Rate Limiting
    client_ip = request.client.host if request.client else "unknown"
    try:
        check_rate_limit(client_ip)
    except HTTPException as ex:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=ex.status_code, content={"error": ex.detail})
    
    response = await call_next(request)
    return response

# --- PRODUCTS ENDPOINTS ---

@app.get("/api/products")
async def get_products():
    if use_supabase and supabase:
        try:
            res = supabase.table("products").select("*").execute()
            if res.data is not None:
                return [row["data"] for row in res.data]
        except Exception as e:
            print(f"Supabase products read warning: {e}")
            
    return local_products

@app.post("/api/products", status_code=201)
async def create_product(product: Product, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    prod_dict = product.dict()
    
    if use_supabase and supabase:
        try:
            supabase.table("products").insert({"id": product.id, "data": prod_dict}).execute()
            return prod_dict
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Supabase Write Error: {e}")
            
    local_products.insert(0, prod_dict)
    return prod_dict

@app.put("/api/products")
async def update_product(product: Product, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    prod_dict = product.dict()
    
    if use_supabase and supabase:
        try:
            supabase.table("products").update({"data": prod_dict}).eq("id", product.id).execute()
            return prod_dict
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Supabase Update Error: {e}")
            
    for idx, item in enumerate(local_products):
        if item["id"] == product.id:
            local_products[idx] = prod_dict
            return prod_dict
    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    
    if use_supabase and supabase:
        try:
            supabase.table("products").delete().eq("id", product_id).execute()
            return {"success": True, "message": "Product deleted from Supabase"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    global local_products
    local_products = [p for p in local_products if p["id"] != product_id]
    return {"success": True, "message": "Product deleted"}


# --- COUPONS ENDPOINTS ---

@app.get("/api/coupons")
async def get_coupons():
    if use_supabase and supabase:
        try:
            res = supabase.table("coupons").select("*").execute()
            if res.data is not None:
                return [row["data"] for row in res.data]
        except Exception as e:
            print(f"Supabase coupons warning: {e}")
    return local_coupons

@app.post("/api/coupons", status_code=201)
async def create_coupon(coupon: Coupon, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    coup_dict = coupon.dict()
    
    if use_supabase and supabase:
        try:
            supabase.table("coupons").insert({"code": coupon.code, "data": coup_dict}).execute()
            return coup_dict
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    local_coupons.insert(0, coup_dict)
    return coup_dict

@app.delete("/api/coupons/{code}")
async def delete_coupon(code: str, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    
    if use_supabase and supabase:
        try:
            supabase.table("coupons").delete().eq("code", code).execute()
            return {"success": True, "message": "Coupon deleted"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    global local_coupons
    local_coupons = [c for c in local_coupons if c["code"] != code]
    return {"success": True, "message": "Coupon deleted"}


# --- CATEGORIES ENDPOINTS ---

@app.get("/api/categories")
async def get_categories():
    if use_supabase and supabase:
        try:
            res = supabase.table("categories").select("*").order("position").execute()
            if res.data is not None:
                return [row["data"] for row in res.data]
        except Exception as e:
            print(f"Supabase categories warning: {e}")
    return local_categories

@app.post("/api/categories", status_code=201)
async def create_category(category: Category, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    cat_dict = category.dict()
    
    if use_supabase and supabase:
        try:
            # Determine position
            count_res = supabase.table("categories").select("id").execute()
            position = len(count_res.data) if count_res.data else 0
            supabase.table("categories").insert({"id": category.id, "data": cat_dict, "position": position}).execute()
            local_categories.append(cat_dict)
            return cat_dict
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    local_categories.append(cat_dict)
    return cat_dict

@app.put("/api/categories/{id}")
async def update_category(id: str, category: Category, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    cat_dict = category.dict()
    
    if use_supabase and supabase:
        try:
            supabase.table("categories").update({"data": cat_dict}).eq("id", id).execute()
            
            global local_categories
            local_categories = [cat_dict if c["id"] == id else c for c in local_categories]
            return cat_dict
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    local_categories = [cat_dict if c["id"] == id else c for c in local_categories]
    return cat_dict

@app.delete("/api/categories/{id}")
async def delete_category(id: str, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    
    if use_supabase and supabase:
        try:
            supabase.table("categories").delete().eq("id", id).execute()
            
            global local_categories
            local_categories = [c for c in local_categories if c["id"] != id]
            return {"success": True, "message": "Category deleted successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    local_categories = [c for c in local_categories if c["id"] != id]
    return {"success": True, "message": "Category deleted"}

@app.post("/api/categories/reorder")
async def reorder_categories(reorder_data: CategoryReorder, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    ids = reorder_data.ids
    
    if use_supabase and supabase:
        try:
            for i, cid in enumerate(ids):
                supabase.table("categories").update({"position": i}).eq("id", cid).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    global local_categories
    ordered = []
    for cid in ids:
        found = next((c for c in local_categories if c["id"] == cid), None)
        if found:
            ordered.append(found)
    for c in local_categories:
        if c["id"] not in ids:
            ordered.append(c)
    local_categories = ordered
    
    return {"success": True, "message": "Categories reordered successfully"}


# --- ORDERS (WITH TOTAL SERVER-SIDE CALCULATION & VERIFICATION) ---

@app.get("/api/orders")
async def get_orders():
    if use_supabase and supabase:
        try:
            res = supabase.table("orders").select("*").execute()
            if res.data is not None:
                return [row["data"] for row in res.data]
        except Exception as e:
            print(f"Supabase orders warning: {e}")
    return local_orders

@app.post("/api/orders", status_code=201)
async def create_order(order_payload: OrderInput):
    """
    SERVER-SIDE MATHEMATICAL VALIDATION:
    1. Fetches official catalog from DB
    2. Re-computes absolute total price based only on db prices
    3. Nullifies any frontend manipulation or Burp Suite tampering tricks
    """
    try:
        # Load verified products
        catalog = []
        if use_supabase and supabase:
            res = supabase.table("products").select("*").execute()
            if res.data:
                catalog = [row["data"] for row in res.data]
        if not catalog:
            catalog = local_products

        verified_items_price = 0.0
        verified_items_list = []

        # Validate each item structure
        for item in order_payload.items:
            client_prod_id = item.product.get("id")
            db_product = next((p for p in catalog if p["id"] == client_prod_id), None)
            if not db_product:
                raise HTTPException(status_code=400, detail=f"Product with ID {client_prod_id} is invalid.")
            
            variant_index = item.selectedVariantIndex
            variants_list = db_product.get("variants", [])
            db_variant = variants_list[variant_index] if len(variants_list) > variant_index else variants_list[0]
            
            db_price = db_variant.get("price", 0.0)
            qty = max(1, item.quantity)
            
            verified_items_price += db_price * qty
            
            # Formulate secure item data
            verified_items_list.append({
                "id": f"{db_product['id']}-{variant_index}-{item.selectedSize}",
                "product": db_product,
                "selectedVariantIndex": variant_index,
                "selectedSize": item.selectedSize,
                "quantity": qty
            })

        # Check coupons validity server-side
        coupon_discount = 0.0
        if order_payload.appliedCouponCode:
            coupons_list = []
            if use_supabase and supabase:
                c_res = supabase.table("coupons").select("*").execute()
                if c_res.data:
                    coupons_list = [row["data"] for row in c_res.data]
            if not coupons_list:
                coupons_list = local_coupons

            code_clean = order_payload.appliedCouponCode.strip().upper()
            db_coupon = next((c for c in coupons_list if c["code"].upper() == code_clean), None)
            
            if db_coupon and verified_items_price >= db_coupon.get("minPurchase", 0):
                if db_coupon.get("discountType") == "flat":
                    coupon_discount = db_coupon.get("value", 0.0)
                else:
                    coupon_discount = round(verified_items_price * (db_coupon.get("value", 0.0) / 100.0))

        # Check UPI offer
        upi_discount = 0.0
        has_upi_item = any(item["product"].get("hasUpiOffer") for item in verified_items_list)
        if order_payload.isUpiPayment and has_upi_item:
            upi_discount = 15.0

        # Calculate final secure price (cannot go below 1.0 rupee)
        verified_total_price = max(1.0, verified_items_price - coupon_discount - upi_discount)

        # Build secure final Order object
        order_id = f"order-{random.randint(100000, 999999)}"
        order_date_str = datetime.now().strftime("%d %b, %Y")
        delivery_date_str = (datetime.now() + timedelta(days=7)).strftime("%d %b, %Y")
        
        secure_order = {
            "id": order_id,
            "items": verified_items_list,
            "orderDate": order_date_str,
            "deliveryDate": delivery_date_str,
            "status": "Ordered",
            "totalPrice": verified_total_price,
            "shippingAddress": {
                "name": order_payload.shippingAddress.name[:50],
                "phone": order_payload.shippingAddress.phone[:15],
                "addressLine": order_payload.shippingAddress.addressLine[:120],
                "city": order_payload.shippingAddress.city[:40],
                "pincode": order_payload.shippingAddress.pincode[:10],
                "state": order_payload.shippingAddress.state[:40]
            }
        }

        # Save Order
        if use_supabase and supabase:
            supabase.table("orders").insert({"id": secure_order["id"], "data": secure_order}).execute()
            return secure_order
            
        local_orders.insert(0, secure_order)
        return secure_order

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order validation error: {str(e)}")

@app.put("/api/orders/{order_id}")
async def update_order_status(order_id: str, status_payload: OrderStatusUpdate, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    
    if use_supabase and supabase:
        try:
            res = supabase.table("orders").select("*").eq("id", order_id).single().execute()
            if res.data:
                order_data = res.data["data"]
                order_data["status"] = status_payload.status
                supabase.table("orders").update({"data": order_data}).eq("id", order_id).execute()
                return order_data
            raise HTTPException(status_code=404, detail="Order not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    for item in local_orders:
        if item["id"] == order_id:
            item["status"] = status_payload.status
            return item
    raise HTTPException(status_code=404, detail="Order not found")

@app.delete("/api/orders/{order_id}")
async def delete_order(order_id: str, x_admin_secret: Optional[str] = Header(None)):
    verify_admin_header(x_admin_secret)
    
    if use_supabase and supabase:
        try:
            supabase.table("orders").delete().eq("id", order_id).execute()
            return {"success": True, "message": "Order deleted from Supabase"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    global local_orders
    local_orders = [o for o in local_orders if o["id"] != order_id]
    return {"success": True, "message": "Order deleted"}

# --- SERVER RUNNER ---
if __name__ == "__main__":
    import uvicorn
    # Listen on port 3000 to match container standard or process.env.PORT
    port = int(os.environ.get("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
