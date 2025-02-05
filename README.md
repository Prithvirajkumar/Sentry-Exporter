# Sentry Exporter Test

This repo allows users to test the Sentry Exporter.

At the end of this, you will have:

- Two Node.js applications capable of creating events.
- Errors will be sent to two different Sentry projects using the Sentry SDK.
- Traces will be sent to the OTel Collector from where it was exported to the two Sentry projects and two corresponding HoneyComb projects.
- Traces were created using the OTel SDK and used as context within the Sentry error.
- See errors from Sentry with traces from Otel and confirm that the same trace id is used between Sentry and Honeycomb.

# Prerequisites:

Create a Sentry and Honeycomb instance and have the DSN and API keys ready.

# Step 1:

Clone or Fork the repo.

# Step 2:

Install the Collector using Docker - https://opentelemetry.io/docs/collector/installation/

# Step 3:

Add Sentry DSN Keys and Honey Comb API Keys in `otel-collector-config.yaml`

Navigate within the Collector-Configuration folder and run:

// stop the container if it is already running

docker stop otel-collector 

// remove the container if it is already running

docker rm otel-collector 

// start the container with the provided configuration file

docker run -d --name otel-collector \
  -v "$(pwd)/otel-collector-config.yaml:/etc/otel-collector-config.yaml" \
  -p 4317:4317 -p 4318:4318 \
  otel/opentelemetry-collector-contrib --config=/etc/otel-collector-config.yaml 

# Step 4:

Run `npm install` within Service-One and Service-Two

# Step 5:

Add Sentry DSN Key to `index.js` in Service-One and Service-Two

# Step 6:

Run `node -r ./tracing.js index.js` in Service-One and Service-Two
