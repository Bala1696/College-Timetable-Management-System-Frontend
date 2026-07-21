import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Search, BookOpen, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SubjectManagement = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({
        courseCode: '',
        subjectName: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/subjects');
            setSubjects(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (subject = null) => {
        setFormError('');
        if (subject) {
            setEditingSubject(subject);
            setFormData({
                courseCode: subject.courseCode,
                subjectName: subject.subjectName
            });
        } else {
            setEditingSubject(null);
            setFormData({
                courseCode: '',
                subjectName: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubject(null);
        setFormData({ courseCode: '', subjectName: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        try {
            if (editingSubject) {
                await api.put(`/subjects/${editingSubject.id}`, formData);
            } else {
                await api.post('/subjects', formData);
            }
            await fetchSubjects();
            handleCloseModal();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to save subject');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;

        try {
            await api.delete(`/subjects/${id}`);
            await fetchSubjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete subject');
        }
    };

    const filteredSubjects = subjects.filter(sub =>
        sub.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-primary-500 pl-3">Subject Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage Course Codes and Subject Names for your department.</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    variant="primary"
                    icon={Plus}
                    className="shadow-md hover:shadow-lg transition-all"
                >
                    Add Subject
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <BookOpen className="w-5 h-5 text-primary-500" />
                        <span className="font-semibold">{filteredSubjects.length} Subjects Found</span>
                    </div>
                    <div className="w-full md:w-64 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading Subjects...
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div className="p-12 text-center bg-gray-50/30">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Subjects Found</h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                You haven't added any subjects yet. Click "Add Subject" to define course codes for your department.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold border-b border-gray-100 whitespace-nowrap w-24">S.No</th>
                                    <th className="p-4 font-semibold border-b border-gray-100 whitespace-nowrap">Course Code</th>
                                    <th className="p-4 font-semibold border-b border-gray-100 whitespace-nowrap">Subject Name</th>
                                    <th className="p-4 font-semibold border-b border-gray-100 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSubjects.map((sub, idx) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-4 text-sm font-medium text-gray-900">{idx + 1}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                                                {sub.courseCode}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-gray-800">
                                            {sub.subjectName}
                                        </td>
                                        <td className="p-4 text-sm text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(sub)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sub.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary-600" />
                                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Specify the course code and formal subject name.</p>
                        </div>

                        <div className="p-6">
                            {formError && (
                                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Course Code"
                                    required
                                    value={formData.courseCode}
                                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                                    placeholder="e.g. CS101"
                                />
                                <Input
                                    label="Subject Name"
                                    required
                                    value={formData.subjectName}
                                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                                    placeholder="e.g. Introduction to Programming"
                                />

                                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                                    <Button type="button" variant="ghost" onClick={handleCloseModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" isLoading={isSubmitting}>
                                        {editingSubject ? 'Update Subject' : 'Add Subject'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;
