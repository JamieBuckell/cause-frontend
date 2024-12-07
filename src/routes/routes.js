import DashboardLayout from "src/pages/Dashboard/Layout/DashboardLayout.vue";
import EmptyLayout from "src/pages/Dashboard/Layout/EmptyLayout.vue";
// GeneralViews
import NotFound from "src/pages/GeneralViews/NotFoundPage.vue";
import Unauthorized from "src/pages/GeneralViews/Unauthorized.vue";
import UnexpectedError from "src/pages/GeneralViews/UnexpectedError.vue";
// Dashboard pages
import Overview from "src/pages/Dashboard/Dashboard/Overview.vue";
import DropOff from "src/pages/Dashboard/Dashboard/DropOff.vue";
import Stats from "src/pages/Dashboard/Dashboard/Stats.vue";

// Reporting Pages

import ReportsDropOff from "src/pages/Reporting/DropOff.vue";
import HamperData from "src/pages/Reporting/HamperData.vue";
import FamiliesData from "src/pages/Reporting/FamiliesData.vue";
import DonorsData from "src/pages/Reporting/DonorsData.vue";

// Pages
import User from "src/pages/Dashboard/Pages/UserProfile.vue";
import TimeLine from "src/pages/Dashboard/Pages/TimeLinePage.vue";
import Login from "src/pages/Dashboard/Pages/Login.vue";
import Logout from "src/pages/Dashboard/Pages/Logout.vue";
import SetPassword from "src/pages/Dashboard/Pages/SetPassword.vue";
import ResetPassword from "src/pages/Dashboard/Pages/ResetPassword.vue";
import Lock from "src/pages/Dashboard/Pages/Lock.vue";

import HartlepoolTest from "src/pages/DataFix/HartlepoolTest.vue";
import AllocatedCounts from "src/pages/DataFix/AllocatedCounts.vue";
import AllocatedMismatch from "src/pages/DataFix/AllocatedMismatch.vue";
import FixMissingAllocations from "src/pages/DataFix/FixMissingAllocations.vue";
import FamilyHamperIdMismatch from "src/pages/DataFix/FamilyHamperIdMismatch.vue";
import MissingDonors from "src/pages/DataFix/MissingDonors.vue";
import DonorVerificationFix from "src/pages/DataFix/DonorVerificationFix.vue";

// Components pages
import Buttons from "src/pages/Dashboard/Components/Buttons.vue";
import GridSystem from "src/pages/Dashboard/Components/GridSystem.vue";
import Panels from "src/pages/Dashboard/Components/Panels.vue";
const SweetAlert = () =>
  import("src/pages/Dashboard/Components/SweetAlert.vue");
import Notifications from "src/pages/Dashboard/Components/Notifications.vue";
import Icons from "src/pages/Dashboard/Components/Icons.vue";
import Typography from "src/pages/Dashboard/Components/Typography.vue";

// Forms pages
const RegularForms = () => import("src/pages/Dashboard/Forms/RegularForms.vue");
const ExtendedForms = () =>
  import("src/pages/Dashboard/Forms/ExtendedForms.vue");
const ValidationForms = () =>
  import("src/pages/Dashboard/Forms/ValidationForms.vue");
const Wizard = () => import("src/pages/Dashboard/Forms/Wizard.vue");

// TableList pages
const RegularTables = () =>
  import("src/pages/Dashboard/Tables/RegularTables.vue");
const ExtendedTables = () =>
  import("src/pages/Dashboard/Tables/ExtendedTables.vue");
const PaginatedTables = () =>
  import("src/pages/Dashboard/Tables/PaginatedTables.vue");
// Maps pages
const GoogleMaps = () => import("src/pages/Dashboard/Maps/GoogleMaps.vue");
const FullScreenMap = () =>
  import("src/pages/Dashboard/Maps/FullScreenMap.vue");
const VectorMaps = () => import("src/pages/Dashboard/Maps/VectorMapsPage.vue");

// Calendar
const Calendar = () => import("src/pages/Dashboard/Calendar/CalendarRoute.vue");
// Charts
const Charts = () => import("src/pages/Dashboard/Charts.vue");

