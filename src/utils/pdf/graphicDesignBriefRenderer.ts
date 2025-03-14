
import jsPDF from "jspdf";
import { renderClientAndBriefInfo } from "./renderers/clientInfoRenderer";
import { renderCompanyInformation } from "./renderers/companyInfoRenderer";
import { renderLogoPreferences } from "./renderers/logoPreferencesRenderer";
import { renderTargetAudience } from "./renderers/targetAudienceRenderer";
import { renderProductInformation } from "./renderers/productInfoRenderer";
import { renderCompetitors } from "./renderers/competitorsRenderer";
import { renderReferences } from "./renderers/referencesRenderer";
import { renderAdditionalInformation } from "./renderers/additionalInfoRenderer";
import { renderServicesRequired } from "./renderers/servicesRenderer";

export {
  renderClientAndBriefInfo,
  renderCompanyInformation,
  renderLogoPreferences,
  renderTargetAudience,
  renderProductInformation,
  renderCompetitors,
  renderReferences,
  renderAdditionalInformation,
  renderServicesRequired
};
