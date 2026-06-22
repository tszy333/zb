FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV CONFIG_PATH=/data/config.json
ENV PORT=5000

# 如果挂载目录下没有 config.json，用默认的
CMD ["sh", "-c", "[ -f /data/config.json ] || cp /app/config.json /data/config.json; python app.py"]
