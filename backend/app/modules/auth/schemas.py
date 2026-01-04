from pydantic import BaseModel, EmailStr

# To wysyła użytkownik, żeby się zarejestrować
class RegisterRequest(BaseModel):
    company_name: str
    subdomain: str
    email: EmailStr
    password: str

# To odsyłamy mu jako potwierdzenie
class UserResponse(BaseModel):
    user_id: int
    email: str
    tenant_id: int
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str