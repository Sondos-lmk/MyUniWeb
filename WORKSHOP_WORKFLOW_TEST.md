# Workshop Approval Workflow Test Guide

## Overview
This document explains how to test the complete workshop approval workflow where professors create workshops and Events Officers approve/publish them.

## API Endpoints

### Professor Endpoints
1. **Create Workshop** (Professor only)
   - `POST /api/event/professor/workshop`
   - Requires: Professor authentication
   - Body: Workshop data with `type: 'workshop'`
   - Response: Workshop created with `status: 'pending'`

2. **Get Professor's Workshops**
   - `GET /api/event/professor/my-workshops`
   - Requires: Professor authentication
   - Response: List of workshops created by the professor

### Events Officer Endpoints
1. **Get Pending Workshops**
   - `GET /api/event/pending/workshops`
   - Requires: Events Officer authentication
   - Response: List of workshops with `status: 'pending'`

2. **Approve Workshop**
   - `PATCH /api/event/:id/approve`
   - Requires: Events Officer authentication
   - Response: Workshop status changed to `'approved'`

3. **Reject Workshop**
   - `PATCH /api/event/:id/reject`
   - Requires: Events Officer authentication
   - Response: Workshop status changed to `'rejected'`

## Test Workflow

### Step 1: Professor Creates Workshop
```bash
# Register a professor first
POST /api/auth/register
{
  "name": "Dr. Smith",
  "email": "professor@example.com",
  "password": "password123",
  "role": "professor"
}

# Login as professor
POST /api/auth/login
{
  "email": "professor@example.com",
  "password": "password123"
}

# Create workshop (use the JWT token from login)
POST /api/event/professor/workshop
Authorization: Bearer <professor_jwt_token>
{
  "type": "workshop",
  "title": "Advanced Machine Learning",
  "desc": "Learn advanced ML techniques",
  "location": "GUC Cairo",
  "startDate": "2024-02-15T09:00:00Z",
  "endDate": "2024-02-15T17:00:00Z",
  "registrationDeadline": "2024-02-10T23:59:59Z",
  "requiredBudget": 5000,
  "fundraisingSource": "GUC",
  "fullAgenda": "Morning: Theory, Afternoon: Hands-on",
  "responsibleFaculty": "IET",
  "professorsParticipating": [],
  "extraRequiredResource": "Projector and laptops"
}
```

### Step 2: Events Officer Reviews Pending Workshops
```bash
# Register an Events Officer
POST /api/auth/register
{
  "name": "Events Manager",
  "email": "events@example.com",
  "password": "password123",
  "role": "eventOfficer"
}

# Login as Events Officer
POST /api/auth/login
{
  "email": "events@example.com",
  "password": "password123"
}

# Get pending workshops
GET /api/event/pending/workshops
Authorization: Bearer <events_officer_jwt_token>
```

### Step 3: Events Officer Approves Workshop
```bash
# Approve the workshop (use workshop ID from step 2)
PATCH /api/event/{workshop_id}/approve
Authorization: Bearer <events_officer_jwt_token>
```

### Step 4: Verify Workshop Status
```bash
# Check workshop status
GET /api/event/{workshop_id}
# Should show status: "approved"

# Professor can check their workshops
GET /api/event/professor/my-workshops
Authorization: Bearer <professor_jwt_token>
```

## Expected Behavior

1. **Professor creates workshop** → Status: `pending`
2. **Events Officer views pending workshops** → Sees the workshop in pending list
3. **Events Officer approves workshop** → Status: `approved` (published)
4. **Professor views their workshops** → Sees the approved workshop

## Error Cases

1. **Professor tries to create non-workshop event** → Error: "Professors can only create workshops"
2. **Non-professor tries to create workshop** → Error: "Forbidden: requires Professor role"
3. **Non-Events Officer tries to approve** → Error: "Forbidden: requires Events Officer role"
4. **Approving already approved workshop** → Error: "Event is already approved"

## Database Schema

The workshop will be stored with:
- `status: 'pending'` (initially)
- `organizerId: professor_user_id`
- `type: 'workshop'`
- All workshop-specific fields (title, location, dates, etc.)

After approval:
- `status: 'approved'`
- Workshop becomes visible to all users via `GET /api/event/`
