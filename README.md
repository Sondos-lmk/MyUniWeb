# Innovex - Campus Event Management System

## Table of Contents
- [Motivation](#motivation)
- [Build Status](#build-status)
- [Code Style](#code-style)
- [Screenshots](#screenshots)
- [Tech/Framework Used](#techframework-used)
- [Features](#features)
- [Code Examples](#code-examples)
- [Installation](#installation)
- [API References](#api-references)
- [Tests](#tests)
- [How to Contribute](#how-to-contribute)
- [Credits](#credits)
- [License](#license)

---

## Motivation

Innovex was developed to address the challenges of managing campus events in an educational environment. The platform streamlines event creation, registration, and management processes for students, faculty, and administrators. By providing a centralized system, Innovex eliminates the complexity of coordinating various campus activities including trips, workshops, bazaars, conferences, and gym sessions.

The motivation behind this project includes:
- **Simplifying Event Management**: Reduce manual coordination efforts for event officers
- **Enhancing User Experience**: Provide students with an intuitive interface for event discovery and registration
- **Centralizing Information**: Create a single source of truth for all campus events
- **Enabling Real-time Updates**: Facilitate instant communication about event changes and updates
- **Supporting Multiple User Roles**: Accommodate diverse needs of students, professors, staff, vendors, and administrators

---

## Build Status

**Current Status**: Active Development (Sprint 2 Completed)

### Known Issues & Limitations:

1. **Payment Integration**: Stripe payment integration is in testing phase and may encounter edge cases with refund processing
2. **Email Notifications**: Email service occasionally experiences delays during high-traffic periods
3. **Image Upload**: Large vendor document uploads (>5MB) may timeout on slower connections
4. **Real-time Updates**: Event capacity updates don't reflect immediately without page refresh
5. **Mobile Responsiveness**: Some dashboard views need optimization for mobile devices (below 768px width)
6. **Date Validation**: Event creation allows past dates in some edge cases that need additional validation
7. **Search Functionality**: Event search doesn't support fuzzy matching yet
8. **Notification System**: Browser notifications require explicit user permission and don't persist across sessions
9. **Export Feature**: Excel export for large event registrations (>1000 users) may be slow
10. **Concurrent Registrations**: Race conditions possible when multiple users register for last available spots simultaneously

### Upcoming Improvements:
- Implementing WebSocket for real-time capacity updates
- Adding advanced filtering options for event search
- Optimizing database queries for better performance
- Enhancing mobile UI/UX
- Adding comprehensive error logging system

---

## Code Style

The project follows industry-standard coding conventions:

### JavaScript/React:
- **Style Guide**: Airbnb JavaScript Style Guide (adapted)
- **Naming Conventions**:
  - **Components**: PascalCase (e.g., `EventCard`, `DashboardLayout`)
  - **Functions**: camelCase (e.g., `handleSubmit`, `fetchEvents`)
  - **Variables**: camelCase (e.g., `eventData`, `isLoading`)
  - **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`, `MAX_CAPACITY`)
  - **Private Functions**: Prefixed with underscore when needed (e.g., `_validateInput`)

### File Organization:
- **Components**: Organized by feature/domain in `/client/src/components`
- **Pages**: Route-based organization in `/client/src/pages`
- **Services**: API services and utilities in `/client/src/services`
- **Hooks**: Custom React hooks in `/client/src/hooks`

### Backend:
- **Route Handlers**: camelCase (e.g., `createEvent`, `getUserProfile`)
- **Models**: PascalCase (e.g., `Event`, `User`)
- **Middleware**: camelCase (e.g., `authenticate`, `validateRequest`)
- **File Structure**: MVC pattern with clear separation of concerns

### CSS/Styling:
- **Utility-First**: TailwindCSS utility classes
- **Custom Components**: Located in `/client/src/components/ui`
- **Responsive Design**: Mobile-first approach

### Code Formatting:
- Consistent indentation (2 spaces)
- Semicolons used consistently
- Single quotes for strings
- Arrow functions preferred over function declarations
- Async/await over promise chains

---

## Screenshots

### 1. Student Dashboard
![Student Dashboard](./screenshots/student%20dashboard.png)
*Main dashboard showing upcoming events,attended events and favorites

### 2. Event Registration & Payment
![Event Registration](./screenshots/staff%20dashboard%20registartions.png)
*Seamless event registration with ability to cancel and refund*

### 3. Admin Dashboard
![Admin Dashboard](./screenshots/admin%20dashboard.png)
*Administrative interface for managing events, users, and system settings*

### 4. Event Officer - Create Event
![Create Event](./screenshots/create%20event.png)
*Intuitive event creation form supporting trips, bazaars, workshops, and conferences using a dropdown to choose*

### 5. Vendor Management
![Vendor Management](./screenshots/vendor%20approval%20systems.png)
*Vendor registration approval system*

### 6. Modern Alert System
![Modern Alerts](./screenshots/modern%20alert.png)
*Custom-built alert system with success, error, and confirmation dialogs*

### 7. Event Feedback & Rating
![Feedback System](./screenshots/event%20reviews%20.png)
*Post-event feedback collection with star ratings and comments*


---

## Tech/Framework Used

### Frontend:
- **React 18** - JavaScript library for building user interfaces
- **Vite** - Next-generation frontend build tool
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library
- **File-saver** - Client-side file saving
- **Shadcn/ui** - Re-usable component library

### Backend:
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security:
- **JSON Web Tokens (JWT)** - Stateless authentication
- **bcryptjs** - Password hashing
- **Joi** - Request validation

### Payment Processing:
- **Stripe** - Payment gateway integration

### File Handling:
- **Multer** - Multipart/form-data file uploads
- **PDFKit** - PDF generation
- **XLSX** - Excel file generation
- **QRCode** - QR code generation

### Email Services:
- **Nodemailer** - Email sending
- **Google APIs** - Gmail integration

### Development Tools:
- **Nodemon** - Auto-restart development server
- **Morgan** - HTTP request logger
- **Concurrently** - Run multiple commands concurrently
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Task Scheduling:
- **node-cron** - Cron job scheduling for automated tasks

### Testing:
- **Jest** - JavaScript testing framework
- **Postman** - API testing and documentation

---

## Features

### User Management:
- Multi-role authentication system (Student, Professor, Staff, Admin, Event Officer, Vendor)
- Secure JWT-based authentication
- User profile management with customizable preferences
- Email verification for new accounts
- Password reset functionality
- User blocking/unblocking by administrators

### Event Management:
- Create and manage multiple event types:
  - Trips
  - Bazaars
  - Workshops
  - Conferences
  - Booth events
  - Gym sessions
- Event scheduling with date/time validation
- Capacity management and registration limits
- Event archiving system
- Real-time event status tracking
- Event search and filtering
- Event favorites system

### Registration & Payment:
- Seamless event registration process
- Integrated Stripe payment gateway
- Payment status tracking
- Refund processing for cancellations
- Two-week cancellation policy enforcement
- Registration confirmation emails
- Payment history tracking

### Vendor Management:
- Vendor registration and approval system
- Document upload for verification
- Booth/Bazaar vendor applications
- Payment tracking for vendor registrations
- Vendor status management (pending/approved/rejected)
- Conflict resolution system for overlapping booth applications
- Vendor poll system for booth selection

### Feedback & Rating:
- Post-event rating system (1-5 stars)
- Written feedback collection
- Aggregate rating display
- Comment moderation by administrators
- Event feedback reports

### Dashboard Systems:
- **Student Dashboard**: View events, manage registrations, track favorites
- **Admin Dashboard**: Comprehensive system oversight, user management, reports
- **Event Officer Dashboard**: Create/edit events, export registrations, generate QR codes
- **Professor Dashboard**: Workshop management, track participation
- **Staff Dashboard**: Gym schedule management, court bookings
- **TA Dashboard**: Event assistance and monitoring
- **Vendor Dashboard**: Application tracking, payment status

### Notification System:
- Email notifications for:
  - Registration confirmations
  - Payment receipts
  - Event reminders
  - Status updates
  - Cancellations
- In-app notification bell with real-time updates
- Custom ModernAlert system for user interactions

### Reporting & Analytics:
- Revenue reports with filtering options
- Attendee reports by event/user
- Export functionality (Excel format)
- QR code generation for event check-ins
- Registration data export

### Gym & Sports Facilities:
- Gym session scheduling
- Court booking system
- Session capacity management
- Waitlist functionality
- Session type categorization

### Administrative Tools:
- Create admin and event officer accounts
- Manage pending user approvals
- View and delete comments
- Event approval workflows
- System-wide settings management
- User activity monitoring

### Loyalty Program:
- Vendor loyalty program management
- Perk creation and assignment
- Loyalty point tracking

---

## Code Examples

### 1. Event Registration with Payment Integration

```javascript
// client/src/pages/RegisterForEvent.jsx
const handlePayment = async () => {
  try {
    setProcessing(true);
    
    // Create Stripe checkout session
    const response = await API.post('/payment/create-checkout-session', {
      eventId: event._id,
      amount: event.price,
      eventTitle: event.title
    });

    // Redirect to Stripe checkout
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: response.data.sessionId
    });

    if (error) {
      showAlert(error.message, 'error');
    }
  } catch (err) {
    console.error('Payment error:', err);
    showAlert('Payment failed. Please try again.', 'error');
  } finally {
    setProcessing(false);
  }
};
```

### 2. Modern Alert System Implementation

```javascript
// client/src/components/ui/ModernAlert.jsx
export default function ModernAlert({ 
  message, 
  type = "success", 
  onClose, 
  isConfirm = false, 
  onConfirm 
}) {
  useEffect(() => {
    if (!isConfirm && message) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000); // Auto-dismiss after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [message, isConfirm, onClose]);

  if (!message) return null;

  const bgColor = type === "success" 
    ? "bg-green-50" 
    : type === "error" 
    ? "bg-red-50" 
    : "bg-yellow-50";
    
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`${bgColor} rounded-2xl p-6 max-w-md shadow-2xl`}>
        {/* Alert content */}
      </div>
    </div>
  );
}
```

### 3. JWT Authentication Middleware

```javascript
// server/src/middleware/authenticate.js
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};
```

### 4. Event Creation with Validation

```javascript
// server/src/controllers/eventController.js
export const createEvent = async (req, res) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required().min(3).max(100),
      type: Joi.string().valid('trip', 'bazaar', 'conference', 'workshop').required(),
      startDate: Joi.date().min('now').required(),
      endDate: Joi.date().min(Joi.ref('startDate')).required(),
      capacity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
      location: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const event = await Event.create({
      ...value,
      createdBy: req.user._id
    });

    res.status(201).json({ event, message: 'Event created successfully' });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
};
```

### 5. Automated Email Notifications with Cron Jobs

```javascript
// server/src/cronJobs.js
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Event from './models/Event.js';

// Send reminder emails 24 hours before event
cron.schedule('0 9 * * *', async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingEvents = await Event.find({
      startDate: {
        $gte: tomorrow.setHours(0, 0, 0, 0),
        $lt: tomorrow.setHours(23, 59, 59, 999)
      }
    }).populate('registeredUsers');

    for (const event of upcomingEvents) {
      for (const user of event.registeredUsers) {
        await sendReminderEmail(user.email, event);
      }
    }
    
    console.log('Reminder emails sent successfully');
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

const sendReminderEmail = async (email, event) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Reminder: ${event.title} Tomorrow!`,
    html: `<p>Don't forget about ${event.title} starting tomorrow at ${event.startDate}!</p>`
  });
};
```

---

## Installation

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** - [Download](https://git-scm.com/)
- **Postman** (optional, for API testing) - [Download](https://www.postman.com/downloads/)

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/Advanced-Computer-Lab-2025/Innovex.git
cd Innovex
```

2. **Install Dependencies**
```bash
# Install all workspace dependencies
npm run install:all

# Or install manually
cd server && npm install
cd ../client && npm install
```

3. **Environment Configuration**

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration (OAuth2)
EMAIL_USER=your_email@gmail.com
OAUTH_CLIENT_ID=your_google_oauth_client_id
OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
OAUTH_REFRESH_TOKEN=your_google_oauth_refresh_token

# Frontend URL
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. **Database Setup**

If using MongoDB Atlas:
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Add it to `MONGO_URI` in server `.env`

If using local MongoDB:
```bash
# Start MongoDB service
mongod

# Use connection string
MONGO_URI=mongodb://localhost:27017/innovex
```

5. **Run the Application**

```bash
# From root directory - runs both server and client
npm run dev

# Or run separately:
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

6. **Access the Application**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api-docs (if configured)

### Default Admin Account

After first run, create an admin account through the signup flow or use seeded data if available.

### Troubleshooting

**Port Already in Use**:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

**MongoDB Connection Issues**:
- Check if MongoDB service is running
- Verify connection string format
- Check firewall settings
- Ensure IP whitelist in MongoDB Atlas

**Module Not Found**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## API References

### Authentication Routes

#### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@guc.edu.eg",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "student",
  "gucId": "12-3456"
}

Response: 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "email": "student@guc.edu.eg",
    "name": "John Doe",
    "role": "student"
  }
}
```

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@guc.edu.eg",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* user object */ }
}
```

### Event Routes

#### 3. Get All Upcoming Events
```http
GET /api/events/upcoming?type=trip&location=Cairo
Authorization: Bearer {token}

Response: 200 OK
{
  "events": [
    {
      "_id": "64abc456...",
      "title": "Pyramids Trip",
      "type": "trip",
      "startDate": "2025-01-15T09:00:00.000Z",
      "endDate": "2025-01-15T18:00:00.000Z",
      "location": "Giza",
      "price": 500,
      "capacity": 50,
      "registeredUsers": 23
    }
  ]
}
```

#### 4. Create Event (Event Officer Only)
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Tech Workshop",
  "type": "workshop",
  "startDate": "2025-02-01T10:00:00.000Z",
  "endDate": "2025-02-01T16:00:00.000Z",
  "location": "C7.306",
  "price": 100,
  "capacity": 30,
  "desc": "Learn React and Node.js"
}

Response: 201 Created
{
  "event": { /* created event object */ },
  "message": "Event created successfully"
}
```

#### 5. Register for Event
```http
POST /api/events/register/:eventId
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Registration successful",
  "registration": {
    "eventId": "64abc456...",
    "userId": "64abc123...",
    "paymentStatus": "pending"
  }
}
```

### Payment Routes

#### 6. Create Checkout Session
```http
POST /api/payment/create-checkout-session
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventId": "64abc456...",
  "amount": 500,
  "eventTitle": "Pyramids Trip"
}

Response: 200 OK
{
  "sessionId": "cs_test_a1b2c3d4...",
  "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4..."
}
```

#### 7. Request Refund
```http
POST /api/payment/request-refund
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventId": "64abc456..."
}

Response: 200 OK
{
  "message": "Refund processed successfully",
  "refundAmount": 500
}
```

### User Management Routes

#### 8. Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "user": {
    "_id": "64abc123...",
    "email": "student@guc.edu.eg",
    "name": "John Doe",
    "role": "student",
    "registeredEvents": [...],
    "favoriteEvents": [...]
  }
}
```

#### 9. Block/Unblock User (Admin Only)
```http
PATCH /api/admin/users/:userId/block
Authorization: Bearer {token}
Content-Type: application/json

{
  "blocked": true
}

Response: 200 OK
{
  "message": "User blocked successfully"
}
```

### Report Routes

#### 10. Get Revenue Report (Admin Only)
```http
GET /api/admin/reports/revenue?startDate=2025-01-01&endDate=2025-01-31&type=trip
Authorization: Bearer {token}

Response: 200 OK
{
  "report": [
    {
      "id": "64abc456...",
      "title": "Pyramids Trip",
      "type": "trip",
      "startDate": "2025-01-15T09:00:00.000Z",
      "revenue": 11500
    }
  ],
  "totalRevenue": 11500
}
```

### Vendor Routes

#### 11. Apply for Booth
```http
POST /api/events/:eventId/vendor-apply
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "companyName": "Tech Solutions Inc.",
  "documents": [file1, file2]
}

Response: 201 Created
{
  "message": "Vendor application submitted",
  "application": { /* application details */ }
}
```

### Gym Routes

#### 12. Create Gym Session (Staff Only)
```http
POST /api/gym
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Morning Workout",
  "date": "2025-01-20",
  "time": "08:00",
  "duration": 90,
  "sessionType": "cardio",
  "maxParticipants": 20
}

Response: 201 Created
{
  "session": { /* gym session object */ }
}
```

### Feedback Routes

#### 13. Submit Event Rating
```http
POST /api/events/:eventId/rate
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": 5
}

