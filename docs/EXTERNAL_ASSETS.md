# External Assets Management Guide

## Overview

This project currently uses external image hosting for all character assets. This document outlines the risks, current state, and best practices for managing external dependencies.

---

## ⚠️ Critical Dependencies

### Current State
- **All 24 character images** are hosted on `blogger.googleusercontent.com`
- **Single point of failure**: If Google discontinues this service, all images break
- **No local backups**: Images are not version-controlled in the repository

### Risk Assessment
| Risk Factor | Level | Impact |
|-------------|-------|--------|
| Service Discontinuation | 🔴 High | Complete image failure |
| Rate Limiting | 🟡 Medium | Intermittent loading issues |
| Performance | 🟡 Medium | Depends on external CDN speed |
| CORS Issues | 🟢 Low | Currently stable |

---

## Image Inventory

See [EXTERNAL_IMAGES.md](../EXTERNAL_IMAGES.md) for the complete list of all external image URLs and their locations in the codebase.

**Quick Stats:**
- Base Characters (Stage 1): 12 images
- Evolved Characters (Stage 2): 12 images
- Total: 24 images
- Host: Google Blogger CDN

---

## Best Practices

### 1. When Adding New Images

**DO:**
- ✅ Update [EXTERNAL_IMAGES.md](../EXTERNAL_IMAGES.md) immediately
- ✅ Add to this documentation with:
  - Character name
  - File location with line number link
  - Full URL
  - Status (Active/Warning/Broken)
- ✅ Consider self-hosting instead of external URLs
- ✅ Test the URL before committing

**DON'T:**
- ❌ Use external URLs without documenting them
- ❌ Use multiple different external hosts (consolidate sources)
- ❌ Skip updating the inventory file

### 2. Image URL Patterns

All character component images follow this pattern:

```typescript
// Base characters: src/components/characters/base/{CharacterName}/{CharacterName}.tsx
getImageUrl(emotion: string): string {
  return 'https://blogger.googleusercontent.com/...';
}

// Evolved characters: src/components/characters/evolved/stage2/{CharacterName}/{CharacterName}.tsx
getImageUrl(emotion: string): string {
  return 'https://blogger.googleusercontent.com/...';
}
```

### 3. Finding External Images

Use these commands to find all external image references:

```bash
# Find all external image URLs
grep -r "https://" src/components/characters/ | grep -E "\.(jpg|jpeg|png|gif|svg|webp)"

# Find Blogger CDN URLs specifically
grep -r "blogger.googleusercontent.com" src/

# Count total external images
grep -r "https://blogger.googleusercontent.com" src/components/characters/ | wc -l
```

---

## Migration Strategy

### Option 1: Self-Hosting (Recommended)

**Pros:**
- Complete control
- Version-controlled assets
- No external dependencies
- Faster loading (same server)

**Cons:**
- Increases repository size
- Need to manage asset optimization

**Implementation:**
```bash
# 1. Create public/images directory
mkdir -p public/images/characters/{base,evolved/stage2}

# 2. Download all images
# (create script to download from inventory)

# 3. Update component imports
# Change: return 'https://blogger.googleusercontent.com/...'
# To: return '/images/characters/base/blue-jello.png'
```

### Option 2: Dedicated CDN Service

**Recommended Services:**
- Cloudinary (free tier: 25GB)
- AWS S3 + CloudFront
- Vercel Blob Storage
- imgix

**Pros:**
- Professional CDN features
- Image optimization/transformation
- Better performance globally

**Cons:**
- Additional service dependency
- Potential costs at scale

### Option 3: Git LFS

**Pros:**
- Version-controlled
- Keeps repo lightweight
- Easy rollback

**Cons:**
- Requires Git LFS setup
- Bandwidth limitations on free tiers

---

## Monitoring & Maintenance

### Regular Health Checks

Add to your CI/CD pipeline or run manually:

```bash
# Check all external URLs are accessible
npm run check:images
```

Create `scripts/check-images.sh`:
```bash
#!/bin/bash
echo "Checking external image URLs..."

grep -oP 'https://blogger\.googleusercontent\.com[^"'\'']+' src/components/characters/**/*.tsx | while read url; do
  if curl -I "$url" 2>/dev/null | grep -q "200 OK"; then
    echo "✅ $url"
  else
    echo "❌ FAILED: $url"
    exit 1
  fi
done

echo "All images OK!"
```

### Automated Alerts

Consider setting up:
- Weekly automated checks
- Slack/Discord notifications on failures
- GitHub Actions workflow for URL validation

---

## Emergency Recovery Plan

If external images go down:

1. **Immediate:**
   - Check [EXTERNAL_IMAGES.md](../EXTERNAL_IMAGES.md) for full URL list
   - Attempt to access URLs directly
   - Check Google Blogger status

2. **Short-term (< 1 hour):**
   - Download all images manually using the inventory
   - Store in temporary backup location
   - Update URLs to backup CDN if available

3. **Long-term (< 1 day):**
   - Implement self-hosting solution
   - Update all component references
   - Test thoroughly
   - Deploy emergency fix

---

## Related Files

- [EXTERNAL_IMAGES.md](../EXTERNAL_IMAGES.md) - Complete image inventory
- [NURTURING_LOGIC.md](./NURTURING_LOGIC.md) - Nurturing system documentation
- Character Components:
  - Base: [src/components/characters/base/](../src/components/characters/base/)
  - Evolved: [src/components/characters/evolved/stage2/](../src/components/characters/evolved/stage2/)

---

## Action Items

- [ ] Set up automated image URL health checks
- [ ] Create backup of all external images
- [ ] Evaluate migration to self-hosting
- [ ] Implement monitoring alerts
- [ ] Document image optimization guidelines
- [ ] Create image download/migration script

---

**Last Updated:** 2025-11-15
**Status:** 🔴 HIGH PRIORITY - Migration recommended
