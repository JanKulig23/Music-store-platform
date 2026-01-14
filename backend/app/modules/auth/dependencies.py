from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.modules.tenancy.models import User

# To mówi Swaggerowi: "Tu jest pole na wpisanie tokena"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nieprawidłowe dane uwierzytelniające",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 1. Rozszyfruj token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # ZMIANA: W nowym routerze w 'sub' zapisujemy email, więc pobieramy go jako email
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # 2. Znajdź użytkownika w bazie po EMAILU (bo to mamy w tokenie)
    # ZMIANA: Szukamy w kolumnie User.email, a nie User.user_id
    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise credentials_exception
        
    return user