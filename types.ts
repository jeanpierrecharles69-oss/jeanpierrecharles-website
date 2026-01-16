
import React from 'react';

export enum ComplianceStatus {
  Compliant = 'Compliant',
  AtRisk = 'At Risk',
  NonCompliant = 'Non-Compliant',
}

export interface ComplianceItem {
  id: string;
  name: string;
  status: ComplianceStatus;
  details: string;
  lastChecked: string;
}

export interface RegulationModule {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  description: string;
  complianceItems: ComplianceItem[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}
