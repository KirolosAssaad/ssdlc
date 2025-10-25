# Nginx Configuration for BookVault Frontend

This directory contains comprehensive Nginx configurations for the BookVault frontend with security hardening, performance optimization, and production-ready features.

## Configuration Files

### 1. `nginx.conf` (Default - Development/Docker)
- **Purpose**: Main configuration for Docker development environment
- **Features**:
  - Comprehensive security headers
  - Rate limiting
  - SPA routing support
  - API proxy configuration
  - Static asset optimization
  - Gzip compression

### 2. `nginx-ssl.conf` (Production with HTTPS)
- **Purpose**: Production configuration with SSL/TLS support
- **Features**:
  - HTTPS with modern TLS configuration
  - HTTP to HTTPS redirects
  - OCSP stapling
  - Enhanced CSP headers
  - Load balancing support
  - Production-grade security

### 3. `nginx-main.conf` (Global Settings)
- **Purpose**: Main nginx.conf with global settings
- **Features**:
  - Worker process optimization
  - Performance tuning
  - Buffer configurations
  - Logging setup

### 4. `nginx-security.conf` (Security Snippets)
- **Purpose**: Additional security configurations
- **Features**:
  - Attack pattern blocking
  - Bot detection
  - Geo-blocking capabilities
  - Honeypot endpoints
  - Enhanced rate limiting

## Security Headers Implemented

### Core Security Headers
```nginx
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Advanced Security Headers
```nginx
X-Permitted-Cross-Domain-Policies: none
X-Download-Options: noopen
Permissions-Policy: geolocation=(), microphone=(), camera=()...
Expect-CT: max-age=86400, enforce
```

### Content Security Policy (CSP)
Strict CSP implementation that allows:
- Self-hosted scripts and styles
- Google Fonts
- Data URIs for images
- WebSocket connections
- Blob workers for React

## Rate Limiting Configuration

### Zones Configured
- **General requests**: 5 req/sec (burst: 10)
- **API requests**: 10 req/sec (burst: 20)
- **Static assets**: 30 req/sec (burst: 50)
- **Authentication**: 5 req/min (burst: 3)

### Connection Limits
- **Per IP**: 20 concurrent connections

## Performance Optimizations

### Compression
- **Gzip**: Enabled for text-based content
- **Brotli**: Enabled (if module available)
- **Compression level**: 6 (balanced)

### Caching Strategy
- **HTML files**: No cache (SPA routing)
- **Static assets**: 1 year cache with immutable flag
- **API responses**: No cache

### File Serving
- **Sendfile**: Enabled for efficient file transfers
- **TCP optimizations**: tcp_nopush, tcp_nodelay
- **Keep-alive**: Optimized for connection reuse

## SSL/TLS Configuration (Production)

### Protocols
- **Supported**: TLSv1.2, TLSv1.3
- **Ciphers**: Modern, secure cipher suites
- **HSTS**: Enabled with preload

### Certificate Management
- **OCSP Stapling**: Enabled
- **Session caching**: Optimized
- **Perfect Forward Secrecy**: Enabled

## Usage Instructions

### Development (Docker)
The default `nginx.conf` is automatically used in the Docker container.

### Production Deployment

1. **Basic HTTPS Setup**:
   ```bash
   # Copy SSL configuration
   cp nginx-ssl.conf /etc/nginx/sites-available/bookvault
   
   # Install SSL certificates
   # Update certificate paths in configuration
   
   # Enable site
   ln -s /etc/nginx/sites-available/bookvault /etc/nginx/sites-enabled/
   
   # Test and reload
   nginx -t && systemctl reload nginx
   ```

2. **Enhanced Security**:
   ```bash
   # Include security snippets in your server block
   include /path/to/nginx-security.conf;
   ```

3. **Global Settings**:
   ```bash
   # Replace main nginx.conf
   cp nginx-main.conf /etc/nginx/nginx.conf
   ```

## Security Features

### Attack Protection
- **SQL Injection**: Pattern-based blocking
- **XSS**: Multiple layers of protection
- **File Inclusion**: Path traversal prevention
- **Bot Protection**: User-agent filtering

### Access Control
- **Geo-blocking**: Country-based restrictions
- **IP whitelisting**: Admin area protection
- **File access**: Sensitive file blocking

### Monitoring
- **Security logging**: Separate log files for attacks
- **CSP reporting**: Violation monitoring
- **Health checks**: Built-in endpoints

## Customization

### Environment-Specific Changes

1. **Domain Names**:
   ```nginx
   server_name your-domain.com www.your-domain.com;
   ```

2. **Backend URLs**:
   ```nginx
   proxy_pass http://your-backend-server:5000/api/;
   ```

3. **CORS Origins**:
   ```nginx
   add_header Access-Control-Allow-Origin "https://your-domain.com";
   ```

### Rate Limiting Adjustment
```nginx
# Adjust rates based on your needs
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;  # Increase API rate
```

### SSL Certificate Paths
```nginx
ssl_certificate /path/to/your/certificate.crt;
ssl_certificate_key /path/to/your/private.key;
```

## Testing Configuration

### Syntax Check
```bash
nginx -t
```

### Security Headers Test
```bash
curl -I https://your-domain.com
```

### Rate Limiting Test
```bash
# Test API rate limiting
for i in {1..15}; do curl -I https://your-domain.com/api/health; done
```

### SSL Test
```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## Monitoring and Logs

### Log Files
- **Access logs**: `/var/log/nginx/access.log`
- **Error logs**: `/var/log/nginx/error.log`
- **Security logs**: `/var/log/nginx/security.log`
- **Attack logs**: `/var/log/nginx/attacks.log`
- **CSP violations**: `/var/log/nginx/csp-violations.log`

### Log Analysis
```bash
# Monitor real-time access
tail -f /var/log/nginx/access.log

# Check for attacks
grep "403" /var/log/nginx/access.log

# Monitor CSP violations
tail -f /var/log/nginx/csp-violations.log
```

## Troubleshooting

### Common Issues

1. **CSP Violations**:
   - Check browser console for blocked resources
   - Review CSP policy in configuration
   - Add necessary domains to CSP

2. **Rate Limiting**:
   - Adjust rate limits if legitimate traffic is blocked
   - Check client IP addresses in logs
   - Consider whitelisting trusted IPs

3. **SSL Issues**:
   - Verify certificate paths and permissions
   - Check certificate validity
   - Test with SSL Labs

### Performance Issues
- Monitor worker processes and connections
- Adjust buffer sizes for high traffic
- Consider enabling additional compression

## Security Recommendations

1. **Regular Updates**:
   - Keep Nginx updated
   - Monitor security advisories
   - Update SSL certificates before expiry

2. **Monitoring**:
   - Set up log monitoring and alerting
   - Monitor CSP violations
   - Track attack patterns

3. **Testing**:
   - Regular security scans
   - Penetration testing
   - SSL/TLS configuration testing

## Production Checklist

- [ ] SSL certificates installed and configured
- [ ] Domain names updated in configuration
- [ ] Rate limits adjusted for expected traffic
- [ ] Security headers tested
- [ ] CSP policy validated
- [ ] Log rotation configured
- [ ] Monitoring and alerting set up
- [ ] Backup configuration files
- [ ] Test failover scenarios