export interface HeaderItem {
  key: string;
  value: string;
  enabled?: boolean;
}

export interface ParamItem {
  id: number;
  key: string;
  value: string;
  enabled: boolean;
}

interface Headers {
  'content-type'?: string;
  'authorization'?: string;
  'accept'?: string;
  'user-agent'?: string;
  'cache-control'?: string;
  'postman-token'?: string;
  'host'?: string;
  'accept-encoding'?: string;
  'connection'?: string;

  // allow any other headers
  // [key: string]: string | undefined;
}

export interface DisplayResponse {
  data: string;
  status: number;
  statusText: string;
  headers?: Headers;

  time: number;
  size: number;

  ok: boolean;
  redirected: boolean;
  url: string;

  // advanced
  cookies?: Record<string, string>;
  requestHeaders?: Record<string, string>;
  responseType?: 'json' | 'text' | 'blob';
  error?: string; // if request fails
}

export interface ApiHistory {
  _id: string;
  userId: string;
  url: string;
  method: MethodsTypes;
  statusCode: number;
  responseTime: number;
  isError: boolean;
  createdAt: string;
}

export type MethodsTypes = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestItem {
  _id: string;
  name: string;
  method: MethodsTypes;
  url: string;
  headers: any[];
  queryParams: any[];
  body: {
    type: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
