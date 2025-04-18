"use client";

import { useCatalog } from "@/hooks/use-catalog";

import Page from "@/components/elements/Page/Page";
import CatalogSection from "@/components/layout/sections/CatalogSection/CatalogSection";
import CreateAlertSection from "@/components/layout/sections/ManageAlertsSections/CreateAlertSection";

const CoursePage = ({ course }) => {
  const { selectedSessions, toggleSession } = useCatalog();

  return (
    <Page includeBackButton>
      <CatalogSection
        course={course}
        selectedSessions={selectedSessions}
        toggleSession={toggleSession}
      />
      <CreateAlertSection course={course} selectedSessions={selectedSessions} />
    </Page>
  );
};

export default CoursePage;
