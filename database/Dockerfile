FROM postgres:latest
COPY ./init.sql /docker-entrypoint-initdb.d/init.sql
EXPOSE 5432
ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password