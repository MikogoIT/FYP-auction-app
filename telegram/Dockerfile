# telegram/Dockerfile

# 1️⃣ Choose a slim Python base
FROM python:3.13

# 2️⃣ Set working dir
WORKDIR /app



# 4️⃣ Copy and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 5️⃣ Copy your bot’s source code
COPY . .

# 6️⃣ (Optional) expose a port if your bot serves webhooks
EXPOSE 8443

# 7️⃣ Launch your bot
#    Replace "main.py" with your main file if different.
CMD ["python", "main.py"]
