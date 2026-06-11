import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Construct MySQL Database URL
db_url = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

connect_args = {}

# Set up SSL connection parameters for Aiven Cloud MySQL if certificate is provided
if settings.DB_SSL_CA:
    if os.path.isfile(settings.DB_SSL_CA):
        connect_args["ssl"] = {"ca": settings.DB_SSL_CA}
    else:
        # If certificate is provided as a raw environment string, write it to a temporary file
        import tempfile
        try:
            temp_file = tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".pem")
            temp_file.write(settings.DB_SSL_CA)
            temp_file.close()
            connect_args["ssl"] = {"ca": temp_file.name}
        except Exception as e:
            print(f"Warning: Failed to write SSL CA string to temp file: {e}")

# Create database engine with connection pooling parameters optimized for cloud databases
engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_recycle=3600,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    # Import models here to ensure they register on Base metadata before table creation
    import models
    Base.metadata.create_all(bind=engine)
