### **Live Link**
https://vox-gauge.vercel.app/conversations

### **State Management Approach**
This project uses **React Context API** to manage authentication and conversations globally.  

- **AuthContext** manages user authentication (login, logout, and session persistence).  
- **ConversationsContext** manages the conversation list and allows adding new conversations.  
- **useContext Hook** is used in components to access these states easily.  

---

### **Setup Instructions**
1. Install dependencies:  
   ```bash
   npm install
   ```
2. Start the development server:  
   ```bash
   npm run dev
   ```
3. Open the app in the browser at `http://localhost:5173`.

## **📌 Component Structure Overview**
### **🛠 Project Folder Structure**
```
/src
  ├── /components
  │   ├── Sidebar.jsx
  │   ├── Navbar.jsx
  │   ├── Login.jsx
  │   ├── ConversationsList.jsx
  │   ├── AddConversation.jsx
  │
  ├── /context
  │   ├── AuthContext.js
  │   ├── ConversationsContext.js
  │
  ├── /data
  │   ├── users.js
  │   ├── conversations.js
  │
  ├── App.jsx
  ├── main.jsx
```
### **Component Structure Overview**
#### **1. `AuthContext.js`**
- Stores user authentication state.
- Persists login session using `localStorage`.
- Provides `setUser` and `logout` functions.

#### **2. `ConversationsContext.js`**
- Manages the list of conversations.
- Allows adding new conversations dynamically.

#### **3. `Login.jsx`**
- Renders a login form.
- Validates user credentials from `users.js`.
- On successful login, sets the user state and redirects to conversations.

#### **4. `Sidebar.jsx`**
- Displays navigation links.
- Highlights the active route.

#### **5. `Navbar.jsx`**
- Displays logged-in user details.
- Includes a logout button.

#### **6. `ConversationsList.jsx`**
- Fetches and displays conversations from `ConversationsContext`.
- Clicking a conversation expands its summary and transcript.

#### **7. `AddConversation.jsx`**
- Provides a form to add new conversations.

---

### **Flow: From Login to Conversations with Filtering**
1. **Login:**  
   - User enters credentials.  
   - If valid, `AuthContext` stores user data.  
   - Redirects to `/conversations`.

2. **Conversations List:**  
   - Fetches conversations from `ConversationsContext`.  
   - Displays conversation details.  
   - Clicking expands a conversation to show summary and transcript.

3. **Filtering (Future Expansion):**  
   - A search bar or filter button allows filtering conversations based on tags, owner, or talk ratio.  
   - Filters update the displayed list dynamically.

This setup ensures authentication, state management, and dynamic updates in a modular structure.