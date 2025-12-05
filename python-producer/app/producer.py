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
# FETCH COMPLETO (current + hourly + daily)
# -----------------------

def fetch_weather():
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": LAT,
        "longitude": LON,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "weather_code",
            "wind_speed_10m",
            "apparent_temperature"
        ],
        "hourly": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "weather_code",
            "apparent_temperature",
            "wind_speed_10m",
            "cloud_cover"
        ],
        "daily": [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min"
        ],
        "timezone": "America/Sao_Paulo",
        "forecast_days": 7
    }

    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    # -----------------------
    # CURRENT WEATHER
    # -----------------------
    current = response.Current()
    current_data = {
        "timestamp": int(current.Time()),
        "temperature": float(current.Variables(0).Value()),
        "humidity": float(current.Variables(1).Value()),
        "weather_code": int(current.Variables(2).Value()),
        "wind_speed": float(current.Variables(3).Value()),
        "apparent_temperature": float(current.Variables(4).Value())
    }

    # -----------------------
    # HOURLY FORECAST
    # -----------------------
    hourly = response.Hourly()

    timestamps = pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    ).astype(int) // 10**9

    hourly_data = []
    for i in range(len(timestamps)):
        hourly_data.append({
            "timestamp": int(timestamps[i]),
            "temperature": float(hourly.Variables(0).ValuesAsNumpy()[i]),
            "humidity": float(hourly.Variables(1).ValuesAsNumpy()[i]),
            "precipitation": float(hourly.Variables(2).ValuesAsNumpy()[i]),
            "weather_code": int(hourly.Variables(3).ValuesAsNumpy()[i]),
            "apparent_temperature": float(hourly.Variables(4).ValuesAsNumpy()[i]),
            "wind_speed": float(hourly.Variables(5).ValuesAsNumpy()[i]),
            "cloud_cover": float(hourly.Variables(6).ValuesAsNumpy()[i])
        })

    # -----------------------
    # DAILY FORECAST
    # -----------------------
    daily = response.Daily()

    # daily.Time() é um único timestamp ⇒ converter direto
    base_ts = int(pd.to_datetime(daily.Time(), unit="s", utc=True).timestamp())

    count = daily.Variables(0).ValuesLength()

    daily_data = []
    for i in range(count):
        daily_data.append({
            "timestamp": base_ts + (i * 86400),
            "weather_code": int(daily.Variables(0).ValuesAsNumpy()[i]),
            "temp_max": float(daily.Variables(1).ValuesAsNumpy()[i]),
            "temp_min": float(daily.Variables(2).ValuesAsNumpy()[i])
        })

    # -----------------------
    # PACOTE FINAL → Rabbit
    # -----------------------
    payload = {
        "city": "Belo Horizonte",
        "latitude": response.Latitude(),
        "longitude": response.Longitude(),
        "current": current_data,
        "hourly": hourly_data,
        "daily": daily_data
    }

    return payload

# -----------------------
# RabbitMQ
# -----------------------

def connect_with_retry(host, retries=10, delay=3):
    for i in range(retries):
        try:
            return pika.BlockingConnection(pika.ConnectionParameters(host=host))
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
        properties=pika.BasicProperties(delivery_mode=2)
    )

    print(f"[OK] Enviado para fila '{QUEUE_NAME}'.")
    connection.close()

# -----------------------
# LOOP PRINCIPAL
# -----------------------

if __name__ == "__main__":
    while True:
        weather = fetch_weather()
        publish_to_queue(weather)

        next_run = datetime.datetime.now() + datetime.timedelta(hours=1)
        print(f"[INFO] Próxima coleta: {next_run.strftime('%Y-%m-%d %H:%M:%S')}\n")

        time.sleep(3600)
