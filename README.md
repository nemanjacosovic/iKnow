# iKnow

mkdir trivia-game
cd trivia-game
mkdir trivia-api
cd trivia-api

# Initialize Node.js project

npm init -y

# Install dependencies

npm install express cors body-parser pg bcrypt jsonwebtoken dotenv
npm install nodemon --save-dev

# Create the PostgreSQL database

createdb iknowdbs

trivia-api/
├── server.js
├── db.js
├── package.json
├── routes/
│ ├── auth.js
│ ├── categories.js
│ ├── questions.js
│ ├── sets.js
│ └── users.js
└── middleware/
└── auth.js

trivia-admin/
├── public/
│ ├── index.html
│ └── ...
├── src/
│ ├── App.js
│ ├── App.css
│ ├── index.js
│ ├── utils/
│ │ └── api.js
│ └── components/
│ ├── auth/
│ │ ├── Login.js
│ │ └── Register.js
│ ├── layout/
│ │ └── Layout.js
│ ├── dashboard/
│ │ └── Dashboard.js
│ ├── categories/
│ │ ├── Categories.js
│ │ └── CategoryForm.js
│ ├── questions/
│ │ ├── Questions.js
│ │ └── QuestionForm.js
│ ├── sets/
│ │ ├── Sets.js
│ │ └── SetForm.js
│ ├── users/
│ │ ├── Users.js
│ │ └── UserForm.js
│ ├── profile/
│ │ └── Profile.js
│ └── routing/
│ └── PrivateRoute.js
└── package.json
