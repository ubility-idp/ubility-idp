export type Port = {
  [key: string]: any;
  id: number;
  name: string;
  port: number;
  protocol: string;
  targetPort: number;
};

export type Ingress = {
  apiVersion: string;
  kind: string;
  metadata: {
    annotations: {
      [key: string]: string;
    };
  };
  spec: {
    rules: {
      host: string;
      http: {
        paths: {
          backend: {
            service: {
              name: string;
              port: {
                number: number;
              };
            };
          };
          path: string;
          pathType: string;
        }[];
      };
    }[];
    tls: {
      hosts: string[];
      secretName: string;
    }[];
  };
  status: {
    loadBalancer: {
      ingress: {
        ip: string;
      }[];
    };
  };
};

export type InfoElement = {
  id: string;
  title: string;
  value: string;
  paths: string[];
};

export type IngressRes = {
  ingress_json: Object;
};
