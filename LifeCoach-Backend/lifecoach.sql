CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    weight_goal VARCHAR(100) CHECK(weight_goal IN('gain','maintain','lose')),
    age INT,
    gender VARCHAR(10),
    weight DECIMAL,
    height DECIMAL,
    health_conditions TEXT[],
    allergies TEXT[],
    budget VARCHAR(100) CHECK(budget IN ('Low','medium','high')),
    location VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('user', 'instructor', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    meal_time TIMESTAMP NOT NULL,
    description TEXT,
    calories DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ingredients TEXT[] NOT NULL,
    instructions TEXT NOT NULL,
    calories DECIMAL,
    cuisine_type VARCHAR(50),       
    suitable_for TEXT[],             
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE instructors (
    instructor_id INT PRIMARY KEY,
    users_id INT REFERENCES users(user_id),
    specialization TEXT,
    coaching_mode VARCHAR(20) CHECK (coaching_mode IN ('onsite', 'remote', 'both')),
    bio TEXT,
    available_locations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    instructor_id INTEGER REFERENCES Instructors(instructor_id) ON DELETE SET NULL,
    date DATE NOT NULL,
    plan JSONB,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'missed')),
    notes TEXT
);

CREATE TABLE ProgressLogs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight FLOAT,
    workout_done BOOLEAN DEFAULT false,
    meals_logged BOOLEAN DEFAULT false,
    current_streak INTEGER DEFAULT 0
);

CREATE TABLE Messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CommunityPosts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    likes INTEGER[] DEFAULT '{}',
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    permissions TEXT[],
    last_login TIMESTAMP
);

CREATE TABLE chathistory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  question TEXT,
  answer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  type TEXT, -- e.g., "workout", "streak", "message", "community", "admin"
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN updated_at TIMESTAMP;

ALTER TABLE meal_logs
ALTER COLUMN meal_time TYPE TIME;

ALTER TABLE instructors RENAME COLUMN users_id TO user_id;


-- Drop the current column and recreate with SERIAL
ALTER TABLE instructors
ALTER COLUMN instructor_id DROP DEFAULT

ALTER TABLE instructors ALTER COLUMN instructor_id TYPE SERIAL;


CREATE SEQUENCE instructors_instructor_id_seq;

ALTER TABLE instructors
ALTER COLUMN instructor_id SET DEFAULT nextval('instructors_instructor_id_seq');

SELECT setval('instructors_instructor_id_seq', COALESCE(MAX(instructor_id), 1))
FROM instructors;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';


ALTER TABLE users
ADD COLUMN role_id integer

CREATE TABLE user_roles(
    role_name VARCHAR(100),
    role_id SERIAL PRIMARY KEY
    )

ALTER TABLE users
    ADD CONSTRAINT fk_user_role FOREIGN KEY(role_id)
    REFERENCES user_roles(role_id) ON DELETE SET NULL;

ALTER TABLE users
DROP COLUMN role

INSERT INTO user_roles (role_name) 
VALUES 
  ('Admin'),
  ('User'),
  ('Instructor');


INSERT INTO user_roles(role_name)
VALUES
('dietician')


CREATE TABLE dieticians (
    dietician_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    certification VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    years_of_experience INT,
    contact_number VARCHAR(20),
    clinic_name VARCHAR(255),
    clinic_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dieticians
DROP COLUMN Contact_number


ALTER TABLE users
ADD COLUMN contact VARCHAR(20)

ALTER TABLE dieticians
DROP COLUMN certification