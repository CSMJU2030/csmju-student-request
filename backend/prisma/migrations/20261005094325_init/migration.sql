-- DropForeignKey
ALTER TABLE "information_reports" DROP CONSTRAINT "information_reports_service_id_fkey";

-- DropForeignKey
ALTER TABLE "service_contacts" DROP CONSTRAINT "service_contacts_service_id_fkey";

-- DropForeignKey
ALTER TABLE "service_documents" DROP CONSTRAINT "service_documents_service_id_fkey";

-- DropForeignKey
ALTER TABLE "service_inputs" DROP CONSTRAINT "service_inputs_service_id_fkey";

-- DropForeignKey
ALTER TABLE "service_links" DROP CONSTRAINT "service_links_service_id_fkey";

-- DropForeignKey
ALTER TABLE "service_steps" DROP CONSTRAINT "service_steps_service_id_fkey";

-- AddForeignKey
ALTER TABLE "service_steps" ADD CONSTRAINT "service_steps_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_documents" ADD CONSTRAINT "service_documents_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_links" ADD CONSTRAINT "service_links_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_contacts" ADD CONSTRAINT "service_contacts_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_inputs" ADD CONSTRAINT "service_inputs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "information_reports" ADD CONSTRAINT "information_reports_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
