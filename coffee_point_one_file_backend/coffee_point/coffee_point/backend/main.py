"""uvicorn main:app --reload"""
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(title="Coffee Point API")
FRONTEND = Path(__file__).parent.parent / "frontend"

# Пока храним данные в памяти, чтобы backend был понятным новичку.
# После перезапуска сервера корзины и заказы сбросятся.
menu = [
    {"id": "espresso", "category": "coffee", "price": 150, "kcal": 5, "size": {"value": 30, "unit": "ml"}, "image": "", "featured": True, "name": {"ru": "Эспрессо", "en": "Espresso"}, "description": {"ru": "Крепкий классический кофе", "en": "Classic strong coffee"}, "ingredients": {"ru": "Кофе", "en": "Coffee"}},
    {"id": "americano", "category": "coffee", "price": 180, "kcal": 10, "size": {"value": 200, "unit": "ml"}, "image": "", "featured": False, "name": {"ru": "Американо", "en": "Americano"}, "description": {"ru": "Эспрессо с горячей водой", "en": "Espresso with hot water"}, "ingredients": {"ru": "Кофе, вода", "en": "Coffee, water"}},
    {"id": "cappuccino", "category": "coffee", "price": 250, "kcal": 120, "size": {"value": 250, "unit": "ml"}, "image": "", "featured": True, "name": {"ru": "Капучино", "en": "Cappuccino"}, "description": {"ru": "Кофе с молочной пеной", "en": "Coffee with milk foam"}, "ingredients": {"ru": "Кофе, молоко", "en": "Coffee, milk"}},
    {"id": "latte", "category": "coffee", "price": 280, "kcal": 150, "size": {"value": 300, "unit": "ml"}, "image": "", "featured": False, "name": {"ru": "Латте", "en": "Latte"}, "description": {"ru": "Мягкий кофе с молоком", "en": "Smooth coffee with milk"}, "ingredients": {"ru": "Кофе, молоко", "en": "Coffee, milk"}},
    {"id": "mocha", "category": "coffee", "price": 290, "kcal": 210, "size": {"value": 300, "unit": "ml"}, "image": "", "featured": False, "name": {"ru": "Мокка", "en": "Mocha"}, "description": {"ru": "Кофе с шоколадом и молоком", "en": "Coffee with chocolate and milk"}, "ingredients": {"ru": "Кофе, молоко, шоколад", "en": "Coffee, milk, chocolate"}},
    {"id": "raf", "category": "coffee", "price": 280, "kcal": 230, "size": {"value": 250, "unit": "ml"}, "image": "", "featured": False, "name": {"ru": "Раф-кофе", "en": "Raf coffee"}, "description": {"ru": "Кофе со сливками и ванилью", "en": "Coffee with cream and vanilla"}, "ingredients": {"ru": "Кофе, сливки, ваниль", "en": "Coffee, cream, vanilla"}},
    {"id": "iced-latte", "category": "coffee", "price": 270, "kcal": 140, "size": {"value": 300, "unit": "ml"}, "image": "", "featured": False, "name": {"ru": "Айс-латте", "en": "Iced latte"}, "description": {"ru": "Холодный кофе с молоком", "en": "Cold coffee with milk"}, "ingredients": {"ru": "Кофе, молоко, лёд", "en": "Coffee, milk, ice"}},
    {"id": "caramel-latte", "category": "coffee", "price": 300, "kcal": 220, "size": {"value": 300, "unit": "ml"}, "image": "", "featured": False, "name": {"ru": "Карамельный латте", "en": "Caramel latte"}, "description": {"ru": "Латте с карамельным сиропом", "en": "Latte with caramel syrup"}, "ingredients": {"ru": "Кофе, молоко, карамель", "en": "Coffee, milk, caramel"}},
    {"id": "tea", "category": "tea", "price": 150, "kcal": 0, "size": {"value": 300, "unit": "ml"}, "image": "", "featured": False, "name": {"ru": "Чай", "en": "Tea"}, "description": {"ru": "Чёрный или зелёный чай", "en": "Black or green tea"}, "ingredients": {"ru": "Чай, вода", "en": "Tea, water"}},
    {"id": "croissant", "category": "bakery", "price": 170, "kcal": 260, "size": {"value": 1, "unit": "pc"}, "image": "", "featured": False, "name": {"ru": "Круассан", "en": "Croissant"}, "description": {"ru": "Слоёная выпечка", "en": "Flaky pastry"}, "ingredients": {"ru": "Тесто, масло", "en": "Dough, butter"}},
]
carts = {}       # session_id -> {item_id: quantity}
sessions = {}    # session_id -> language
orders = {}      # order_id -> order details

class CartItem(BaseModel):
    item_id: str
    qty: int = Field(default=1, ge=1, le=20)
class Quantity(BaseModel):
    qty: int = Field(ge=0, le=20)
class Language(BaseModel):
    lang: str
