import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Dashboard } from './components/Dashboard';
import { LessonPage } from './components/LessonPage';
import { SearchPage } from './components/SearchPage';
import { ProjectPage } from './components/ProjectPage';
import { ProgressProvider } from './store/progress';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ProgressProvider><BrowserRouter><Routes><Route element={<AppShell />}><Route path="/" element={<Dashboard />} /><Route path="/learn/:lessonId" element={<LessonPage />} /><Route path="/project" element={<ProjectPage />} /><Route path="/project/:customerId" element={<ProjectPage />} /><Route path="/search" element={<SearchPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></BrowserRouter></ProgressProvider></React.StrictMode>);
