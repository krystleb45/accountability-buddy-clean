# 🐛 Known Issues & Status

Last Updated: [Current Date]

## 🚨 Critical Issues (Priority 1)

### 1. Groups Authentication Flow
**Status**: 🔄 In Progress
**Description**: Groups can be created successfully, but subsequent API calls for group details, members, and messages return 401 unauthorized errors.

**Symptoms**:
- Group creation works (201 status)
- Redirect to group detail page fails
- API calls to `/api/groups/[id]/members`, `/api/groups/[id]/messages` return 401

**Root Cause**: Authentication tokens not being properly forwarded through Next.js proxy routes after environment variable changes.

**Debugging Info**:
```
✅ POST /api/groups 201 (group created)
❌ GET /api/groups/[id] 401 (no bearer token)
❌ GET /api/groups/[id]/members 401 (no bearer token)
❌ GET /api/groups/[id]/messages 401 (no bearer token)
```

**Files Involved**:
- `frontend/src/app/api/groups/[groupId]/route.ts`
- `frontend/src/app/api/groups/[groupId]/members/route.ts`
- `frontend/src/app/api/groups/[groupId]/messages/route.ts`
- `frontend/src/app/community/groups/[groupId]/client.tsx`

---

### 2. Military Support Chat Rooms
**Status**: 🔄 In Progress
**Description**: Anonymous chat rooms failing to load and connect properly.

**Symptoms**:
- "Join Anonymous Chat Rooms" button leads to empty/broken page
- WebSocket connections failing
- Chat room components throwing JavaScript errors

**Root Cause**: Missing API proxy routes and WebSocket connection configuration issues.

**Error Messages**:
```
❌ [anonymousMilitaryChatApi::getAnonymousRooms] {}
❌ WebSocket connection failed
```

**Files Involved**:
- `frontend/src/components/MilitarySupport/MilitaryChatRoom.tsx`
- `frontend/src/api/military-support/anonymousMilitaryChatApi.ts`
- `backend/src/api/routes/anonymous-military-chat.ts`

---

## ⚠️ Medium Issues (Priority 2)

### 3. Military Support API Endpoints
**Status**: 🔄 Partially Fixed
**Description**: Military support resources and disclaimer endpoints returning 500 errors.

**Symptoms**:
- Military support page shows resource cards but no data loads
- API calls to `/api/military-support/resources` return 500 status
- Disclaimer text not loading

**Recent Fix**: Added Next.js proxy routes, but backend endpoints may need work.

**Files Involved**:
- `frontend/src/app/api/military-support/resources/route.ts`
- `frontend/src/app/api/military-support/disclaimer/route.ts`
- `backend/src/api/controllers/militarySupportController.ts`

---

### 4. Dashboard Functionality
**Status**: ❌ Incomplete
**Description**: User dashboard missing core functionality.

**Missing Features**:
- Goals progress tracking
- Achievement displays
- Activity feed
- Statistics and charts

**Files Involved**:
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/components/Dashboard/`

---

### 5. Goals Tracking System
**Status**: ❌ Incomplete
**Description**: Goals creation and tracking system not fully implemented.

**Missing Features**:
- Goal creation form
- Progress updates
- Goal completion tracking
- Goal sharing with groups

**Files Involved**:
- `frontend/src/app/goals/`
- `backend/src/api/controllers/goalsController.ts`
- `backend/src/api/models/Goal.js`

---

## 🔧 Minor Issues (Priority 3)

### 6. UI/UX Polish
**Status**: ❌ Needs Work
**Description**: Various UI improvements needed.

**Issues**:
- Mobile responsiveness
- Loading states
- Error message handling
- Consistent styling

### 7. Environment Variable Management
**Status**: ✅ Mostly Fixed
**Description**: Environment variables were pointing to wrong URLs.

**Recent Fix**: Updated `NEXT_PUBLIC_API_URL` to point to Next.js proxy routes instead of direct Express URLs.

---

## 🧪 Testing Issues

### 8. No Test Coverage
**Status**: ❌ Not Implemented
**Description**: No testing framework or tests implemented.

**Needed**:
- Unit tests for components
- Integration tests for API endpoints
- E2E tests for critical user flows

---

## 📋 Debugging Information

### Environment Variables Status
```bash
# Frontend (.env.local)
✅ NEXTAUTH_URL=http://localhost:3000
✅ NEXTAUTH_SECRET=[configured]
✅ NEXT_PUBLIC_API_URL=http://localhost:3000/api
✅ BACKEND_URL=http://localhost:5050

# Backend (.env.development)
✅ PORT=5050
✅ MONGODB_URI=[configured]
✅ JWT_SECRET=[configured]
```

### API Proxy Routes Status
```
✅ /api/groups/route.ts (working)
✅ /api/groups/[groupId]/route.ts (working)
✅ /api/groups/[groupId]/members/route.ts (auth issues)
✅ /api/groups/[groupId]/messages/route.ts (auth issues)
✅ /api/military-support/resources/route.ts (added)
✅ /api/military-support/disclaimer/route.ts (added)
❌ /api/anonymous-military-chat/rooms/route.ts (needs fix)
❌ /api/anonymous-military-chat/mood-checkin/route.ts (missing)
```

### Database Collections Status
```
✅ users (working)
✅ groups (working)
❌ goals (incomplete schema)
❌ achievements (not implemented)
❌ messages (anonymous chat - incomplete)
```

---

## 🚀 Next Steps for Developer

### Immediate (Week 1)
1. **Fix groups authentication flow** - Highest priority
2. **Complete military support chat rooms**
3. **Add missing API proxy routes**
4. **Test and fix WebSocket connections**

### Short-term (Week 2-3)
1. **Complete goals tracking system**
2. **Implement dashboard functionality**
3. **Fix UI/UX issues**
4. **Add proper error handling**

### Long-term (Week 4+)
1. **Add testing framework**
2. **Performance optimization**
3. **Mobile responsiveness**
4. **Production deployment optimization**

---

## 📞 Getting Help

If you encounter any issues:
1. Check this document for known issues
2. Review the console logs (both frontend and backend)
3. Check the Network tab in browser dev tools
4. Verify environment variables are correct
5. Create detailed issue reports with screenshots and error logs
