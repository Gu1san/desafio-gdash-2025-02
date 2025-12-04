import datetime
import json
import openmeteo_requests
import pandas as pd
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

RABBITMQ_HOST = "rabbitmq"  # nome do serviço no Docker


# -----------------------
# CLIENTE OPEN METEO
# -----------------------

cache_session = requests_cache.CachedSession(".cache", expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)

openmeteo = openmeteo_requests.Client(session=retry_session)


# -----------------------
# FUNÇÃO: BUSCAR DADOS DE CLIMA (24H)
# -----------------------

def fetch_weather():
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": LAT,
        "longitude": LON,
        "hourly": [
            "temperature_2m",
            "relative_humidity_2m",
            "wind_speed_10m",
            "cloud_cover",
            "precipitation",
            "apparent_temperature"
        ],
        "forecast_days": 1,
        "timezone": "auto",
    }

    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    hourly = response.Hourly()

    # Sequência de timestamps (uma lista)
    timestamps = pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    ).astype(int) // 10**9  # converter para UNIX timestamp

    # Arrays de variáveis
    temps = hourly.Variables(0).ValuesAsNumpy()
    humidity = hourly.Variables(1).ValuesAsNumpy()
    wind = hourly.Variables(2).ValuesAsNumpy()
    cloud = hourly.Variables(3).ValuesAsNumpy()
    precipitation = hourly.Variables(4).ValuesAsNumpy()
    apparent = hourly.Variables(5).ValuesAsNumpy()

    first_hour = {
        "city": "Belo Horizonte",
        "latitude": response.Latitude(),
        "longitude": response.Longitude(),
        "timestamp": int(timestamps[0]),
        "temperature": float(temps[0]),
        "humidity": float(humidity[0]),
        "wind_speed": float(wind[0]),
        "cloud_cover": float(cloud[0]),
        "precipitation": float(precipitation[0]),
        "apparent_temperature": float(apparent[0])
    }

    return first_hour

# -----------------------
# Função auxiliar: gerar range de horários
# -----------------------

def time_range(start, end, interval):
    current = start
    while current < end:
        yield time.gmtime(current)
        current += interval


# -----------------------
# ENVIAR PARA RABBITMQ
# -----------------------

def connect_with_retry(host, retries=10, delay=3):
    for i in range(retries):
        try:
            return pika.BlockingConnection(
                pika.ConnectionParameters(host=host)
            )
        except Exception:
            print(f"Tentativa {i+1}/{retries}: RabbitMQ não pronto ainda...")
            time.sleep(delay)
    raise Exception("RabbitMQ não ficou pronto a tempo")


def publish_to_queue(data):
    connection = connect_with_retry(RABBITMQ_HOST)
    channel = connection.channel()

    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    channel.basic_publish(
        exchange="",
        routing_key=QUEUE_NAME,
        body=json.dumps(data),
        properties=pika.BasicProperties(
            delivery_mode=2  # persistente
        )
    )

    print(f"[OK] Enviado para fila '{QUEUE_NAME}'. Registros: {len(data)}")
    connection.close()


# -----------------------
# EXECUÇÃO
# -----------------------

if __name__ == "__main__":
    while True:
        weather = fetch_weather()

        publish_to_queue(weather)

        # --- LOG DA PRÓXIMA EXECUÇÃO ---
        next_run = datetime.datetime.now() + datetime.timedelta(hours=1)
        print(f"[INFO] Próxima coleta agendada para: {next_run.strftime('%Y-%m-%d %H:%M:%S')}\n")

        # AGUARDA 1 HORA
        time.sleep(3600)


