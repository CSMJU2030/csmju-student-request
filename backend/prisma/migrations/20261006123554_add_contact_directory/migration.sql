-- AlterTable
ALTER TABLE "service_step_contacts" ADD COLUMN     "contact_directory_id" UUID;

-- CreateTable
CREATE TABLE "contact_directory" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255),
    "position" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "phone" VARCHAR(100),
    "email" VARCHAR(255),
    "source_url" TEXT,
    "last_verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contact_directory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_directory_code_key" ON "contact_directory"("code");

-- AddForeignKey
ALTER TABLE "service_step_contacts" ADD CONSTRAINT "service_step_contacts_contact_directory_id_fkey" FOREIGN KEY ("contact_directory_id") REFERENCES "contact_directory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
