import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { OpenAIInstrumentation } from "@traceloop/instrumentation-openai";

// Only initialize tracing on the server side
if (typeof window === 'undefined') {
  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:9918/v1/traces",
  });

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      "service.name": "herd-rhythm",
      "service.version": process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      "deployment.environment": process.env.NODE_ENV || "development"
    }),
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });

  provider.register();

  registerInstrumentations({
    instrumentations: [new OpenAIInstrumentation()],
  });
}

// Export tracer for manual instrumentation if needed
import { trace } from '@opentelemetry/api';

export const getTracer = () => {
  if (typeof window === 'undefined') {
    return trace.getTracer('herd-rhythm');
  }
  return null;
};