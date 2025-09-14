1. Install dependencies for the backend:

Navigate to the backend directory and install the required dependencies using npm:

cd backend
npm install

2. Install dependencies for the frontend:

Navigate to the frontend directory and install the required dependencies using npm:

cd frontend
npm install

3. Configure environment variables:

Create a .env file in the backend folder and add the following environment variables:

MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
PORT=5000

4. Start the backend server:

In the backend directory, run the following command to start the backend server:

cd backend
node api-gateway/index.js


This will start the backend server on http://localhost:5000.

5. Start the frontend server:

In the frontend directory, run the following command to start the frontend server:

cd shims/frontend
npm run dev


This will start the frontend server on http://localhost:3000.

Now you can open http://localhost:3000 in your browser to access the application.