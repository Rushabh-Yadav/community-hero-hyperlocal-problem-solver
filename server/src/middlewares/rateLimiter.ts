import { Request, Response, NextFunction } from 'express';

class TokenBucket {
  tokens: number;
  lastRefill: number;
  
  constructor(
    public maxTokens: number,
    public refillRateMs: number // Tokens per millisecond
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const addedTokens = elapsed * this.refillRateMs;
    
    if (addedTokens > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + addedTokens);
      this.lastRefill = now;
    }
  }

  consume(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

// Stores IP -> Bucket mappings
const ipBuckets: { [ip: string]: { standard: TokenBucket; ai: TokenBucket } } = {};

const getIpBuckets = (ip: string) => {
  if (!ipBuckets[ip]) {
    ipBuckets[ip] = {
      // Standard: Max 60 tokens, refills 1 token every 1 second (60/minute)
      standard: new TokenBucket(60, 1 / 1000),
      // AI Endpoint: Max 5 tokens, refills 1 token every 12 seconds (5/minute)
      ai: new TokenBucket(5, 1 / 12000)
    };
  }
  return ipBuckets[ip];
};

export const rateLimiter = (isAiEndpoint = false) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const buckets = getIpBuckets(ip);
    
    const bucket = isAiEndpoint ? buckets.ai : buckets.standard;
    const allowed = bucket.consume();
    
    if (!allowed) {
      res.status(429).json({
        error: 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: isAiEndpoint ? 12 : 1
      });
      return;
    }
    
    next();
  };
};
