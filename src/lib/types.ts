export interface DnsRecord {
  type: string;
  value: string;
  ttl?: number;
}

export interface SslInfo {
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  protocol?: string;
  error?: string;
}

export interface SecurityHeaders {
  score: number;
  grade: string;
  present: string[];
  missing: string[];
  headers: Record<string, string>;
}

export interface GeoInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  org?: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

export interface TechHint {
  name: string;
  category: string;
  confidence: "low" | "medium" | "high";
}

export interface ScanResult {
  domain: string;
  scannedAt: string;
  dns: {
    records: DnsRecord[];
    nameservers: string[];
    mx: string[];
    txt: string[];
  };
  whois: Record<string, string>;
  ssl: SslInfo;
  http: {
    status?: number;
    finalUrl?: string;
    redirectChain: string[];
    headers: Record<string, string>;
    server?: string;
    poweredBy?: string;
  };
  geo: GeoInfo | null;
  security: SecurityHeaders;
  tech: TechHint[];
  uptime: {
    reachable: boolean;
    latencyMs?: number;
  };
  cdnWaf: {
    detected: string[];
  };
}
