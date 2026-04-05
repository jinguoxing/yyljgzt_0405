import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SemanticLayout from './layouts/SemanticLayout';
import SemanticInbox from './pages/SemanticInbox';
import SemanticReleases from './pages/SemanticReleases';
import SemanticWorkbench from './pages/SemanticWorkbench';
import SemanticObjects from './pages/SemanticObjects';
import TableUnderstanding from './pages/TableUnderstanding';
import AIOpsLayout from './layouts/AIOpsLayout';
import AIOpsEmployees from './pages/AIOpsEmployees';
import AIOpsEmployeeCreate from './pages/AIOpsEmployeeCreate';
import AIOpsEmployeeDetail from './pages/AIOpsEmployeeDetail';
import AIOpsTasks from './pages/AIOpsTasks';
import AIOpsWorkbench from './pages/AIOpsWorkbench';
import AIOpsWorkbenchRequestDetail from './pages/AIOpsWorkbenchRequestDetail';
import AIOpsEmployeeWorkbench from './pages/AIOpsEmployeeWorkbench';
import AIOpsRuns from './pages/AIOpsRuns';
import AIOpsReplay from './pages/AIOpsReplay';
import AIOpsPolicies from './pages/AIOpsPolicies';
import AIOpsMetrics from './pages/AIOpsMetrics';
import AIOpsDashboard from './pages/AIOpsDashboard';
import GlobalAppShell from './layouts/GlobalAppShell';
import NetworkStudio from './pages/NetworkStudio';
import NetworkCenter from './pages/NetworkCenter';
import LandingPage from './pages/LandingPage';
import NetworkCompose from './pages/NetworkCompose';
import NetworkInbox from './pages/NetworkInbox';
import NetworkPackages from './pages/NetworkPackages';
import NetworkPersonal from './pages/NetworkPersonal';
import NetworkOntology from './pages/NetworkOntology';
import PlaceholderPage from './pages/PlaceholderPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/network" element={<GlobalAppShell />}>
          <Route path="center" element={<NetworkCenter />} />
          <Route path="studio" element={<NetworkStudio />} />
          <Route path="compose" element={<NetworkCompose />} />
          <Route path="inbox" element={<NetworkInbox />} />
          <Route path="packages" element={<NetworkPackages />} />
          <Route path="personal" element={<NetworkPersonal />} />
          <Route path="runs" element={<PlaceholderPage />} />
          <Route path="policy" element={<PlaceholderPage />} />
          <Route path="ontology" element={<NetworkOntology />} />
          <Route path="*" element={<Navigate to="studio" replace />} />
        </Route>
        <Route path="/semantic" element={<SemanticLayout />}>
          <Route path="inbox" element={<SemanticInbox />} />
          <Route path="releases" element={<SemanticReleases />} />
          <Route path="workbench" element={<SemanticWorkbench />} />
          <Route path="workbench/:lvId" element={<SemanticWorkbench />} />
          <Route path="objects/:lvId" element={<SemanticObjects />} />
          <Route path="table-understanding/:lvId" element={<TableUnderstanding />} />
        </Route>
        <Route path="/aiops" element={<AIOpsLayout />}>
          <Route path="dashboard" element={<AIOpsDashboard />} />
          <Route path="workbench" element={<AIOpsWorkbench />} />
          <Route path="workbench/requests/:requestId" element={<AIOpsWorkbenchRequestDetail />} />
          <Route path="workbench/requests/:requestId/stages/:stageId" element={<AIOpsWorkbenchRequestDetail />} />
          <Route path="employee-workbench" element={<AIOpsEmployeeWorkbench />} />
          <Route path="employees" element={<AIOpsEmployees />} />
          <Route path="employees/new" element={<AIOpsEmployeeCreate />} />
          <Route path="employees/:employeeId" element={<AIOpsEmployeeDetail />} />
          <Route path="tasks" element={<AIOpsTasks />} />
          <Route path="runs" element={<AIOpsRuns />} />
          <Route path="replay" element={<AIOpsReplay />} />
          <Route path="policies" element={<AIOpsPolicies />} />
          <Route path="metrics" element={<AIOpsMetrics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
