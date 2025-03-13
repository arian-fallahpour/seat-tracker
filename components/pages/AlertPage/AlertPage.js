"use client";

import { useCatalog } from "@/hooks/use-catalog";

import Page from "@/components/elements/Page/Page";
import CatalogSection from "@/components/layout/sections/CatalogSection/CatalogSection";
import EditAlertSection from "@/components/layout/sections/EditAlertSection/EditAlertSection";

const AlertPage = ({ alert }) => {
  const { selectedSessions, toggleSession } = useCatalog(alert.sections);

  return (
    <Page includeHomeButton>
      <CatalogSection
        course={alert.course}
        selectedSessions={selectedSessions}
        toggleSession={toggleSession}
      />
      <EditAlertSection alert={alert} selectedSessions={selectedSessions} />
    </Page>
  );
};

export default AlertPage;