const Organisations = () => import("src/pages/Organisations/List.vue");
const OrganisationsAdd = () => import("src/pages/Organisations/Add.vue");
const OrganisationsEdit = () => import("src/pages/Organisations/Edit.vue");
const OrganisationsMe = () => import("src/pages/Organisations/Me.vue");

const Campaigns = () => import("src/pages/Campaigns/List.vue");
const CampaignsView = () => import("src/pages/Campaigns/View.vue");
const CampaignsAdd = () => import("src/pages/Campaigns/Add.vue");

const Donors = () => import("src/pages/Donors/List.vue");
const DonorsRegister = () => import("src/pages/Donors/Register.vue");
const DonorsView = () => import("src/pages/Donors/View.vue");
const SubscriptionVerification = () =>
  import("src/pages/Donors/SubscriptionVerification.vue");
const SubscriberUnsubscribe = () =>
  import("src/pages/Subscribers/Unsubscribe.vue");

const ConfirmPledge = () => import("src/pages/Donors/confirmPledge.vue");

const FeedbackHamper = () => import("src/pages/Families/Feedback.vue");
const FeedbackVolunteer = () => import("src/pages/Volunteers/Feedback.vue");

const Subscribers = () => import("src/pages/Subscribers/List.vue");
const SubscribersView = () => import("src/pages/Subscribers/View.vue");

const AdminUsers = () => import("src/pages/Admin/UsersList.vue");
const AdminUserAdd = () => import("src/pages/Admin/UsersAdd.vue");

const Nominators = () => import("src/pages/Nominators/List.vue");
const NominatorsEdit = () => import("src/pages/Nominators/Edit.vue");
const NominatorsRegister = () => import("src/pages/Nominators/Register.vue");
const NominatorsRegisterSuccess = () =>
  import("src/pages/Nominators/RegisterSuccess.vue");

const Families = () => import("src/pages/Families/List.vue");
const FamiliesEdit = () => import("src/pages/Families/Edit.vue");
const FamiliesAdd = () => import("src/pages/Families/Add.vue");
const AcceptHamper = () => import("src/pages/Families/AcceptHamper.vue");
const CheckHamper = () => import("src/pages/Families/CheckHamper.vue");
const FixMembers = () => import("src/pages/Families/FixMembers.vue");

const Hampers = () => import("src/pages/Hampers/List.vue");
const UndeliveredHampers = () => import("src/pages/Hampers/Undelivered.vue");
const UndeliveredDonors = () => import("src/pages/Donors/Undelivered.vue");
const FeedbackFamilies = () => import("src/pages/Feedback/Families.vue");
const FeedbackVolunteers = () => import("src/pages/Feedback/Volunteers.vue");

const CommunicationsCreate = () =>
  import("src/pages/Communications/Create.vue");
const CommunicationsSentList = () =>
  import("src/pages/Communications/SentList.vue");
const EmailTemplatesList = () =>
  import("src/pages/Communications/EmailTemplatesList.vue");
const HamperRefsCheck = () => import("src/pages/DataFix/HamperRefsCheck.vue");
const AllocationMismatch = () =>
  import("src/pages/DataFix/AllocationMismatch.vue");
const ExportOrganisationsCustom = () =>
  import("src/pages/DataFix/ExportOrganisationsCustom.vue");

let dataMenu = {
  path: "/data",
  component: DashboardLayout,
  redirect: "/data/hamper-refs-check",
  children: [
    {
      path: "hamper-refs-check",
      name: "HamperRefsCheck",
      component: HamperRefsCheck,
    },
    {
      path: "allocation-mismatch",
      name: "AllocationMismatch",
      component: AllocationMismatch,
    },
    {
      path: "export-orgs",
      name: "ExportOrganisationsCustom",
      component: ExportOrganisationsCustom,
    },
  ],
};

