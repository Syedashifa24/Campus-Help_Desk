USE campus_help_desk;

ALTER TABLE complaints
ADD COLUMN location VARCHAR(255) NOT NULL;