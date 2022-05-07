# Run with Docker

- ``docker build -t verification-service .``
- ``docker run -it --rm -p 4000:4000 verification-service``

## For Debugging

- ``docker run --rm -p 4000:4000 -e LOG_LEVEL=trace verification-service | node_modules/.bin/pino-pretty``

# Configuration

- ``PORT``: The port the webserver binds to [default: 4000]
- ``BEARER_TOKEN_SECRET``: The bearer token required to access the api [default: secret]
- ``LOG_LEVEL``: Sets the log level [default: info]

# Development

- Command ``npx tsc && node dist/index.js | node_modules/.bin/pino-pretty``