let componentsMenu = {
  path: "/components",
  component: DashboardLayout,
  redirect: "/components/buttons",
  children: [
    {
      path: "buttons",
      name: "Buttons",
      component: Buttons,
    },
    {
      path: "grid-system",
      name: "Grid System",
      component: GridSystem,
    },
    {
      path: "panels",
      name: "Panels",
      component: Panels,
    },
    {
      path: "sweet-alert",
      name: "Sweet Alert",
      component: SweetAlert,
    },
    {
      path: "notifications",
      name: "Notifications",
      component: Notifications,
    },
    {
      path: "icons",
      name: "Icons",
      component: Icons,
    },
    {
      path: "typography",
      name: "Typography",
      component: Typography,
    },
  ],
};
let formsMenu = {
  path: "/forms",
  component: DashboardLayout,
  redirect: "/forms/regular",
  children: [
    {
      path: "regular",
      name: "Regular Forms",
      component: RegularForms,
    },
    {
      path: "extended",
      name: "Extended Forms",
      component: ExtendedForms,
    },
    {
      path: "validation",
      name: "Validation Forms",
      component: ValidationForms,
    },
    {
      path: "wizard",
      name: "Wizard",
      component: Wizard,
    },
  ],
  meta: {
    requiresAuth: true,
  },
};

let tablesMenu = {
  path: "/table-list",
  component: DashboardLayout,
  redirect: "/table-list/regular",
  children: [
    {
      path: "regular",
      name: "Regular Tables",
      component: RegularTables,
    },
    {
      path: "extended",
      name: "Extended Tables",
      component: ExtendedTables,
    },
    {
      path: "paginated",
      name: "Paginated Tables",
      component: PaginatedTables,
    },
  ],
  meta: {
    requiresAuth: true,
  },
};

