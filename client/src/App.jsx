import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Resume from './pages/Resume.jsx'
import NotFound from './pages/NotFound.jsx'
import ModulePage from './pages/ModulePage.jsx'
import ResourcePage from './components/resources/ResourcePage.jsx'
import Experiments from './pages/Experiments.jsx'
import ExperimentPage from './pages/ExperimentPage.jsx'
import SubExperimentPage from './pages/SubExperimentPage.jsx'
import Projects from './pages/Projects.jsx'
import StudentPage from './pages/StudentPage.jsx'

const pages = [
  ['modules', 'Modules', 'Course modules with notes and files.', '/modules', 'No modules have been uploaded yet. Check back later.'],
  ['lab-experiments', 'Lab Experiments', 'Experiment write-ups, source files and documents.', '/lab-experiments', 'No lab experiments have been uploaded yet. Check back later.'],
  ['tools', 'Tools', 'Data Science tools with docs and files.', '/tools', 'No tools have been added yet. Check back later.'],
  ['resources', 'Resources', 'Study notes, programming references, and tutorials in one place.', '/resources', 'No resources have been uploaded yet. Check back later.'],
  ['library', 'Digital Library', 'Search and download Data Science material.', '/library', 'No library resources are available yet. Check back later.'],
]
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="resume" element={<Resume />} />
        <Route path="experiments" element={<Experiments />} />
        <Route path="experiment/:id" element={<ExperimentPage />} />
        <Route path="experiment/:experiment/sub/:sub" element={<SubExperimentPage />} />
        <Route path="projects" element={<Projects />} />
        <Route path="student" element={<StudentPage />} />
        {pages.map(([path, title, desc, ep, empty]) => (
          <Route key={path} path={path} element={<ResourcePage title={title} description={desc} endpoint={ep} emptyText={empty} />} />
        ))}
        <Route path="modules/:id" element={<ModulePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
