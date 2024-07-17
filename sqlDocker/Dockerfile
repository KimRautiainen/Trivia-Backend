# Use the official MySQL image from the Docker Hub
FROM mysql:8.0

# Set environment variables for the database
ENV MYSQL_ROOT_PASSWORD=12345
ENV MYSQL_DATABASE=triviaDb

# Copy the SQL scripts into the Docker image
COPY scripts/ /docker-entrypoint-initdb.d/
