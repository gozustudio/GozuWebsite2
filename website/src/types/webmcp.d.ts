export {};

declare global {
  interface WebMCPSubmitEvent extends Event {
    agentInvoked?: boolean;
    respondWith?: (response: string) => void;
  }

  interface WebMCPTool {
    name: string;
    description: string;
    execute: (
      params: Record<string, unknown>,
      client?: ModelContextClient
    ) => unknown | Promise<unknown>;
    inputSchema: {
      type: string;
      properties?: Record<
        string,
        {
          type: string;
          description?: string;
          enum?: string[];
        }
      >;
      required?: string[];
    };
    annotations?: {
      readOnlyHint?: boolean;
    };
  }

  interface ModelContextClient {
    requestUserInteraction: (
      callback: () => Promise<unknown>
    ) => Promise<unknown>;
  }

  interface ModelContext {
    provideContext: (options: { tools: WebMCPTool[] }) => void;
    clearContext: () => void;
    registerTool: (tool: WebMCPTool) => void;
    unregisterTool: (name: string) => void;
  }

  interface Navigator {
    modelContext?: ModelContext;
  }
}

declare module "react" {
  interface HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
    toolparamdescription?: string;
    toolautosubmit?: boolean | string;
  }
}
