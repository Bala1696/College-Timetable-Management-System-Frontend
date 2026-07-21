import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TimetableGrid from '../components/TimetableGrid';
import { ChevronLeft, Layout, Filter, Download, Printer } from 'lucide-react';
import Button from '../components/ui/Button';

export default function MasterTimetable() {
    const navigate = useNavigate();
    const [timetableData, setTimetableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deptName, setDeptName] = useState('');

    useEffect(() => {
        const initializeView = async () => {
            try {
                const statsRes = await api.get('/admin/stats');
                if (statsRes.data?.departmentName) {
                    setDeptName(statsRes.data.departmentName);
                }
            } catch (e) {
                console.log("Stats fetch failed");
            }
            fetchMasterData();
        };
        initializeView();
    }, []);

    const fetchMasterData = async () => {
        setLoading(true);
        try {
            // Backend now automatically scopes to the user's department
            const response = await api.get(`/timetables`);
            setTimetableData(response.data);
        } catch (error) {
            console.error('Error fetching master timetable:', error);
        } finally {
            setLoading(false);
        }
    };


    // Grouping logic: groupedData[semester][section] = [entries]
    const groupedData = timetableData.reduce((acc, entry) => {
        const sem = entry.semester;
        const sec = entry.section;
        if (!acc[sem]) acc[sem] = {};
        if (!acc[sem][sec]) acc[sem][sec] = [];
        acc[sem][sec].push(entry);
        return acc;
    }, {});

    const semesters = Object.keys(groupedData).sort();

    return (
        <div className="min-h-screen bg-[#fafbfc] pb-24 pt-28 px-4 md:px-12 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-1 p-2 bg-white hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-primary-600 shadow-sm border border-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            {deptName && (
                                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-2">
                                    🏛️ {deptName} View
                                </div>
                            )}
                            <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Master Timetable</h1>
                            <p className="text-gray-500 text-sm">Consolidated view of all semesters and sections for your department</p>
                        </div>
                    </div>
                </div>

                {loading ? (

                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-gray-500 font-medium italic">Assembling master schedule...</p>
                    </div>
                ) : timetableData.length === 0 ? (
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                                <span className="text-sm text-gray-500 font-medium italic">Empty Timetable View</span>
                            </div>
                            <div className="transform transition-all">
                                <TimetableGrid timetableData={[]} isEditable={false} />
                            </div>
                        </div>
                    </div>
                ) : (

                    <div className="space-y-16">
                        {semesters.map(sem => (
                            <div key={sem} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black text-gray-800 bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-100 italic">
                                        Semester {sem}
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                                </div>

                                <div className="space-y-12">
                                    {Object.keys(groupedData[sem]).sort().map(sec => (
                                        <div key={sec} className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm shadow-lg shadow-indigo-200">{sec}</span>
                                                    Section {sec}
                                                </h3>
                                            </div>
                                            <div className="transform transition-all active:scale-[0.998]">
                                                <TimetableGrid
                                                    timetableData={groupedData[sem][sec]}
                                                    isEditable={false}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
                }
            </div >

            {/* Sticky Floating Print Action */}
            < div className="fixed bottom-8 right-8 z-50" >
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-black transition-all hover:-translate-y-1 active:translate-y-0"
                >
                    <Printer className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">Print Master View</span>
                </button>
            </div >
        </div >
    );
}
