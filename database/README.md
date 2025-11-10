# Run DB Locally

To run the PostgreSQL database locally using Docker, follow these steps:

1. Ensure you have Docker installed on your machine.
2. Navigate to the directory containing the `Dockerfile`.
3. Build the Docker image using the following command:

    ```bash
    docker build -t ssdlc-database .
    ```

4. Run a container from the image with the following command:

    ```bash
    docker run -d -p 5432:5432 --name ssdlc-db ssdlc-database
    ```
