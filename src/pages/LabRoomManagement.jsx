import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Edit2, FlaskConical, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LabRoomManagement = () => {
    const navigate = useNavigate();
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingLab, setEditingLab] = useState(null);
    const [labName, setLabName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLabs();
    }, []);

    const fetchLabs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/labs');
            setLabs(response.data);
        } catch (err) {
            console.error('Failed to fetch labs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingLab) {
                await api.put(`/labs/${editingLab.id}`, { name: labName });
            } else {
                await api.post('/labs', { name: labName });
            }
            setLabName('');
            setEditingLab(null);
            setIsAdding(false);
            fetchLabs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save lab room');
        }
    };

    const handleEdit = (lab) => {
        setEditingLab(lab);
        setLabName(lab.name);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lab room? This will only remove the name from the selection list.')) return;
        try {
            await api.delete(`/labs/${id}`);
            fetchLabs();
        } catch (err) {
            alert('Failed to delete lab room');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-500 hover:text-primary-600 transition-colors bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-orange-600" />
                    Manage Lab Rooms
                </h1>
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingLab) && (
                <Card className="border-orange-100 ring-1 ring-orange-50/50 bg-orange-50/30">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingLab ? 'Edit Laboratory Name' : 'New Laboratory Name'}
                                </label>
                                <input
                                    type="text"
                                    value={labName}
                                    onChange={(e) => setLabName(e.target.value)}
                                    placeholder="e.g. AI & MACHINE LEARNING LAB"
                                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary-500 bg-white outline-none transition-all shadow-sm"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" variant="primary">
                                    {editingLab ? 'Update Lab' : 'Add Lab Room'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingLab(null);
                                        setLabName('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    </form>
                </Card>
            )}

            {!isAdding && !editingLab && (
                <Button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-orange-50 hover:border-orange-200 text-gray-500 hover:text-orange-600 transition-all group"
                >
                    <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-lg">Add New Laboratory Room</span>
                </Button>
            )}

            {/* Labs List */}
            <Card title="Your Department Lab Rooms" subtitle="Click the plus button above to add more laboratory rooms for your department.">
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                ) : labs.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium text-lg">No lab rooms added yet</p>
                        <p className="text-sm">Added labs will appear here and in the timetable dropdown.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {labs.map((lab) => (
                            <div
                                key={lab.id}
                                className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-orange-200 transition-all duration-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <FlaskConical className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-gray-800 uppercase tracking-tight">{lab.name}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(lab)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lab.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                <div className="p-1 bg-blue-500 rounded text-white mt-0.5">
                    <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900 uppercase">Pro Tip</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                        Add all your department's specific laboratory names here.
                        Once added, they will automatically appear in the "Lab Room" dropdown when you add a laboratory entry to the timetable.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LabRoomManagement;
