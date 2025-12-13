from pydantic import BaseModel

# Schemat do tworzenia firmy (to co wysyła użytkownik)
class TenantCreate(BaseModel):
    company_name: str
    subdomain: str

# Schemat do wyświetlania firmy (to co odsyła API)
class TenantResponse(TenantCreate):
    tenant_id: int
    is_active: bool

    class Config:
        # Pozwala Pydanticowi czytać dane z obiektów SQLAlchemy (ORM)
        from_attributes = True