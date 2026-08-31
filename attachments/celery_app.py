from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

celery_app = Celery(
    'skynet',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    broker_connection_retry_on_startup=True,
)

@celery_app.task
def send_email_task(email, subject, body):
    """Enviar email asincrónico"""
    print(f"Enviando email a {email}")
    return True

@celery_app.task
def process_payment_task(user_id, amount):
    """Procesar pago asincrónico"""
    print(f"Procesando pago: ${amount} para usuario {user_id}")
    return True

@celery_app.task
def generate_creative_task(type_name):
    """Generar contenido creativo"""
    print(f"Generando {type_name}")
    return True
