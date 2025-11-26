import json
import openmeteo_requests
import pika
import time
import requests_cache
from retry_requests import retry


# -----------------------
# CONFIGURAÇÕES
# -----------------------

LAT = -19.9208
LON = -43.9378
QUEUE_NAME = "weather.raw"

RABBITMQ_HOST = "rabbitmq"  # ou o nome do serviço no Docker


# -----------------------
# CLIENTE OPEN METEO
# -----------------------

cache_session = requests_cache.CachedSession(".cache", expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)

openmeteo = openmeteo_requests.Client(session=retry_session)


# -----------------------
# FUNÇÃO: BUSCAR DADOS DE CLIMA
# -----------------------

def fetch_weather():
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": LAT,
        "longitude": LON,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "rain",
            "wind_speed_10m",
            "cloud_cover"
        ],
        "forecast_days": 1,
    }

    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    current = response.Current()

    weather_data = {
        "city": "Belo Horizonte",
        "latitude": response.Latitude(),
        "longitude": response.Longitude(),
        "timestamp": current.Time(),
        "temperature": current.Variables(0).Value(),
        "humidity": current.Variables(1).Value(),
        "rain": current.Variables(2).Value(),
        "wind_speed": current.Variables(3).Value(),
        "cloud_cover": current.Variables(4).Value()
    }

    return weather_data


# -----------------------
# FUNÇÃO: ENVIAR PARA O RABBITMQ
# -----------------------

def connect_with_retry(host, retries=10, delay=3):
    for i in range(retries):
        try:
            return pika.BlockingConnection(
                pika.ConnectionParameters(host=host)
            )
        except Exception as e:
            print(f"Tentativa {i+1}/{retries}: RabbitMQ não pronto ainda...")
            time.sleep(delay)
    raise Exception("RabbitMQ não ficou pronto a tempo")

def publish_to_queue(data: dict):
    connection = connect_with_retry(RABBITMQ_HOST)
    
    channel = connection.channel()

    # garante que a fila existe
    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    # publica
    channel.basic_publish(
        exchange="",
        routing_key=QUEUE_NAME,
        body=json.dumps(data),
        properties=pika.BasicProperties(
            delivery_mode=2  # mensagem persistente
        )
    )

    print(f"[OK] Enviado para fila '{QUEUE_NAME}': {data}")
    connection.close()


# -----------------------
# EXECUÇÃO
# -----------------------

if __name__ == "__main__":
    weather = fetch_weather()
    publish_to_queue(weather)
