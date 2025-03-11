/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'swagger-ui-react' {
  import { ReactElement } from 'react';
  
  interface SwaggerUIProps {
    spec?: object;
    url?: string;
    layout?: string;
    docExpansion?: 'list' | 'full' | 'none';
    [key: string]: any;
  }
  
  export default function SwaggerUI(props: SwaggerUIProps): ReactElement;
} 