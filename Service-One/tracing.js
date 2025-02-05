// Service 2: Express application with OpenTelemetry instrumentation
"use strict";

const opentelemetry = require("@opentelemetry/sdk-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");

// Configure OpenTelemetry SDK
const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces", // OpenTelemetry Collector HTTP endpoint
  }),
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "express-opentelemetry-app-2",
  }),
  instrumentations: [
    new ExpressInstrumentation(),
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false }, // Optional: Disable FS instrumentation
    }),
  ],
});

// Start the SDK (synchronous in recent versions)
try {
  sdk.start();
  console.log("Tracing initialized");
} catch (error) {
  console.error("Error initializing tracing:", error);
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  try {
    await sdk.shutdown();
    console.log("Tracing shut down successfully");
  } catch (error) {
    console.error("Error shutting down tracing:", error);
  } finally {
    process.exit(0);
  }
});
