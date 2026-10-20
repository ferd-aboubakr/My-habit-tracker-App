# 📄 Document 07: Security Architecture, Privacy & African Legal Compliance
**Product:** Ascent KPI Engine  
**Jurisdiction:** Kingdom of Morocco (CNDP Law 09-08) & International GDPR Standards  
**Architecture Classification:** Zero-PII Anonymous Cloud Vault  

---

## 1. Visual Mindmap: The Zero-PII Security Moat

```
========================================================================================
                      ZERO-PII SECURITY & COMPLIANCE (MINDMAP)
========================================================================================

                             [THE DATA SUBJECT / USER]
                     Accesses Ascent from any browser or device
                                         │
                                         ▼
                     =========================================
                     |       THE ZERO-PII FILTER TIER        |
                     =========================================
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          ▼                              ▼                              ▼
  [NO EMAIL ADDRESS]            [NO PHONE NUMBER]             [NO REAL NAMES]
  Identity = Anonymous          No SMS routing; zero          User is known only by
  v4 Crypto UUID Token          telecom log footprint         random hexadecimal key
          │                              │                              │
          └──────────────────────────────┼──────────────────────────────┘
                                         ▼
                     =========================================
                     |      CLIENT-SIDE ENCLAVE (LOCAL)       |
                     =========================================
                     • Data stored in browser localStorage
                     • Zero advertising trackers / Zero pixels
                     • Full 1-Click JSON export / Hard wipe
                                         │
                                         ▼
                     =========================================
                     |        ENCRYPTED TRANSIT (TLS 1.3)     |
                     =========================================
                                         │
                                         ▼
                     =========================================
                     |   SUPABASE REST & POSTGRES STORAGE     |
                     =========================================
                     • At-rest AES-256 database encryption
                     • Strict RLS Policy Isolation
                     • Zero linkable personal identity in DB
                                         │
                                         ▼
                     =========================================
                     |      LEGAL & REGULATORY APPROVAL       |
                     =========================================
                     • Moroccan CNDP Law 09-08 Compliant
                     • EU GDPR Article 25 (Privacy by Design)
========================================================================================
```

---

## 2. Compliance with Moroccan Law 09-08 (CNDP)

The Kingdom of Morocco regulates the processing of personal data under **Law No. 09-08** promulgated by Dahir No. 1-09-15 and enforced by the **CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel)**.

### 2.1 The Anonymous Data Exemption
Under Article 1 of Moroccan Law 09-08, "personal data" is defined as any information concerning an identified or identifiable natural person.
- **Ascent’s Technical Posture:** Because Ascent **never collects names, national identity numbers (CIN), email addresses, telephone numbers, IP addresses, or biometrics**, records stored in `public.user_vaults` cannot be linked to a physical human without possession of the random client-side UUID.
- **Regulatory Result:** The platform operates with **zero privacy exposure risk** under Moroccan law.

---

## 3. General Data Protection Regulation (GDPR) Alignment

| GDPR Principle | Ascent Implementation | Technical Guarantee |
| :--- | :--- | :--- |
| **Privacy by Design (Art. 25)** | The system is architected from line 1 to avoid collecting PII. | No database fields exist for passwords, emails, or names. |
| **Data Minimization (Art. 5.1.c)** | Only habit checkmarks, numerical timers, and anonymous scores are transmitted. | Maximum payload size is under 20 KB. |
| **Right to Erasure (Art. 17)** | User clicks "Reset Vault" in the cloud modal. | Executes `DELETE FROM user_vaults WHERE user_id = $1`, instantly destroying cloud history. |
| **Portability (Art. 20)** | User clicks "Export Backup" in the TopBar. | Downloads an ISO-standard JSON document containing their entire historical ledger. |

---

## 4. Threat Modeling & Vulnerability Mitigation Matrix

| Potential Threat Vector | Risk Level | Architectural Mitigation |
| :--- | :---: | :--- |
| **Brute-Force Vault Key Guessing** | Negligible | Version 4 UUID has $2^{122}$ possible combinations ($5.3 \times 10^{36}$). Guessing a specific active vault key would take billions of years at maximum network bandwidth. |
| **Man-in-the-Middle (MitM) Attacks** | Low | Mandatory TLS 1.3 encryption with HTTP Strict Transport Security (HSTS) and Cloudflare edge SSL certificate pinning. |
| **SQL Injection (SQLi)** | Zero | All cloud communications utilize Supabase PostgREST parameter-bound queries and prepared statements; raw concatenated strings are strictly prohibited. |
| **Cross-Site Scripting (XSS)** | Low | React 19 JSX native DOM escaping; strict Content Security Policy (CSP); zero usage of `dangerouslySetInnerHTML`. |
| **Data Loss via Device Loss** | Low | User simply preserves their 36-character UUID string (in password manager or secure notes) to restore all data on any new laptop or smartphone. |

---

## 5. Emergency Incident Response & Hard Data Wipe Protocol

If a user suspects that an unauthorized individual observed their UUID string:
1. Open Ascent Cloud Modal (`CloudSyncModal.tsx`).
2. Click **"Générer une Nouvelle Clé"** (Generate Fresh UUID).
3. The client immediately spawns a brand new unlinked UUID, updates the local storage, pushes current data into the new vault, and detaches permanently from the previous identifier.
