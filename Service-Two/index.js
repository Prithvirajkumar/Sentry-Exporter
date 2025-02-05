const express = require("express");
const Sentry = require("@sentry/node");
const { trace, context } = require("@opentelemetry/api");

// Ensure OpenTelemetry is initialized before the app starts
require("./tracing");

// Initialize Sentry
Sentry.init({
  dsn: "https://a54f975c0645b4e41d3ff35a27a1a34f@o1161257.ingest.us.sentry.io/4505918888935424",
  tracesSampleRate: undefined,
  environment: "prod",
});

const app = express();

// Custom request handler to replace Sentry.Handlers.requestHandler()
app.use((req, res, next) => {
  // Use Sentry.withScope() to add request data to the event
  Sentry.withIsolationScope((scope) => {
    // Add transaction to the event
    scope.addEventProcessor((event) => {
      event.transaction = `${req.method} ${req.originalUrl}`;
      // Add request data to the event
      return Sentry.addRequestDataToEvent(event, req);
    });
    next();
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/error", (req, res) => {
  throw new Error("Simulated exception");
});

// Error handling middleware (fixing configureScope issue)
app.use((err, req, res, next) => {
  const span = trace.getSpan(context.active());

  Sentry.withScope((scope) => {
    if (span) {
      // Use setContext() to add trace context to the event
      const ctx = span.spanContext();
      scope.setContext("trace", {
        trace_id: ctx.traceId,
        span_id: ctx.spanId,
        trace_flags: ctx.traceFlags,
      });
    }
    Sentry.captureException(err);
  });

  console.error(err.message);
  res.status(500).send("Internal Server Error - Service 2");
});

// Use Sentry's new error handler
app.use(Sentry.expressErrorHandler());

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