class OrderInfo(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=3, max_length=120)
class Payment(BaseModel):
    card: str
    expiry: str = ""
    cvc: str = ""

# Give each visitor a simple session cookie.
def get_session(request: Request, response: Response):
    session_id = request.cookies.get("coffee_session")
    if not session_id:
        session_id = str(uuid4())
        response.set_cookie("coffee_session", session_id, httponly=True, samesite="lax")
    carts.setdefault(session_id, {})
    sessions.setdefault(session_id, "ru")
    return session_id

def cart_data(session_id):
    lines, count, total = [], 0, 0
    for item_id, qty in carts.get(session_id, {}).items():
        item = next((p for p in menu if p["id"] == item_id), None)
        if item:
            line_sum = item["price"] * qty
            lines.append({"item_id": item_id, "qty": qty, "price": item["price"], "sum": line_sum})
            count += qty
            total += line_sum
    return {"items": lines, "count": count, "total": total}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/menu")
def get_menu(category: str | None = None, q: str | None = None):
    items = menu
    if category:
        items = [p for p in items if p["category"] == category]
    if q:
        q = q.lower()
        items = [p for p in items if q in p["name"]["ru"].lower() or q in p["name"]["en"].lower()]
    return {"items": items}

@app.get("/api/menu/{item_id}")
def get_menu_item(item_id: str):
    item = next((p for p in menu if p["id"] == item_id), None)
    if not item:
        raise HTTPException(404, "Товар не найден")
    return item

@app.get("/api/session")
def get_language(request: Request, response: Response):
    sid = get_session(request, response)
    return {"lang": sessions[sid]}

@app.put("/api/session")
def set_language(body: Language, request: Request, response: Response):
    sid = get_session(request, response)
    if body.lang not in ("ru", "en"):
        raise HTTPException(400, "Неизвестный язык")
    sessions[sid] = body.lang
    return {"lang": body.lang}

@app.get("/api/cart")
def get_cart(request: Request, response: Response):
    return cart_data(get_session(request, response))

@app.post("/api/cart/items")
def add_cart(body: CartItem, request: Request, response: Response):
    sid = get_session(request, response)
    if not any(p["id"] == body.item_id for p in menu):
        raise HTTPException(404, "Товар не найден")
    carts[sid][body.item_id] = carts[sid].get(body.item_id, 0) + body.qty
    return cart_data(sid)

@app.patch("/api/cart/items/{item_id}")
def change_qty(item_id: str, body: Quantity, request: Request, response: Response):
    sid = get_session(request, response)
    if not any(p["id"] == item_id for p in menu):
        raise HTTPException(404, "Товар не найден")
    if body.qty == 0:
        carts[sid].pop(item_id, None)
    else:
        carts[sid][item_id] = body.qty
    return cart_data(sid)

@app.delete("/api/cart/items/{item_id}")
def remove_item(item_id: str, request: Request, response: Response):
    sid = get_session(request, response)
    carts[sid].pop(item_id, None)
    return cart_data(sid)

@app.delete("/api/cart")
def clear_cart(request: Request, response: Response):
    sid = get_session(request, response)
    carts[sid] = {}
    return cart_data(sid)

@app.post("/api/orders", status_code=201)
def create_order(body: OrderInfo, request: Request, response: Response):
    sid = get_session(request, response)
    cart = cart_data(sid)
    if not cart["items"]:
        raise HTTPException(400, detail={"error": "empty_cart", "message": "Корзина пуста"})
    order_id = str(uuid4())[:8].upper()
    orders[order_id] = {"order_id": order_id, "name": body.name, "email": body.email, "items": cart["items"], "total": cart["total"], "status": "pending", "session_id": sid}
    carts[sid] = {}
    return orders[order_id]

@app.get("/api/orders/{order_id}")
def get_order(order_id: str, request: Request, response: Response):
    sid = get_session(request, response)
    order = orders.get(order_id)
    if not order or order["session_id"] != sid:
        raise HTTPException(404, "Заказ не найден")
    return order

@app.post("/api/orders/{order_id}/pay")
def pay_order(order_id: str, body: Payment, request: Request, response: Response):
    sid = get_session(request, response)
    order = orders.get(order_id)
    if not order or order["session_id"] != sid:
        raise HTTPException(404, "Заказ не найден")
    if order["status"] == "paid":
        raise HTTPException(409, "Заказ уже оплачен")
    # Демонстрация: деньги не списываются. Специальная тестовая карта отклоняется.
    digits = ''.join(ch for ch in body.card if ch.isdigit())
    if digits == "4000000000000002":
        raise HTTPException(402, detail={"error": "card_declined", "message": "Карта отклонена"})
    if len(digits) != 16 or len(''.join(ch for ch in body.cvc if ch.isdigit())) != 3:
        raise HTTPException(422, "Проверьте данные карты")
    order["status"] = "paid"
    return {"ok": True, "status": "paid", "order_id": order_id}

# Serve frontend files from the same server as the API.
if FRONTEND.exists():
    app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="frontend")