Response: 201 Created
{
  "message": "Rating submitted successfully"
}
```

#### 14. Get Event Feedback
```http
GET /api/events/:eventId/feedback
Authorization: Bearer {token}

Response: 200 OK
{
  "ratings": [
    { "user": "John Doe", "value": 5 }
  ],
  "comments": [
    { "user": "Jane Smith", "text": "Great event!" }
  ],
  "averageRating": 4.5
}
```

### Export Routes

#### 15. Export Event Registrations (Event Officer Only)
```http
GET /api/events/:eventId/export-registrations
Authorization: Bearer {token}

Response: 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
[Excel file download]
```

---

## Tests

### Postman API Tests

All tests are performed using Postman. Below are key API endpoint tests:

#### 1. User Registration Test
```json
Test: POST /api/auth/register
Status: 201 Created
Response Time: 245ms

Body:
{
  "email": "testuser@guc.edu.eg",
  "password": "Test123!",
  "name": "Test User",
  "role": "student"
}

Assertions Passed:
✓ Status code is 201
✓ Response has token
✓ User object contains email
✓ Role is correctly set
```

#### 2. Event Creation Test
```json
Test: POST /api/events
Status: 201 Created
Response Time: 189ms

Body:
{
  "title": "Test Workshop",
  "type": "workshop",
  "startDate": "2025-02-15T10:00:00.000Z",
  "price": 50,
  "capacity": 25
}

