# 🗄️ User Deletion SQL Queries for pgAdmin

## 🔍 **Check User Deletion Status in PostgreSQL**

Use these SQL queries in pgAdmin to investigate user deletion and understand how the system works.

## 📊 **Basic User Status Queries**

### **1. Check All Users and Their Status**
```sql
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive",
    "emailVerified",
    "createdAt",
    "updatedAt"
FROM users 
ORDER BY "createdAt" DESC;
```

### **2. Check Specific User (stan@berteloot.org)**
```sql
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive",
    "emailVerified",
    "createdAt",
    "updatedAt"
FROM users 
WHERE email = 'stan@berteloot.org';
```

### **3. Check Deactivated Users (Soft Deleted)**
```sql
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive",
    "createdAt",
    "updatedAt"
FROM users 
WHERE "isActive" = false
ORDER BY "updatedAt" DESC;
```

### **4. Check Active Users Only**
```sql
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive",
    "createdAt"
FROM users 
WHERE "isActive" = true
ORDER BY "createdAt" DESC;
```

## 🎨 **Artist Profile Status Queries**

### **5. Check Users with Artist Profiles**
```sql
SELECT 
    u.id,
    u.email,
    u."firstName",
    u."lastName",
    u.role,
    u."isActive",
    ap.id as "profileId",
    ap."verificationStatus",
    ap."isVerified",
    ap."studioName"
FROM users u
LEFT JOIN "ArtistProfile" ap ON u.id = ap."userId"
WHERE ap.id IS NOT NULL
ORDER BY u."createdAt" DESC;
```

### **6. Check Deactivated Users with Artist Profiles**
```sql
SELECT 
    u.id,
    u.email,
    u."firstName",
    u."lastName",
    u.role,
    u."isActive",
    ap.id as "profileId",
    ap."verificationStatus",
    ap."isVerified"
FROM users u
INNER JOIN "ArtistProfile" ap ON u.id = ap."userId"
WHERE u."isActive" = false
ORDER BY u."updatedAt" DESC;
```

## 🔍 **Data Retention Queries**

### **7. Check What Data Exists for Deactivated Users**
```sql
-- Check reviews given by deactivated users
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    COUNT(r.id) as "reviewsGiven"
FROM users u
LEFT JOIN "Review" r ON u.id = r."authorId"
WHERE u."isActive" = false
GROUP BY u.id, u.email, u."firstName", u."lastName"
HAVING COUNT(r.id) > 0;

-- Check reviews received by deactivated users
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    COUNT(r.id) as "reviewsReceived"
FROM users u
LEFT JOIN "Review" r ON u.id = r."recipientId"
WHERE u."isActive" = false
GROUP BY u.id, u.email, u."firstName", u."lastName"
HAVING COUNT(r.id) > 0;
```

### **8. Check Flash Items for Deactivated Users**
```sql
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    COUNT(f.id) as "flashItems"
FROM users u
INNER JOIN "ArtistProfile" ap ON u.id = ap."userId"
LEFT JOIN "Flash" f ON ap.id = f."artistId"
WHERE u."isActive" = false
GROUP BY u.id, u.email, u."firstName", u."lastName"
HAVING COUNT(f.id) > 0;
```

### **9. Check Gallery Items for Deactivated Users**
```sql
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    COUNT(tg.id) as "galleryItems"
FROM users u
INNER JOIN "ArtistProfile" ap ON u.id = ap."userId"
LEFT JOIN "TattooGallery" tg ON ap.id = tg."artistId"
WHERE u."isActive" = false
GROUP BY u.id, u.email, u."firstName", u."lastName"
HAVING COUNT(tg.id) > 0;
```

## 🗑️ **Hard Delete Verification Queries**

### **10. Check if Users Were Actually Deleted (Hard Delete)**
```sql
-- This query will return 0 rows if users were hard deleted
-- If users exist but are just deactivated, they will appear here
SELECT 
    'Users still exist (soft delete)' as status,
    COUNT(*) as count
FROM users 
WHERE email = 'stan@berteloot.org'

UNION ALL

SELECT 
    'Total users in database' as status,
    COUNT(*) as count
FROM users;
```

### **11. Check Admin Actions for User Deletion**
```sql
SELECT 
    aa.action,
    aa."targetType",
    aa."targetId",
    aa.details,
    aa."createdAt",
    admin."firstName" || ' ' || admin."lastName" as "adminName"
FROM "AdminAction" aa
LEFT JOIN users admin ON aa."adminId" = admin.id
WHERE aa."targetType" = 'USER' 
    AND aa.action IN ('DELETE_USER', 'PERMANENT_DELETE_USER', 'RESTORE_USER')
ORDER BY aa."createdAt" DESC;
```

## 🧪 **Test Queries**

### **12. Simulate User Counts by Status**
```sql
SELECT 
    "isActive",
    COUNT(*) as "userCount",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as "percentage"
FROM users 
GROUP BY "isActive"
ORDER BY "isActive";
```

### **13. Check Recent User Activity**
```sql
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    u."isActive",
    u."lastLoginAt",
    u."updatedAt",
    CASE 
        WHEN u."isActive" = false THEN 'DEACTIVATED'
        WHEN u."lastLoginAt" IS NULL THEN 'NEVER LOGGED IN'
        WHEN u."lastLoginAt" < NOW() - INTERVAL '30 days' THEN 'INACTIVE (30+ days)'
        ELSE 'ACTIVE'
    END as "status"
FROM users u
ORDER BY u."updatedAt" DESC
LIMIT 20;
```

## ⚠️ **Important Notes**

### **What These Queries Reveal:**
- **Soft Delete**: Users exist with `isActive = false`
- **Hard Delete**: Users completely removed from database
- **Data Retention**: Associated data still exists for soft-deleted users

### **Expected Results:**
- **Soft Delete System**: Deactivated users will appear in queries
- **Hard Delete System**: Deleted users won't appear at all
- **Mixed System**: Some users soft-deleted, others hard-deleted

### **Safety:**
- These are **READ-ONLY** queries
- They won't modify your data
- Use them to understand the current state

## 🎯 **Quick Check for stan@berteloot.org**

Run this query first to see the current status:

```sql
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive",
    "createdAt",
    "updatedAt",
    CASE 
        WHEN "isActive" = false THEN 'SOFT DELETED (still in database)'
        ELSE 'ACTIVE'
    END as "deletionStatus"
FROM users 
WHERE email = 'stan@berteloot.org';
```

---

**Use these queries in pgAdmin to investigate your user deletion system!** 🗄️✨
