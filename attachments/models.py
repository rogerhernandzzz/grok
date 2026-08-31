from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, Enum
from sqlalchemy.ext.declarative import declarative_base
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import enum

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    cedula = Column(String(20), unique=True, nullable=False)
    pseudonym = Column(String(50), nullable=True)
    face_id_registered = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)  # Foreign key a User
    pseudonym = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class DonationMethod(str, enum.Enum):
    STRIPE = "stripe"
    BITCOIN = "bitcoin"
    BINANCE = "binance"
    PAGOMOVIL = "pagomovil"

class DonationStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True)
    amount = Column(Float, nullable=False)
    method = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    status = Column(String(20), default="pending")
    transaction_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class LeaderInfo(Base):
    __tablename__ = "leader_info"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    title = Column(String(100), nullable=False)
    bio = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    telegram = Column(String(255), nullable=True)
    email = Column(String(100), nullable=True)
    facebook = Column(String(255), nullable=True)
    instagram = Column(String(255), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    members_count = Column(Integer, default=0)
    funds_raised = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class TraderBot(Base):
    __tablename__ = "trader_bots"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    balance = Column(Float, default=10000.0)
    profit_loss = Column(Float, default=0.0)
    roi = Column(Float, default=0.0)
    status = Column(String(20), default="active")  # active, paused, stopped
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class CryptoLuz(Base):
    __tablename__ = "crypto_luz"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    price_per_token = Column(Float, default=0.10)
    total_cost = Column(Float, nullable=False)
    transaction_id = Column(String(255), nullable=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.now)

class SmartContract(Base):
    __tablename__ = "smart_contracts"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    blockchain = Column(String(50), nullable=False)
    contract_address = Column(String(255), nullable=True)
    abi_json = Column(Text, nullable=False)
    verified = Column(Boolean, default=False)
    auditor = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
