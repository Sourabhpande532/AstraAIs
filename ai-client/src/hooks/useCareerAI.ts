import { useState } from 'react';
import api from '../lib/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export const useCareerAI = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [roadmapForm, setRoadmapForm] = useState({ role: '', skillLevel: 'Beginner', timeline: '6' });
  const [interviewForm, setInterviewForm] = useState({ role: '', experience: '0', skills: '' });
  const [knowledgeForm, setKnowledgeForm] = useState({ question: '' });
  const [plannerForm, setPlannerForm] = useState({ prompt: '' });

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.token}` }
  });

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/api/career/roadmap', roadmapForm, getHeaders());
      setResult({ type: 'roadmap', data: res.data });
    } catch (err: any) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/api/career/interview', interviewForm, getHeaders());
      setResult({ type: 'interview', data: res.data });
    } catch (err: any) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/api/career/knowledge', knowledgeForm, getHeaders());
      setResult({ type: 'knowledge', data: res.data });
    } catch (err: any) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgenticPlanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/api/career/planner', plannerForm, getHeaders());
      setResult({ type: 'planner', data: res.data });
    } catch (err: any) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    setResult,
    roadmapForm,
    setRoadmapForm,
    interviewForm,
    setInterviewForm,
    knowledgeForm,
    setKnowledgeForm,
    plannerForm,
    setPlannerForm,
    handleGenerateRoadmap,
    handleSimulateInterview,
    handleAskKnowledge,
    handleAgenticPlanner,
  };
};
