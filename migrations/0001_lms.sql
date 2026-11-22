-- Minimal LMS: LTI 1.1 tools, the activities that launch them, and the grades they return.
CREATE TABLE tool (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  consumer_key TEXT NOT NULL UNIQUE,
  shared_secret TEXT NOT NULL
);

CREATE TABLE activity (
  id INTEGER PRIMARY KEY,
  tool_id INTEGER NOT NULL REFERENCES tool (id),
  title TEXT NOT NULL,
  launch_url TEXT NOT NULL
);

-- Written at each launch, because an outcome request names a person only by sourcedid.
CREATE TABLE person (
  sub TEXT PRIMARY KEY,
  email TEXT NOT NULL
);

-- LTI 1.1 scores are a fraction from 0.0 to 1.0.
CREATE TABLE grade (
  activity_id INTEGER NOT NULL REFERENCES activity (id),
  person_sub TEXT NOT NULL REFERENCES person (sub),
  score REAL NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (activity_id, person_sub)
);
