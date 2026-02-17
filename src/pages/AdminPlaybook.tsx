import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { adminPlaybookAPI } from '../lib/api';
import toast from 'react-hot-toast';

const emptyModule = { id: '', title: '', slug: '', description: '', order: 0, status: 'DRAFT' };
const emptyLesson = {
  id: '',
  moduleId: '',
  title: '',
  slug: '',
  content: '',
  order: 0,
  estimatedTimeMinutes: 10,
  status: 'DRAFT',
  checklistItemsText: ''
};

export function AdminPlaybook() {
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [moduleForm, setModuleForm] = useState<any>(emptyModule);
  const [lessonForm, setLessonForm] = useState<any>(emptyLesson);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [modulesRes, lessonsRes] = await Promise.all([
        adminPlaybookAPI.listModules(),
        adminPlaybookAPI.listLessons()
      ]);
      setModules(modulesRes.data.data || []);
      setLessons(lessonsRes.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load playbook modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (moduleForm.id) await adminPlaybookAPI.updateModule(moduleForm.id, moduleForm);
      else await adminPlaybookAPI.createModule(moduleForm);
      toast.success('Module saved');
      setModuleForm(emptyModule);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save module');
    }
  };

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const checklistItems = String(lessonForm.checklistItemsText || '')
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((text: string, idx: number) => ({
          text,
          key: text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `item-${idx + 1}`
        }));

      const payload = {
        ...lessonForm,
        checklistItems
      };

      if (lessonForm.id) await adminPlaybookAPI.updateLesson(lessonForm.id, payload);
      else await adminPlaybookAPI.createLesson(payload);
      toast.success('Lesson saved');
      setLessonForm(emptyLesson);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save lesson');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Playbook</h1>

        {loading ? (
          <div className="h-40 bg-white border rounded-xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold text-xl mb-4">Modules</h2>
              <div className="space-y-2">
                {modules.map((m) => (
                  <div key={m._id} className="border rounded px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{m.title}</p>
                        <p className="text-xs text-gray-500">{m.status} • order {m.order}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setModuleForm({ ...m, id: m._id })} className="text-xs border rounded px-2 py-1">Edit</button>
                        <button onClick={async () => { await adminPlaybookAPI.publishModule(m._id); await load(); }} className="text-xs border rounded px-2 py-1">Publish</button>
                      </div>
                    </div>
                  </div>
                ))}
                {modules.length === 0 && <p className="text-sm text-gray-500">No modules yet.</p>}
              </div>
            </div>

            <form onSubmit={saveModule} className="bg-white border rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-xl">{moduleForm.id ? 'Edit Module' : 'Create Module'}</h2>
              <input value={moduleForm.title} onChange={(e) => setModuleForm((s: any) => ({ ...s, title: e.target.value }))} placeholder="Title" className="w-full border rounded px-3 py-2" required />
              <input value={moduleForm.slug} onChange={(e) => setModuleForm((s: any) => ({ ...s, slug: e.target.value }))} placeholder="Slug (optional)" className="w-full border rounded px-3 py-2" />
              <textarea value={moduleForm.description} onChange={(e) => setModuleForm((s: any) => ({ ...s, description: e.target.value }))} placeholder="Description" className="w-full border rounded px-3 py-2 h-24" />
              <input type="number" value={moduleForm.order} onChange={(e) => setModuleForm((s: any) => ({ ...s, order: Number(e.target.value) }))} placeholder="Order" className="w-full border rounded px-3 py-2" />
              <select value={moduleForm.status} onChange={(e) => setModuleForm((s: any) => ({ ...s, status: e.target.value }))} className="w-full border rounded px-3 py-2">
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-nvm-green-600 text-white rounded">Save Module</button>
                <button type="button" onClick={() => setModuleForm(emptyModule)} className="px-4 py-2 border rounded">Clear</button>
              </div>
            </form>

            <div className="space-y-4">
              <form onSubmit={saveLesson} className="bg-white border rounded-xl p-5 space-y-3">
                <h2 className="font-semibold text-xl">{lessonForm.id ? 'Edit Lesson' : 'Create Lesson'}</h2>
                <select value={lessonForm.moduleId} onChange={(e) => setLessonForm((s: any) => ({ ...s, moduleId: e.target.value }))} className="w-full border rounded px-3 py-2" required>
                  <option value="">Select module</option>
                  {modules.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
                <input value={lessonForm.title} onChange={(e) => setLessonForm((s: any) => ({ ...s, title: e.target.value }))} placeholder="Title" className="w-full border rounded px-3 py-2" required />
                <input value={lessonForm.slug} onChange={(e) => setLessonForm((s: any) => ({ ...s, slug: e.target.value }))} placeholder="Slug (optional)" className="w-full border rounded px-3 py-2" />
                <textarea value={lessonForm.content} onChange={(e) => setLessonForm((s: any) => ({ ...s, content: e.target.value }))} placeholder="Content" className="w-full border rounded px-3 py-2 h-24" required />
                <textarea value={lessonForm.checklistItemsText} onChange={(e) => setLessonForm((s: any) => ({ ...s, checklistItemsText: e.target.value }))} placeholder="Checklist items (one per line)" className="w-full border rounded px-3 py-2 h-20" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={lessonForm.order} onChange={(e) => setLessonForm((s: any) => ({ ...s, order: Number(e.target.value) }))} placeholder="Order" className="w-full border rounded px-3 py-2" />
                  <input type="number" value={lessonForm.estimatedTimeMinutes} onChange={(e) => setLessonForm((s: any) => ({ ...s, estimatedTimeMinutes: Number(e.target.value) }))} placeholder="Estimated mins" className="w-full border rounded px-3 py-2" />
                </div>
                <select value={lessonForm.status} onChange={(e) => setLessonForm((s: any) => ({ ...s, status: e.target.value }))} className="w-full border rounded px-3 py-2">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-nvm-green-600 text-white rounded">Save Lesson</button>
                  <button type="button" onClick={() => setLessonForm(emptyLesson)} className="px-4 py-2 border rounded">Clear</button>
                </div>
              </form>

              <div className="bg-white border rounded-xl p-5">
                <h2 className="font-semibold text-xl mb-4">Lessons</h2>
                <div className="space-y-2 max-h-72 overflow-auto">
                  {lessons.map((lesson) => (
                    <div key={lesson._id} className="border rounded px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-xs text-gray-500">{lesson.moduleId?.title || 'Module'} • {lesson.status} • order {lesson.order}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setLessonForm({
                                ...lesson,
                                id: lesson._id,
                                moduleId: lesson.moduleId?._id || lesson.moduleId,
                                checklistItemsText: (lesson.checklistItems || []).map((i: any) => i.text).join('\n')
                              })
                            }
                            className="text-xs border rounded px-2 py-1"
                          >
                            Edit
                          </button>
                          <button onClick={async () => { await adminPlaybookAPI.publishLesson(lesson._id); await load(); }} className="text-xs border rounded px-2 py-1">Publish</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {lessons.length === 0 && <p className="text-sm text-gray-500">No lessons yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
