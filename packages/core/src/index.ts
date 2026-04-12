// ── Union types ────────────────────────────────────────────────────────────

export type Severity = 'error' | 'warning' | 'info';

export type Platform = 'web' | 'mobile' | 'tablet';

export type LanguageCode = 'en' | 'es' | 'fr' | 'zh' | 'ar' | 'vi';

export type Category =
  | 'validation'
  | 'auth'
  | 'permission'
  | 'resource'
  | 'timeout'
  | 'rate-limit'
  | 'server'
  | 'network'
  | 'payment';

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Accessibility {
  ariaRole: string;
  ariaLive: 'polite' | 'assertive' | 'off';
}

export interface ErrorCode {
  code: string;
  category: Category;
  httpStatus: number | null;
  severity: Severity;
  title: string;
  description: string;
  messageKey: string;
  recoveryAction: string;
  platforms: Platform[];
  accessibility: Accessibility;
  messages: Partial<Record<LanguageCode, string>>;
}

export interface JourneyStep {
  step: number;
  trigger: string;
  screen: string;
  userAction: string;
}

export interface Journey {
  journeyId: string;
  title: string;
  description: string;
  mermaid?: string;
  steps: JourneyStep[];
  errorCodes?: string[];
  localizationNote?: string;
}

export interface Playbook {
  name: string;
  path: string;
}

export interface RegistryMeta {
  version: string;
  generated: string;
  source: string;
  description: string;
}

export interface Registry {
  meta: RegistryMeta;
  errorCodes: ErrorCode[];
  journeys: Journey[];
  playbooks: Playbook[];
}
