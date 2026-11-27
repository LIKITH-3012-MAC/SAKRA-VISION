import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

connect_args = {}

if settings.DB_HOST and settings.DB_USER:
    # Production Aiven Cloud MySQL connection URL
    db_url = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

    # Set up SSL connection parameters for Aiven Cloud MySQL if certificate is provided
    if settings.DB_SSL_CA:
        if os.path.isfile(settings.DB_SSL_CA):
            connect_args["ssl"] = {"ca": settings.DB_SSL_CA}
        else:
            # If certificate is provided as a raw environment string, write it to a temporary file
            try:
                temp_file = tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".pem")
                temp_file.write(settings.DB_SSL_CA)
                temp_file.close()
                connect_args["ssl"] = {"ca": temp_file.name}
            except Exception as e:
                print(f"Warning: Failed to write SSL CA string to temp file: {e}")

    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_recycle=3600,
        pool_pre_ping=True
    )
else:
    # Local standalone development / test SQLite fallback when MySQL credentials are omitted
    local_db_path = os.path.join(tempfile.gettempdir(), "sakra_local.db")
    db_url = f"sqlite:///{local_db_path}"
    connect_args["check_same_thread"] = False
    engine = create_engine(db_url, connect_args=connect_args)

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
