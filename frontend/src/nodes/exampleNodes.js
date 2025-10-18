// exampleNodes.js
// Demonstration of how easy it is to create new nodes with the factory pattern
// Just define the config - no repetitive code needed!

import { Database, Mail, Calculator, Image, Webhook } from "lucide-react";
import { createThemedNode } from "./nodeFactory";

// ============ 5 NEW EXAMPLE NODES ============

// 1. DATABASE NODE - Connect to databases
const databaseConfig = {
  icon: Database,
  title: "Database",
  description: "Query database tables",
  width: 260,
  height: 160,
  fields: [
    {
      name: "dbType",
      type: "select",
      label: "Database Type",
      defaultValue: "postgres",
      options: [
        { value: "postgres", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
        { value: "mongodb", label: "MongoDB" },
        { value: "redis", label: "Redis" },
      ],
    },
    {
      name: "query",
      type: "textarea",
      label: "Query",
      defaultValue: "SELECT * FROM users",
      placeholder: "Enter SQL query",
      rows: 3,
    },
    {
      name: "connection",
      type: "text",
      label: "Connection String",
      defaultValue: "",
      placeholder: "Database connection URL",
    },
  ],
  inputs: [{ id: "params", label: "Parameters" }],
  outputs: [
    { id: "data", label: "Data" },
    { id: "error", label: "Error" },
  ],
};

// 2. EMAIL NODE - Send emails
const emailConfig = {
  icon: Mail,
  title: "Email",
  description: "Send email notifications",
  width: 240,
  height: 180,
  fields: [
    {
      name: "to",
      type: "text",
      label: "To",
      defaultValue: "",
      placeholder: "recipient@example.com",
    },
    {
      name: "subject",
      type: "text",
      label: "Subject",
      defaultValue: "",
      placeholder: "Email subject",
    },
    {
      name: "body",
      type: "textarea",
      label: "Body",
      defaultValue: "",
      placeholder: "Email content",
      rows: 4,
    },
    {
      name: "provider",
      type: "select",
      label: "Provider",
      defaultValue: "smtp",
      options: [
        { value: "smtp", label: "SMTP" },
        { value: "sendgrid", label: "SendGrid" },
        { value: "mailgun", label: "Mailgun" },
      ],
    },
  ],
  inputs: [{ id: "trigger", label: "Trigger" }],
  outputs: [
    { id: "sent", label: "Success" },
    { id: "failed", label: "Failed" },
  ],
};

// 3. MATH NODE - Mathematical operations
const mathConfig = {
  icon: Calculator,
  title: "Math",
  description: "Perform calculations",
  width: 220,
  height: 140,
  fields: [
    {
      name: "operation",
      type: "select",
      label: "Operation",
      defaultValue: "add",
      options: [
        { value: "add", label: "Add (+)" },
        { value: "subtract", label: "Subtract (-)" },
        { value: "multiply", label: "Multiply (×)" },
        { value: "divide", label: "Divide (÷)" },
        { value: "power", label: "Power (^)" },
        { value: "sqrt", label: "Square Root (√)" },
        { value: "log", label: "Logarithm (log)" },
      ],
    },
    {
      name: "precision",
      type: "number",
      label: "Decimal Places",
      defaultValue: "2",
      placeholder: "Precision",
    },
  ],
  inputs: [
    { id: "a", label: "Input A" },
    { id: "b", label: "Input B" },
  ],
  outputs: [{ id: "result", label: "Result" }],
};

// 4. IMAGE PROCESSOR NODE - Process images
const imageProcessorConfig = {
  icon: Image,
  title: "Image",
  description: "Process and transform images",
  width: 240,
  height: 160,
  fields: [
    {
      name: "operation",
      type: "select",
      label: "Operation",
      defaultValue: "resize",
      options: [
        { value: "resize", label: "Resize" },
        { value: "crop", label: "Crop" },
        { value: "rotate", label: "Rotate" },
        { value: "filter", label: "Apply Filter" },
        { value: "compress", label: "Compress" },
      ],
    },
    {
      name: "width",
      type: "number",
      label: "Width (px)",
      defaultValue: "800",
      placeholder: "Width",
    },
    {
      name: "height",
      type: "number",
      label: "Height (px)",
      defaultValue: "600",
      placeholder: "Height",
    },
    {
      name: "format",
      type: "select",
      label: "Output Format",
      defaultValue: "jpg",
      options: [
        { value: "jpg", label: "JPEG" },
        { value: "png", label: "PNG" },
        { value: "webp", label: "WebP" },
        { value: "gif", label: "GIF" },
      ],
    },
  ],
  inputs: [{ id: "image", label: "Image" }],
  outputs: [{ id: "processed", label: "Processed" }],
};

// 5. WEBHOOK NODE - HTTP webhooks
const webhookConfig = {
  icon: Webhook,
  title: "Webhook",
  description: "Listen for HTTP webhooks",
  width: 240,
  height: 160,
  fields: [
    {
      name: "path",
      type: "text",
      label: "Path",
      defaultValue: "/webhook",
      placeholder: "Webhook path",
    },
    {
      name: "method",
      type: "select",
      label: "HTTP Method",
      defaultValue: "POST",
      options: [
        { value: "POST", label: "POST" },
        { value: "GET", label: "GET" },
        { value: "PUT", label: "PUT" },
        { value: "DELETE", label: "DELETE" },
      ],
    },
    {
      name: "authentication",
      type: "select",
      label: "Auth Type",
      defaultValue: "none",
      options: [
        { value: "none", label: "None" },
        { value: "bearer", label: "Bearer Token" },
        { value: "apikey", label: "API Key" },
        { value: "basic", label: "Basic Auth" },
      ],
    },
    {
      name: "secret",
      type: "text",
      label: "Secret/Token",
      defaultValue: "",
      placeholder: "Authentication secret",
    },
  ],
  outputs: [
    { id: "payload", label: "Payload" },
    { id: "headers", label: "Headers" },
  ],
};

// ============ CREATE NODE COMPONENTS ============
// See how clean this is? Just pass the config to the factory!

export const DatabaseNode = createThemedNode(databaseConfig);
export const EmailNode = createThemedNode(emailConfig);
export const MathNode = createThemedNode(mathConfig);
export const ImageProcessorNode = createThemedNode(imageProcessorConfig);
export const WebhookNode = createThemedNode(webhookConfig);

// ============ USAGE DEMONSTRATION ============
/*
 * To use these nodes in your application:
 *
 * 1. Import them in your node types file:
 *    import { DatabaseNode, EmailNode, MathNode, ImageProcessorNode, WebhookNode } from './nodes/exampleNodes';
 *
 * 2. Register them in your node types:
 *    const nodeTypes = {
 *      database: DatabaseNode,
 *      email: EmailNode,
 *      math: MathNode,
 *      imageProcessor: ImageProcessorNode,
 *      webhook: WebhookNode,
 *    };
 *
 * 3. Add them to your toolbar so users can drag them onto the canvas
 *
 * That's it! Each node gets:
 * - Purple theme styling
 * - Animated handles and delete button
 * - Hover effects
 * - Form field management
 * - Automatic state handling
 *
 * CREATING A NEW NODE IS NOW AS SIMPLE AS:
 * 1. Define a config object (20-30 lines)
 * 2. Pass it to createThemedNode()
 * 3. Export it
 *
 * Compare this to the old approach where each node was 50-80 lines of repetitive code!
 */
