-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "person_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "maiden_name" TEXT,
    "gender" TEXT NOT NULL,
    "birth_date" DATETIME,
    "birth_place" TEXT,
    "death_date" DATETIME,
    "death_place" TEXT,
    "biography" TEXT,
    "profession" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "profile_photo_url" TEXT,
    "is_alive" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT,
    CONSTRAINT "persons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parent_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "relationships_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "persons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "relationships_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "persons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "unions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "person1_id" TEXT NOT NULL,
    "person2_id" TEXT NOT NULL,
    "union_type" TEXT NOT NULL,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unions_person1_id_fkey" FOREIGN KEY ("person1_id") REFERENCES "persons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "unions_person2_id_fkey" FOREIGN KEY ("person2_id") REFERENCES "persons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "person_id" TEXT,
    "media_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "date_taken" DATETIME,
    "uploaded_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "media_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "x_position" REAL NOT NULL,
    "y_position" REAL NOT NULL,
    CONSTRAINT "media_tags_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "person_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" DATETIME,
    "location" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "persons_last_name_first_name_idx" ON "persons"("last_name", "first_name");

-- CreateIndex
CREATE INDEX "persons_birth_date_idx" ON "persons"("birth_date");

-- CreateIndex
CREATE INDEX "relationships_parent_id_idx" ON "relationships"("parent_id");

-- CreateIndex
CREATE INDEX "relationships_child_id_idx" ON "relationships"("child_id");

-- CreateIndex
CREATE INDEX "unions_person1_id_person2_id_idx" ON "unions"("person1_id", "person2_id");
