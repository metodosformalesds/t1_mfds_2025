import bcrypt 

# Esta  funcion hashea una contraseña en texto plano usando bcrypt

def hash_password(password: str) -> str:
    # Convertimos el password (str) a bytes
    password_bytes = password.encode('utf-8')
    
    # Generamos un "salt" (una cadena aleatoria para el hash)
    salt = bcrypt.gensalt()
    
    # Hasheamos el password
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    
    # onvertimos el hash (bytes) de nuevo a string para guardarlo en la BD
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:

    plain_password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')

    try:
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
    except ValueError:

        return False