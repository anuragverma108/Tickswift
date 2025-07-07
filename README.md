# TickSwift – Smart Service Desk Solution

TickSwift is a modern, real-time service desk web app built with **React**, **Tailwind CSS**, and **Firebase**. It supports user and admin workflows, premium ticketing with Razorpay payments, and a beautiful dark UI.

---

## 🚀 Features

### 1. **Authentication**
- **Email/Password Sign Up & Login**
- **Google Sign-In** (OAuth)
- **Role-based Routing**: Users and admins are redirected to their respective dashboards after login.
- **Logout**: Securely ends the session.

### 2. **User Dashboard**
- **Stats Cards**: See counts of open, in-progress, resolved, and urgent tickets.
- **Recent Tickets**: View your latest 3 tickets in real time.
- **Quick Actions**: Create ticket, live chat, team support.

### 3. **Raise Ticket**
- **Form with Validation**: Title, category, priority, description, and file attachment.
- **File Upload**: Attach screenshots or documents (stored in Firebase Storage).
- **Premium Ticket Option**:  
  - Checkbox to “Mark as Premium (₹49)”
  - If checked, triggers Razorpay payment.
  - On success, stores `paymentId` and marks ticket as `isPremium: true`.
- **Real-Time Submission**: Ticket appears instantly in your dashboard and “My Tickets”.

### 4. **My Tickets**
- **Live List**: See all your tickets, updated in real time.
- **Status & Priority Badges**: Color-coded for clarity.
- **Attachment Links**: Download/view uploaded files.

### 5. **Admin Panel**
- **View All Tickets**: Real-time list of all tickets in the system.
- **Filtering & Search**: Filter by status, priority, category, or search by title/ID.
- **Ticket Details Modal**:  
  - Assign to agent/user (with live user search)
  - Change status (Open, In Progress, Resolved)
  - Add comments (with author and timestamp)
  - View all comments and assignment history
- **Role-Based Access**: Only admins can access this panel and perform admin actions.

### 6. **Razorpay Integration**
- **Premium Ticket Payment**:  
  - Secure Razorpay checkout for premium support.
  - Test key used for development (no KYC required).
  - Payment ID stored with ticket for audit.

### 7. **Firebase Integration**
- **Authentication**: Secure, real-time user management.
- **Firestore**:  
  - Tickets and users stored in collections.
  - Real-time listeners for instant UI updates.
- **Storage**: File uploads for ticket attachments.
- **Role Management**: User roles (user/admin) stored in Firestore and used for routing and access control.

### 8. **Security & Best Practices**
- **Environment Variables**: All sensitive config (Firebase, Razorpay) loaded from `.env` (never pushed to git).
- **.gitignore**: Ensures secrets and local files are never committed.
- **Production-Ready**: Linter warnings/errors fixed, code organized, and ready for deployment.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Heroicons, react-router-dom
- **Backend/Realtime**: Firebase (Auth, Firestore, Storage)
- **Payments**: Razorpay (test mode for dev)
- **State Management**: React Context API

---

## ⚡ Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/tickswift.git
   cd tickswift
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the project root:
     ```
     REACT_APP_FIREBASE_API_KEY=your_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```
   - (Optional) Add your Razorpay key if you switch from the public test key.

4. **Start the app**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🔒 Security Notes

- **Never commit your `.env` file** (it’s in `.gitignore`).
- For production, update your Firestore security rules to restrict access by user and role.
- Use your own Razorpay live key for real payments (after KYC).

---

## 📦 Deployment

- Deploy the `build/` folder to Vercel, Netlify, Firebase Hosting, or your preferred static host.
- Set environment variables in your hosting dashboard.

---

## 🙌 Credits

- Built with [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Firebase](https://firebase.google.com/), and [Razorpay](https://razorpay.com/).
- UI inspired by modern SaaS dashboards.

---

## 📄 License

MIT

---

**Enjoy using TickSwift! If you have questions or want to contribute, open an issue or pull request.**
