-- CreateTable
CREATE TABLE "service_step_contacts" (
    "id" UUID NOT NULL,
    "step_id" UUID NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "person_name" VARCHAR(255),
    "location" VARCHAR(255),
    "phone" VARCHAR(100),
    "email" VARCHAR(255),
    "guidance" TEXT,
    "action_url" TEXT,
    "action_label" VARCHAR(100),
    "source_url" TEXT,
    "last_verified_at" TIMESTAMPTZ(6),

    CONSTRAINT "service_step_contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_step_contacts" ADD CONSTRAINT "service_step_contacts_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "service_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
