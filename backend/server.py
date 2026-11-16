import asyncio
import os
import logging
from contextlib import suppress
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field
from pymongo import ASCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
from typing_extensions import Annotated

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v))]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    def to_mongo(self) -> dict:
        return self.model_dump(by_alias=True)

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)


class Product(BaseDocument):
    brand: str
    model: str
    category: str
    process: str
    main_image: str
    additional_images: List[str] = Field(default_factory=list)
    description: str = ""
    amperage: str = ""
    voltage: str = ""
    power_supply: str = ""
    duty_cycle: str = ""
    applications: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    price: Optional[str] = None
    availability: Optional[str] = None
    datasheet_url: Optional[str] = None
    sku: Optional[str] = None
    quote_url: Optional[str] = None
    is_example: bool = True
    featured: bool = True
    sort_order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProductCreate(BaseModel):
    brand: str
    model: str
    category: str
    process: str
    main_image: str
    additional_images: List[str] = Field(default_factory=list)
    description: str = ""
    amperage: str = ""
    voltage: str = ""
    power_supply: str = ""
    duty_cycle: str = ""
    applications: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    price: Optional[str] = None
    availability: Optional[str] = None
    datasheet_url: Optional[str] = None
    sku: Optional[str] = None
    quote_url: Optional[str] = None
    is_example: bool = True
    featured: bool = True
    sort_order: int = 0


INDEXES = {
    "products": [
        IndexModel([("sort_order", ASCENDING)], name="sort_order_asc"),
        IndexModel([("category", ASCENDING)], name="category_asc"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logger.error("ensure_indexes(%s): %s", collection, exc)


EXAMPLE_PRODUCTS = [
    Product(
        brand="ESAB",
        model="WARRIOR 500i",
        category="MMA",
        process="MMA / TIG",
        main_image="https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/f42f788aa23b25155a6e843d3b5d79bba0dc6721df8e4e93d9259061ac54e938.jpeg",
        description="Equipo profesional de ejemplo (dato conceptual del briefing). Registro preparado para ser reemplazado por el producto real desde la base de datos.",
        amperage="500 A",
        voltage="380 V",
        power_supply="TRIFÁSICA 380 V",
        duty_cycle="",
        applications=["INDUSTRIAL"],
        features=["Registro de ejemplo — carga aquí las características reales"],
        price=None,
        availability="POR CONFIRMAR",
        sku="EJEMPLO-500I",
        sort_order=0,
    ),
    Product(
        brand="EJEMPLO",
        model="INVERTER MIG 250",
        category="MIG / MAG",
        process="MIG / MAG",
        main_image="https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/9d58211ac3517cb43e551f11609bedce3aaeabb5483e6fc6b6bad4eacbe2442b.jpeg",
        description="Producto de ejemplo para demostrar la estructura del catálogo. Reemplaza marca, modelo, especificaciones e imágenes desde la base de datos.",
        amperage="250 A",
        voltage="220 V",
        power_supply="MONOFÁSICA 220 V",
        duty_cycle="",
        applications=["TALLER", "FABRICACIÓN"],
        features=["Registro de ejemplo — carga aquí las características reales"],
        price=None,
        availability="POR CONFIRMAR",
        sku="EJEMPLO-MIG250",
        sort_order=1,
    ),
    Product(
        brand="EJEMPLO",
        model="TIG AC/DC 200",
        category="TIG",
        process="TIG",
        main_image="https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/71b9e7b9a5586122d8b27f6800ef79bbeba6bd11ee91d599f33d0f0946731756.jpeg",
        description="Producto de ejemplo para el proceso TIG. La ficha real se carga desde la colección de productos en la base de datos.",
        amperage="200 A",
        voltage="220 V",
        power_supply="MONOFÁSICA 220 V",
        duty_cycle="",
        applications=["INOX", "ALUMINIO"],
        features=["Registro de ejemplo — carga aquí las características reales"],
        price=None,
        availability="POR CONFIRMAR",
        sku="EJEMPLO-TIG200",
        sort_order=2,
    ),
    Product(
        brand="EJEMPLO",
        model="CORTE PLASMA 60",
        category="CORTE PLASMA",
        process="PLASMA",
        main_image="https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/35ff09b017256acde509405867c323a6154292ce431c889f7f0481c6c0be1f8d.jpeg",
        description="Producto de ejemplo para equipos de corte plasma. Sustitúyelo por el equipo real desde la base de datos.",
        amperage="60 A",
        voltage="220 V",
        power_supply="MONOFÁSICA 220 V",
        duty_cycle="",
        applications=["CORTE DE CHAPA"],
        features=["Registro de ejemplo — carga aquí las características reales"],
        price=None,
        availability="POR CONFIRMAR",
        sku="EJEMPLO-PLASMA60",
        sort_order=3,
    ),
]


async def seed_products() -> None:
    try:
        if await db.products.count_documents({}) == 0:
            await db.products.insert_many([p.to_mongo() for p in EXAMPLE_PRODUCTS])
            logger.info("Seeded %s example products", len(EXAMPLE_PRODUCTS))
    except Exception as exc:
        logger.error("seed_products: %s", exc)


app = FastAPI()
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "MAQSYMA API"}


@api_router.get("/products", response_model=List[Product], response_model_by_alias=False)
async def list_products(category: Optional[str] = Query(None)):
    query = {"category": category} if category else {}
    docs = await db.products.find(query).sort("sort_order", ASCENDING).to_list(100)
    return [Product.from_mongo(d) for d in docs]


@api_router.get("/products/{product_id}", response_model=Product, response_model_by_alias=False)
async def get_product(product_id: str):
    doc = await db.products.find_one({"_id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Product.from_mongo(doc)


@api_router.post("/products", response_model=Product, response_model_by_alias=False, status_code=201)
async def create_product(input: ProductCreate):
    obj = Product(**input.model_dump())
    await db.products.insert_one(obj.to_mongo())
    return obj


@api_router.put("/products/{product_id}", response_model=Product, response_model_by_alias=False)
async def update_product(product_id: str, input: ProductCreate):
    update = {k: v for k, v in input.model_dump().items()}
    result = await db.products.find_one_and_update(
        {"_id": product_id}, {"$set": update}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Product.from_mongo(result)


@api_router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: str):
    result = await db.products.delete_one({"_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    app.state.index_task = asyncio.create_task(ensure_indexes())
    await seed_products()


@app.on_event("shutdown")
async def shutdown():
    app.state.index_task.cancel()
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()