let organisationsMenu = {
  path: "/organisations",
  component: DashboardLayout,
  redirect: "/organisations/list",
  children: [
    {
      path: "list",
      name: "View All Organisations",
      component: Organisations,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "add",
      name: "New Organisation",
      component: OrganisationsAdd,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "view/:requestId",
      name: "View Organisation",
      component: OrganisationsEdit,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "me",
      name: "View My Organisation",
      component: OrganisationsMe,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

let nominatorsMenu = {
  path: "/nominators",
  component: DashboardLayout,
  redirect: "/nominators/list",
  children: [
    {
      path: "list",
      name: "View All Nominators",
      component: Nominators,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "view/:requestId",
      name: "View Nominator",
      component: NominatorsEdit,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

let nominatorsRegisterMenu = {
  path: "/register/:requestId/:hashPassword",
  name: "Nominator Register",
  component: NominatorsRegister,
};

let nominatorsRegisterSuccessMenu = {
  path: "/register/success",
  name: "Nominator Register Success",
  component: NominatorsRegisterSuccess,
};

let acceptHamper = {
  path: "/hampers/scan",
  alias: "/volunteers/hampers",
  name: "Hamper Accept",
  component: AcceptHamper,
};

let checkHamper = {
  path: "/hampers/check",
  name: "Check Hamper",
  component: CheckHamper,
};

let dropOffView = {
  path: "/screens/drop-offs",
  name: "DropOffs",
  component: DropOff,
};

let familiesMenu = {
  path: "/families",
  component: DashboardLayout,
  redirect: "/families/list",
  children: [
    {
      path: "list",
      name: "View All Families",
      component: Families,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "add",
      name: "New Family",
      component: FamiliesAdd,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "view/:requestId",
      name: "View Family",
      component: FamiliesEdit,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "fix-members",
      name: "Fix Family Members",
      component: FixMembers,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

let listsMenu = {
  path: "/lists",
  component: DashboardLayout,
  redirect: "/lists/undelivered",
  children: [
    {
      path: "undelivered",
      name: "Undelivered Hampers",
      component: UndeliveredHampers,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "undelivered-donors",
      name: "Undelivered Donors",
      component: UndeliveredDonors,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

let hampersMenu = {
  path: "/hampers",
  component: DashboardLayout,
  redirect: "/hampers/list",
  children: [
    {
      path: "list",
      name: "View All Hampers",
      component: Hampers,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};
let feedbackMenu = {
  path: "/feedback",
  component: DashboardLayout,
  redirect: "/feedback/families",
  children: [
    {
      path: "families",
      name: "View All Family Feedback",
      component: FeedbackFamilies,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "volunteers",
      name: "View All Volunteer Feedback",
      component: FeedbackVolunteers,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

let campaignsMenu = {
  path: "/campaigns",
  component: DashboardLayout,
  redirect: "/campaigns/list",
  children: [
    {
      path: "list",
      name: "View All Campaigns",
      component: Campaigns,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "view/:campaignId",
      name: "View Campaign",
      component: CampaignsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "add",
      name: "New Campaign",
      component: CampaignsAdd,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

let donorsMenu = {
  path: "/donors",
  component: DashboardLayout,
  redirect: "/donors/list",
  children: [
    {
      path: "list",
      name: "View All Donors",
      component: Donors,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "view/:donorId",
      name: "View Donor",
      component: DonorsView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

let subscribersMenu = {
  path: "/subscribers",
  component: DashboardLayout,
  redirect: "/subscribers/list",
  children: [
    {
      path: "list",
      name: "View All Subscribers",
      component: Subscribers,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "view/:subscriberId",
      name: "View Subscriber",
      component: SubscribersView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

let donorsRegisterMenu = {
  path: "/donors/register",
  name: "Donors Register",
  component: DonorsRegister,
};

let pledgeMenu = {
  path: "/pledge",
  name: "Donors Register (Pledge)",
  component: DonorsRegister,
  meta: { skipButton: true },
};

let feedbackHamperMenu = {
  path: "/feedback",
  redirect: "/feedback/hamper",
  name: "Generic Feedback",
  component: EmptyLayout,
  children: [
    {
      path: "hamper/:campaignId",
      name: "Campaign Hamper Feedback",
      component: FeedbackHamper,
    },
    {
      path: "volunteer/:campaignId",
      name: "Volunteer Hamper Feedback",
      component: FeedbackVolunteer,
    },
  ],
};

let donorSubscriptionVerificationMenu = {
  path: "/subscription/verify/:email",
  name: "Subscription Verification",
  component: SubscriptionVerification,
};

let subscriberUnsubscribeMenu = {
  path: "/subscription/unsubscribe/:email/:hash",
  name: "Subscriber Unsubscribe",
  component: SubscriberUnsubscribe,
};

let donorConfirmPledgeMenu = {
  path: "/pledge-confirmation",
  name: "Confirm Pledge",
  component: ConfirmPledge,
};

let communicationsCreateMenu = {
  path: "/communications",
  name: "Communication Centre",
  component: DashboardLayout,
  redirect: "/communications/create",
  children: [
    {
      path: "create",
      name: "Create Communication",
      component: CommunicationsCreate,
    },
    {
      path: "sent",
      name: "Sent Communication",
      component: CommunicationsSentList,
    },
    {
      path: "emails",
      name: "Email Templates",
      component: EmailTemplatesList,
    },
  ],
};

let mapsMenu = {
  path: "/maps",
  component: DashboardLayout,
  redirect: "/maps/google",
  children: [
    {
      path: "google",
      name: "Google Maps",
      component: GoogleMaps,
    },
    {
      path: "full-screen",
      name: "Full Screen Map",
      component: FullScreenMap,
    },
    {
      path: "vector-map",
      name: "Vector Map",
      component: VectorMaps,
    },
  ],
  meta: {
    requiresAuth: true,
  },
};

let pagesMenu = {
  path: "/pages",
  component: DashboardLayout,
  redirect: "/pages/user",
  children: [
    {
      path: "user",
      name: "User Page",
      component: User,
    },
    {
      path: "timeline",
      name: "Timeline Page",
      component: TimeLine,
    },
  ],
  meta: {
    requiresAuth: true,
  },
};

let loginPage = {
  path: "/login",
  name: "Login",
  component: Login,
};

let hartlepoolTestPage = {
  path: "/hartlepool-test",
  name: "HartTest",
  component: HartlepoolTest,
};

let allocatedCountsPage = {
  path: "/fix/allocated-counts",
  name: "AllocatedCountsFix",
  component: AllocatedCounts,
};

let allocatedMismatchPage = {
  path: "/fix/allocated-mismatch",
  name: "AllocatedMismatchFix",
  component: AllocatedMismatch,
};

let fixMissingAllocationsPage = {
  path: "/fix/missing-allocations",
  name: "FixMissingAllocations",
  component: FixMissingAllocations,
};

let fixFamilyHamperIdMismatchPage = {
  path: "/fix/family-hamper-id-mismatch",
  name: "FamilyHamperIdMismatch",
  component: FamilyHamperIdMismatch,
};

let missingDonorsPage = {
  path: "/fix/missing-donations",
  name: "MissingDonorsFix",
  component: MissingDonors,
};

let donorVerificationIssue = {
  path: "/fix/donor-verification",
  name: "DonorsVerificationFix",
  component: DonorVerificationFix,
};

let logoutPage = {
  path: "/logout",
  name: "Logout",
  component: Logout,
};

let setPasswordPage = {
  path: "/set-password",
  name: "SetPassword",
  component: SetPassword,
};

let resetPasswordPage = {
  path: "/reset-password/:emailAddress?/:verificationHash?",
  name: "ResetPassword",
  component: ResetPassword,
};

let lockPage = {
  path: "/lock",
  name: "Lock",
  component: Lock,
  meta: {
    requiresAuth: true,
  },
};

const routes = [
  organisationsMenu,
  nominatorsMenu,
  nominatorsRegisterSuccessMenu,
  nominatorsRegisterMenu,
  acceptHamper,
  checkHamper,
  dropOffView,
  familiesMenu,
  listsMenu,
  hampersMenu,
  feedbackMenu,
  campaignsMenu,
  donorsMenu,
  subscribersMenu,
  feedbackHamperMenu,
  donorsRegisterMenu,
  pledgeMenu,
  donorSubscriptionVerificationMenu,
  subscriberUnsubscribeMenu,
  donorConfirmPledgeMenu,
  communicationsCreateMenu,
  dataMenu,
  componentsMenu,
  formsMenu,
  tablesMenu,
  mapsMenu,
  pagesMenu,
  loginPage,
  hartlepoolTestPage,
  allocatedCountsPage,
  allocatedMismatchPage,
  fixMissingAllocationsPage,
  fixFamilyHamperIdMismatchPage,
  missingDonorsPage,
  donorVerificationIssue,
  logoutPage,
  setPasswordPage,
  resetPasswordPage,
  lockPage,
  {
    path: "/reports",
    component: DashboardLayout,
    redirect: "/reports/dropoff",
    children: [
      {
        path: "dropoff",
        name: "ReportsDropOff",
        component: ReportsDropOff,
      },
      {
        path: "hamper-data",
        name: "HamperData",
        component: HamperData,
      },
      {
        path: "families-data",
        name: "FamiliesData",
        component: FamiliesData,
      },
      {
        path: "donors-data",
        name: "DonorsData",
        component: DonorsData,
      },
    ],
  },
  {
    path: "/admin",
    alias: "/",
    component: DashboardLayout,
    redirect: "/admin/overview",
    children: [
      {
        path: "overview",
        name: "Overview",
        component: Overview,
      },
      {
        path: "stats",
        name: "Stats",
        component: Stats,
      },
      {
        path: "calendar",
        name: "Calendar",
        component: Calendar,
      },
      {
        path: "charts",
        name: "Charts",
        component: Charts,
      },
      {
        path: "users",
        name: "Users",
        component: AdminUsers,
      },
      {
        path: "users/add",
        name: "User Add",
        component: AdminUserAdd,
      },
    ],
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/register",
    redirect: { name: "Login" },
  },
  {
    path: "/register/:requestId",
    redirect: { name: "Login" },
  },
  {
    path: "/error",
    component: DashboardLayout,
    redirect: "/error/access",
    children: [
      {
        path: "access",
        name: "Unauthorized",
        component: Unauthorized,
      },
      {
        path: "unexpected",
        name: "UnexpectedError",
        component: UnexpectedError,
      },
    ],
  },
  { path: "*", component: NotFound },
];

export default routes;