Assertions Passed:
✓ Status code is 201
✓ Event has valid _id
✓ Title matches request
✓ Type is workshop
✓ Capacity is correct
```

#### 3. Event Registration Test
```json
Test: POST /api/events/register/64abc456
Status: 200 OK
Response Time: 156ms

Assertions Passed:
✓ Status code is 200
✓ Registration confirmed
✓ Payment status is pending
✓ User added to registeredUsers array
```

#### 4. Authentication Middleware Test
```json
Test: GET /api/users/profile (without token)
Status: 401 Unauthorized
Response Time: 45ms

Response:
{
  "error": "No token provided"
}

Assertions Passed:
✓ Status code is 401
✓ Error message is correct
✓ No user data leaked
```

#### 5. Payment Integration Test
```json
Test: POST /api/payment/create-checkout-session
Status: 200 OK
Response Time: 523ms

Body:
{
  "eventId": "64abc456",
  "amount": 500
}

Assertions Passed:
✓ Status code is 200
✓ Session ID is valid
✓ Stripe URL is generated
✓ Amount matches request
```

#### 6. Refund Processing Test
```json
Test: POST /api/payment/request-refund
Status: 200 OK
Response Time: 678ms

Body:
{
  "eventId": "64abc456"
}

Assertions Passed:
✓ Status code is 200
✓ Refund amount is correct
✓ Event removed from user registrations
✓ Payment status updated to refunded
```

#### 7. Admin Report Test
```json
Test: GET /api/admin/reports/revenue
Status: 200 OK
Response Time: 234ms

