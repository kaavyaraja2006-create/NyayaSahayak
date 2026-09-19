export interface RedactionResult {
  output: string;
  counts: { phone: number; email: number; aadhaar: number; person: number };
}

const HONORIFIC_NAME = /\b(?:Mr|Mrs|Ms|Dr|Shri|Smt)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const AADHAAR = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
const PHONE = /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b|(?:\+91[\s-]?)?\b[6-9]\d{9}\b/g;

/** Names that appear in the synthetic case, tokenised consistently. */
export const KNOWN_NAMES = ['Arun Kumar', 'Ravi Menon', 'Meera Iyer', 'Kamal Rao', 'Joseph Thomas', 'Sunita Devi'];

/**
 * Prototype pattern-based redaction. Order matters: Aadhaar-like numbers are
 * replaced before phone numbers so their digits are not partially matched.
 */
export function redactText(input: string): RedactionResult {
  const counts = { phone: 0, email: 0, aadhaar: 0, person: 0 };
  let out = input;

  out = out.replace(EMAIL, () => {
    counts.email += 1;
    return '[EMAIL REDACTED]';
  });
  out = out.replace(AADHAAR, () => {
    counts.aadhaar += 1;
    return '[ID NUMBER REDACTED]';
  });
  out = out.replace(PHONE, () => {
    counts.phone += 1;
    return '[PHONE REDACTED]';
  });

  const tokens = new Map<string, string>();
  const tokenFor = (name: string): string => {
    const key = name.toLowerCase();
    let t = tokens.get(key);
    if (!t) {
      t = `[PERSON_${tokens.size + 1}]`;
      tokens.set(key, t);
    }
    counts.person += 1;
    return t;
  };

  KNOWN_NAMES.forEach((name) => {
    out = out.split(name).join('\u0000' + name + '\u0000');
  });
  out = out.replace(/\u0000([^\u0000]+)\u0000/g, (_m, name: string) => tokenFor(name));
  out = out.replace(HONORIFIC_NAME, (m) => tokenFor(m));

  return { output: out, counts };
}

export const REDACTION_SAMPLE =
  'Mr. Arun Kumar can be reached on 9876543210 or abc@example.com. Aadhaar-like number: 1234 5678 9012. Witness Ravi Menon confirmed the call.';
