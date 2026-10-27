#!/bin/sh
# Generates a self-signed certificate for local TLS/SSL experiments.
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout certs/key.pem -out certs/cert.pem \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
echo "Created certs/key.pem and certs/cert.pem"
