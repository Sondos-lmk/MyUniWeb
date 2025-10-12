# Postman Testing Guide: Complete Trip Management Workflow

## Step 1: Register Events Officer

### Request
```
POST http://localhost:4000/api/auth/register
```

### Headers
```
Content-Type: application/json
```

### Body (raw JSON)
```json
{
  "name": "Events Manager",
  "email": "events@example.com",
  "password": "password123",
  "role": "eventOfficer"
}
```

### Expected Response
```json
{
  "message": "User registered successfully",
  "user": {
    "name": "Events Manager",
    "email": "events@example.com",
    "role": "eventOfficer"
  }
}
```

## Step 2: Login as Events Officer

### Request
```
POST http://localhost:4000/api/auth/login
```

### Headers
```
Content-Type: application/json
```

### Body (raw JSON)
```json
{
  "email": "events@example.com",
  "password": "password123"
}
```

### Expected Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjFhMmIzYzRkNWU2ZjdnOGg5aTBqMSIsIm5hbWUiOiJFdmVudHMgTWFuYWdlciIsImVtYWlsIjoiZXZlbnRzQGV4YW1wbGUuY29tIiwicm9sZSI6ImV2ZW50T2ZmaWNlciIsImlhdCI6MTcwOTQ4MjQwMCwiZXhwIjoxNzA5NTY4ODAwfQ.example_signature",
  "user": {
    "name": "Events Manager",
    "email": "events@example.com",
    "role": "eventOfficer"
  }
}
```

**⚠️ IMPORTANT: Copy the entire token value (everything after "token": ") - you'll need it for all subsequent requests!**

## Step 3: Create a Trip

### Request
```
POST http://localhost:4000/api/event/
```

### Headers
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjFhMmIzYzRkNWU2ZjdnOGg5aTBqMSIsIm5hbWUiOiJFdmVudHMgTWFuYWdlciIsImVtYWlsIjoiZXZlbnRzQGV4YW1wbGUuY29tIiwicm9sZSI6ImV2ZW50T2ZmaWNlciIsImlhdCI6MTcwOTQ4MjQwMCwiZXhwIjoxNzA5NTY4ODAwfQ.example_signature
```

### Body (raw JSON)
```json
{
  "type": "trip",
  "title": "Spring Break Adventure",
  "location": "Sharm El Sheikh",
  "price": 2500,
  "startDate": "2024-03-15T08:00:00Z",
  "endDate": "2024-03-17T18:00:00Z",
  "desc": "3-day adventure trip with diving and beach activities",
  "capacity": 25,
  "registrationDeadline": "2024-03-10T23:59:59Z"
}
```

### Expected Response
```json
{
  "message": "trip created successfully",
  "event": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Spring Break Adventure",
    "location": "Sharm El Sheikh",
    "price": 2500,
    "capacity": 25,
    "startDate": "2024-03-15T08:00:00.000Z",
    "endDate": "2024-03-17T18:00:00.000Z",
    "registrationDeadline": "2024-03-10T23:59:59.000Z",
    "desc": "3-day adventure trip with diving and beach activities",
    "status": "pending",
    "organizerId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "type": "trip"
  }
}
```

**⚠️ IMPORTANT: Copy the `_id` from this response - you'll need it for editing!**

## Step 4: View All Events

### Request
```
GET http://localhost:4000/api/event/
```

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Expected Response
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Spring Break Adventure",
    "type": "trip",
    "status": "pending",
    "location": "Sharm El Sheikh",
    "price": 2500,
    "capacity": 25
  }
]
```

## Step 5: Edit Trip Details (Before Start Date)

### Request
```
PATCH http://localhost:4000/api/event/64f1a2b3c4d5e6f7g8h9i0j1
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Body (raw JSON) - Update multiple fields
```json
{
  "price": 2200,
  "capacity": 30,
  "desc": "Updated: 3-day adventure trip with diving, beach activities, and desert safari",
  "registrationDeadline": "2024-03-12T23:59:59Z"
}
```

### Expected Response
```json
{
  "message": "Event updated successfully",
  "event": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Spring Break Adventure",
    "price": 2200,
    "capacity": 30,
    "desc": "Updated: 3-day adventure trip with diving, beach activities, and desert safari",
    "registrationDeadline": "2024-03-12T23:59:59.000Z",
    "status": "pending"
  }
}
```

## Step 6: Test Trip Editing Restriction (After Start Date)

### Create a Trip with Past Start Date
```json
{
  "type": "trip",
  "title": "Past Trip Test",
  "location": "Cairo",
  "price": 500,
  "startDate": "2023-01-01T08:00:00Z",
  "endDate": "2023-01-03T18:00:00Z",
  "desc": "This trip has already started",
  "capacity": 10,
  "registrationDeadline": "2022-12-25T23:59:59Z"
}
```

### Try to Edit the Past Trip
```
PATCH http://localhost:4000/api/event/PAST_TRIP_ID
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Body
```json
{
  "price": 400
}
```

### Expected Response (Error)
```json
{
  "error": "Trip has already started and cannot be edited."
}
```

## Step 7: Test Validation Errors

### Test Missing Required Fields
```json
{
  "type": "trip",
  "title": "Incomplete Trip"
  // Missing: location, price, startDate, endDate, capacity, registrationDeadline
}
```

### Expected Response
```json
{
  "error": "\"location\" is required"
}
```

### Test Invalid Capacity
```json
{
  "type": "trip",
  "title": "Invalid Capacity Trip",
  "location": "Alexandria",
  "price": 1000,
  "startDate": "2024-04-01T08:00:00Z",
  "endDate": "2024-04-03T18:00:00Z",
  "desc": "Test trip",
  "capacity": 0,
  "registrationDeadline": "2024-03-25T23:59:59Z"
}
```

### Expected Response
```json
{
  "error": "\"capacity\" must be greater than or equal to 1"
}
```

## Step 8: Test Authorization

### Try Creating Trip Without Token
```
POST http://localhost:4000/api/event/
```

### Headers
```
Content-Type: application/json
// No Authorization header
```

### Expected Response
```json
{
  "message": "Missing token"
}
```

### Try Creating Trip with Wrong Role (Register as Student)
```json
{
  "name": "Student User",
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}
```

### Then Try Creating Trip
### Expected Response
```json
{
  "message": "Forbidden: requires Events Officer role"
}
```

## Postman Collection Setup Tips

1. **Environment Variables**: Create environment variables for:
   - `base_url`: `http://localhost:4000`
   - `token`: Your JWT token
   - `trip_id`: Trip ID for editing

2. **Pre-request Scripts**: Add this to automatically set the Authorization header:
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.environment.get('token')
   });
   ```

3. **Tests**: Add these tests to verify responses:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has event data", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('event');
   });
   ```

## Common Issues & Solutions

1. **401 Unauthorized**: Check if token is valid and properly formatted
2. **403 Forbidden**: Ensure user has `eventOfficer` role
3. **400 Bad Request**: Check required fields and data types
4. **404 Not Found**: Verify trip ID exists and is correct
5. **500 Server Error**: Check server logs for database connection issues

## Test Scenarios Summary

✅ **Register Events Officer**
✅ **Login and get token**
✅ **Create trip with all required fields**
✅ **Edit trip before start date** 
❌ **Edit trip after start date** (should fail)
❌ **Create trip without required fields** (should fail)
❌ **Create trip without Events Officer role** (should fail)
✅ **View all events**
✅ **Authorization testing**

This guide covers the complete trip management workflow from login to testing all functionality!