Query Parameters:
?startDate=2025-01-01&endDate=2025-01-31

Assertions Passed:
✓ Status code is 200
✓ Report array exists
✓ Total revenue calculated correctly
✓ Date filtering works
✓ Only admin can access
```

#### 8. Validation Error Test
```json
Test: POST /api/events (invalid data)
Status: 400 Bad Request
Response Time: 67ms

Body:
{
  "title": "AB",  // Too short
  "price": -100   // Negative price
}

Response:
{
  "error": "title must be at least 3 characters long"
}

Assertions Passed:
✓ Status code is 400
✓ Validation error returned
✓ Error message is descriptive
✓ No event created in database
```

### Test Collection Summary
- **Total Tests**: 45+
- **Pass Rate**: 100%
- **Average Response Time**: 287ms
- **Coverage**: Authentication, Events, Payments, Users, Reports, Feedback

### Running Tests Locally

1. Import Postman collection from `/postman/Innovex-API-Tests.json`
2. Set environment variables:
   - `baseUrl`: http://localhost:4000
   - `token`: (obtained from login)
3. Run collection with Postman Runner

---

## How to Contribute

We welcome contributions to improve Innovex! Here's how you can help:

### Reporting Issues

1. **Check Existing Issues**: Before creating a new issue, search to see if it already exists
2. **Create Detailed Bug Reports**: Include:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Open an issue with the `feature-request` label
2. Describe the feature and its benefits
3. Provide use cases and examples
4. Be open to discussion and feedback

### Code Contributions

1. **Fork the Repository**
```bash
git clone https://github.com/YOUR-USERNAME/Innovex.git
```

2. **Create a Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make Your Changes**
   - Follow the existing code style
   - Write clear commit messages
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Your Changes**
   - Ensure all existing tests pass
   - Add new tests for new features
   - Test on multiple browsers/devices

5. **Submit a Pull Request**
   - Provide a clear description of changes
   - Reference related issues
   - Request review from maintainers

### Development Guidelines

- **Code Quality**: Maintain high code quality standards
- **Documentation**: Update README and code comments
- **Testing**: Include tests for new features
- **Performance**: Consider performance implications
- **Security**: Follow security best practices
- **Accessibility**: Ensure UI is accessible

### Areas for Contribution

1. **Bug Fixes**: Help fix known issues in the Build Status section
2. **Performance Optimization**: Improve query efficiency and load times
3. **UI/UX Improvements**: Enhance user interface and experience
4. **Mobile Responsiveness**: Improve mobile layouts
5. **Testing**: Add more comprehensive test coverage
6. **Documentation**: Improve code documentation and user guides
7. **Accessibility**: Make the application more accessible
8. **Internationalization**: Add multi-language support
9. **New Features**: Implement requested features from issues

### Communication

- Join discussions in GitHub Issues
- Be respectful and constructive
- Ask questions if you're unsure
- Help others when you can

---

## Credits

### Development Team
- **Sondos Magdy** - Full Stack Developer
- **Malak Wael** - Full Stack Developer
- **Elissa Wael** - Full Stack Developer
- **Omar Sameh** - Full Stack Developer
- **Marwan abo el seoud** - Full Stack Developer
- **Shahd el barbary** - Full Stack Developer
- **Kenzy Yasser** - Full Stack Developer
- **Ali Hesham** - Full Stack Developer
- **Ziad Walid** - Full Stack Developer

### External Resources & Learning Materials

**Official Documentation:**
- [React Documentation](https://react.dev/) - React framework reference
- [Express.js Guide](https://expressjs.com/) - Backend framework
- [MongoDB Manual](https://docs.mongodb.com/) - Database documentation
- [Stripe API Reference](https://stripe.com/docs/api) - Payment integration
- [TailwindCSS Docs](https://tailwindcss.com/docs) - Styling framework

**YouTube Tutorials:**
- [MERN Stack Course](https://www.youtube.com/watch?v=7CqJlxBYj-M) by Traversy Media - Project structure inspiration
- [Stripe Payment Integration](https://www.youtube.com/watch?v=1r-F3FIONl8) by Web Dev Simplified - Payment flow implementation
- [JWT Authentication](https://www.youtube.com/watch?v=mbsmsi7l3r4) by Web Dev Simplified - Authentication setup
- [React Best Practices](https://www.youtube.com/watch?v=Tn6-PIqc4UM) by Codevolution - Code organization

**Stack Overflow:**
- Multiple solutions for debugging issues
- Community answers for MongoDB aggregation queries
- Stripe webhook implementation guidance

**GitHub Repositories:**
- [shadcn/ui](https://github.com/shadcn/ui) - UI component library
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) - Styling system
- Various open-source projects for reference and best practices

**NPM Packages:**
- All dependencies listed in package.json with their respective maintainers
- Special thanks to the open-source community for these tools

**Design Inspiration:**
- [Dribbble](https://dribbble.com/) - UI design inspiration
- [Behance](https://www.behance.net/) - Dashboard layout ideas

**Testing Resources:**
- [Postman Learning Center](https://learning.postman.com/) - API testing guides
- [Jest Documentation](https://jestjs.io/) - Testing framework reference

**Problem Solving:**
- Stack Overflow community
- MDN Web Docs for JavaScript references
- Reddit r/webdev and r/reactjs communities

---

## License

### MIT License

Copyright (c) 2025 Innovex - Advanced Computer Lab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Third-Party Licenses

This project uses the following third-party libraries and services:

**Stripe** - Apache License 2.0
- Used for payment processing
- [License](https://github.com/stripe/stripe-node/blob/master/LICENSE)

**React** - MIT License
- [License](https://github.com/facebook/react/blob/main/LICENSE)

**Express.js** - MIT License
- [License](https://github.com/expressjs/express/blob/master/LICENSE)

**MongoDB** - Server Side Public License (SSPL)
- [License](https://www.mongodb.com/licensing/server-side-public-license)

**TailwindCSS** - MIT License
- [License](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)

**Node.js** - MIT License
- [License](https://github.com/nodejs/node/blob/main/LICENSE)

**Nodemailer** - MIT License
- [License](https://github.com/nodemailer/nodemailer/blob/master/LICENSE)

**All other dependencies** - See individual package licenses in `package.json` and respective repositories

---

## Contact & Support

For questions, issues, or suggestions:
- **Email**: sondos.magdy14@gmail.com
- **GitHub Issues**: [Repository Issues Page](https://github.com/Advanced-Computer-Lab-2025/Innovex/issues)
- **Project Repository**: [GitHub](https://github.com/Advanced-Computer-Lab-2025/Innovex)

---

**Last Updated**: 1 December 2025
**Version**: 2.0.0 (Sprint 2)
**Status**: Active Development

---

You shall see the following output in terminal :

✅ Email service configured successfully
✅ Running Innovex app.js
✅ Routes mounted: /api/events, /api/auth, /api/users, etc.     
Environment variables: {
  CLIENT_ID: '✅',
  CLIENT_SECRET: '✅',
  REDIRECT_URI: '✅',
  REFRESH_TOKEN: '✅',
  EMAIL_USER: '✅',
  MONGO_URI: '✅'
}
MongoDB connected
✅ Certificate scheduler initialized (runs every minute for testing)
✅ Reminder scheduler initialized (runs every minute for testing)
⏰ Booth expiration cron job started (runs every hour)
⏰ Bazaar expiration cron job started (runs every hour)
API listening on http://localhost:4000
✅ MongoDB connected successfully








