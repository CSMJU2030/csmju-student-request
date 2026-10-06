DELETE FROM "contact_directory"
WHERE "code" = 'CS_CURRICULUM_CHAIR';

ALTER TABLE "contact_directory"
ADD CONSTRAINT "contact_directory_no_person_copy"
CHECK (
  "person_code" IS NULL
  OR (
    "name" IS NULL
    AND "email" IS NULL
    AND "phone" IS NULL
  )
);
