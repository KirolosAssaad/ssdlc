FROM postgres:latest
COPY ./init-scripts/ /docker-entrypoint-initdb.d/
EXPOSE 5432
ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password